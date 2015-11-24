/* private */
var _options = {
    BREAK_LINE: /(\r\n|\n|\r)/gm,
    accessory: { // todo
        open: "{%",
        close: "%}"
    },
    evaluate: { // todo
        name: 'evaluate',
        open: "<evaluate>",
        close: "</evaluate>"
    },
    staticKey: "static-key", // todo
    staticArray: "static-array" // todo
};

var ParserMode = {
    Text: 'text',
    Tag: 'tag',
    Attr: 'attr',
    CData: 'cdata', //todo, is it need?
    Doctype: 'doctype', //todo, is it need?
    Comment: 'comment', //todo, is it need?
    Script: 'script' //todo, is it need?
};

var Command = {
    elementOpen: 'elementOpen("',
    elementVoid: 'elementVoid("',
    elementOpenStart: 'elementOpenStart("',
    elementOpenEnd: 'elementOpenEnd("',
    elementClose: 'elementClose("',
    text: 'text("',
    attr: 'attr("',
    close: ');'
};

// parse rules
var textSaveTags = ['pre', 'code'];
var voidRequireTags = ['input', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'keygen', 'link', 'meta',
    'param', 'source', 'track', 'wbr'];

// current builder state
var state;
// result builder
var stack;

function prepareText(tag, text) {
    var stub = ' ';
    if (textSaveTags.indexOf(tag) !== -1)
        stub = '\n';

    return text.replace(_options.BREAK_LINE, stub).trim();
}

function prepareKey(command) {
    var result = '';
    if (command === Command.elementOpen || command === Command.elementOpenStart || command === Command.elementVoid) {
        result = ', null, ';
    }
    return result;
}

function prepareAttr(command, attributes) {
    var result = '';
    if (command === Command.elementOpen || command === Command.elemenOpenStart || command === Command.elementVoid) {
        result = 'null';
        for (var key in attributes) {
            if (attributes.hasOwnProperty(key))
                result += ', "' + key + '", "' + ((attributes[key] === null) ? key : attributes[key]) + '"';
        }
    }
    return result;
}

function writeCommand(command, tag, attributes) {
    stack.push(command + tag + '"' + prepareKey(command) + prepareAttr(command, attributes) + Command.close);
}

function writeAttributes(attrs) {
    for (var attrName in attrs) {
        if (attrs.hasOwnProperty(attrName))
            stack.push(Command.attr + attrName + ', ' + attrs[attrName] + Command.close);
    }
}

function writeText(text) {
    text = prepareText(state.tag, text);
    if (text.length > 0)
        stack.push(Command.text + text + '"' + Command.close);
}

function writeCode(text) {
        stack.push(prepareText(state.tag, text));
}

function writeAndCloseOpenState(isClosed) {
    var isShouldClose = true;
    if (state.tag) {
        if (isClosed || voidRequireTags.indexOf(state.tag) !== -1) { // void mode
            writeCommand(Command.elementVoid, state.tag, state.attributes);
            isShouldClose = false;
        } else if (state.extendMode) { // extend mode
            writeCommand(Command.elementOpenStart, state.tag);
            writeAttributes(state.attributes);
            writeCommand(Command.elementOpenEnd, state.tag);
        } else if (state.tag !== _options.evaluate.name) { // standard mode
            writeCommand(Command.elementOpen, state.tag, state.attributes);
        } // if we write code, do nothing
    }

    // clear builder state for next tag
    state.tag = null;
    state.attributes = {};
    state.extendMode = false;

    return isShouldClose;
}

/* public */
function Builder() {
    this.reset();
}

Builder.prototype.reset = function () {
    stack = [];
    state = {
        tag: null,
        attributes: {},
        extendMode: false
    };
};

Builder.prototype.write = function (command) {
    var tag;
    switch (command.type) {
        case ParserMode.Tag:
            tag = command.name.replace('/', '');
            if (command.name.indexOf('/') === 0) { // close tag case
                if (writeAndCloseOpenState(true) && tag !== _options.evaluate.name)
                    writeCommand(Command.elementClose, tag);
            } else { // open tag case
                writeAndCloseOpenState();
                state.tag = tag;
                state.attributes = {};
            }
            break;
        case ParserMode.Attr: // push attribute in state
            state.attributes[command.name] = command.data;

            // switch to elementOpen extend mode
            if (command.data === null) {
                state.extendMode = true;
            }
            break;
        case ParserMode.Text: // write text
            tag = state.tag;
            writeAndCloseOpenState();
            if (tag === _options.evaluate.name) {
                writeCode(command.data);
            } else {
                writeText(command.data);
            }
            break;
    }
};

Builder.prototype.done = function () {
    // todo
    console.log(stack.join('\n'));
};

Builder.prototype.error = function (error) {
    throw new Error(error);
};

module.exports = Builder;