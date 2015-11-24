/* private */
var _options = {
    BREAK_LINE: /(\r\n|\n|\r)/gm,
    accessory: {
        open: '{%',
        close: '%}'
    },
    evaluate: {
        name: 'evaluate',
        open: '<evaluate>',
        close: '</evaluate>'
    },
    staticKey: 'static-key', // todo
    staticArray: 'static-array' // todo
};

var ParserMode = {
    Text: 'text',
    Tag: 'tag',
    Attr: 'attr',
    Comment: 'comment'
};

var Command = { // incremental DOM commands
    elementOpen: 'elementOpen(\'',
    elementVoid: 'elementVoid(\'',
    elementOpenStart: 'elementOpenStart(\'',
    elementOpenEnd: 'elementOpenEnd(\'',
    elementClose: 'elementClose(\'',
    text: 'text(',
    attr: 'attr(\'',
    close: ');'
};

// parse rules
var textSaveTags = ['pre', 'code'];
var voidRequireTags = ['input', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'keygen', 'link', 'meta',
    'param', 'source', 'track', 'wbr'];

var state; // current builder state
var stack; // result builder

function decodeAccessory(string) {
    var regex = new RegExp(_options.accessory.open + '(.*?)' + _options.accessory.close, 'g');
    var prefix = true;
    var suffix = true;
    var isStatic = true;

    var result = string.replace(regex, function (match, p1, index, string) {
        isStatic = false;

        if (index !== 0)
            p1 = '\'+' + p1;
        else
            prefix = false;

        if ((string.length - (index + match.length)) > 0)
            p1 += '+\'';
        else
            suffix = false;

        return p1;
    });

    return {
        isStatic: isStatic,
        value: (prefix ? '\'' : '') + result + (suffix ? '\'' : '')
    };
}

function formatText(tag, text) {
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
    var result = '', attr, decode;
    if (command === Command.elementOpen || command === Command.elemenOpenStart || command === Command.elementVoid) {
        result = 'null';
        for (var key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                attr = attributes[key];
                attr = (attr === null) ? key : attr;
                decode = decodeAccessory(attr);
                if (decode.isStatic) {
                    result += ', \'' + key + '\', \'' + attr + '\'';
                } else {
                    result += ', \'' + key + '\', ' + decode.value;
                }
            }
        }
    }
    return result;
}

function writeCommand(command, tag, attributes) {
    stack.push(command + tag + '\'' + prepareKey(command) + prepareAttr(command, attributes) + Command.close);
}

function writeAttributes(attrs) {
    for (var attrName in attrs) {
        if (attrs.hasOwnProperty(attrName))
            stack.push(Command.attr + attrName + ', ' + attrs[attrName] + Command.close);
    }
}

function writeText(text) {
    text = formatText(state.tag, text);
    if (text.length > 0) {
        var decode = decodeAccessory(text);
        text = decode.isStatic ? ('\'' + text + '\'') : decode.value;
        stack.push(Command.text + text + Command.close);
    }
}

function writeCode(text) {
    stack.push(formatText(state.tag, text));
}

function writeComment(text) {
    stack.push('\n// ' + text.replace(_options.BREAK_LINE, ' '));
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

    return isShouldClose; // should we close this tag: no if we have void element
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

            // todo switch to elementOpen extend mode only with dynamic attributes
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
        case ParserMode.Comment: // write comments immediately
            writeComment(command.data);
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