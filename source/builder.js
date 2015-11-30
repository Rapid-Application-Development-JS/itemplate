/* private */
var _options = require('./options');
var Mode = require('./mode');
var Command = require('./wrapper').Command;

var state; // current builder state
var stack; // result builder
var staticArraysHolder = {}; // holder for static arrays
var wrapper; // external wrapper functionality

var empty = '', quote = '\'', comma = ', \''; // auxiliary

function makeKey() {
    var text = new Array(12), possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgijklmnopqrstuvwxyz';
    for (var i = 0; i < 12; i++)
        text.push(possible.charAt(Math.floor(Math.random() * possible.length)));

    return text.join(empty);
}

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
        value: (prefix ? quote : empty) + result + (suffix ? quote : empty)
    };
}

function formatText(tag, text) {
    return text.replace(_options.BREAK_LINE, ((_options.textSaveTags.indexOf(tag) !== -1) ? '\n' : ' ')).trim();
}

function prepareKey(command, attributes) {
    var result = empty;
    if (command === Command.elementOpen || command === Command.elementVoid) {
        if (attributes && attributes.hasOwnProperty(_options.staticKey)) {
            result = comma + (attributes[_options.staticKey] || makeKey()) + '\', ';
            delete attributes[_options.staticKey];
        } else {
            result = ', null, ';
        }
    }
    return result;
}

function prepareAttr(command, attributes) {
    var result = empty, attr, decode, arrayStaticKey = false;
    if (command === Command.elementOpen || command === Command.elementVoid) {
        if (attributes && attributes.hasOwnProperty(_options.staticArray)) {
            arrayStaticKey = attributes[_options.staticArray] || makeKey();
            staticArraysHolder[arrayStaticKey] = [];
            delete attributes[_options.staticArray];
        }
        result = arrayStaticKey || null;

        for (var key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                attr = attributes[key];
                attr = (attr === null) ? key : attr;
                decode = decodeAccessory(attr);
                if (decode.isStatic) {
                    if (arrayStaticKey)
                        staticArraysHolder[arrayStaticKey].push(quote + key + quote, quote + attr + quote);
                    else
                        result += comma + key + '\', \'' + attr + quote;
                } else {
                    result += comma + key + '\', ' + decode.value;
                }
            }
        }
    }
    return result;
}

function writeCommand(command, tag, attributes) {
    stack.push(command + tag + quote + prepareKey(command, attributes) + prepareAttr(command, attributes)
        + Command.close);
}

function writeText(text) {
    text = formatText(state.tag, text);
    if (text.length > 0) {
        var decode = decodeAccessory(text);
        text = decode.isStatic ? (quote + text + quote) : decode.value;
        stack.push(Command.text + text + Command.close);
    }
}

function writeCode(text) {
    stack.push(formatText(state.tag, text));
}

function writeComment(text) {
    stack.push('\n// ' + text.replace(_options.BREAK_LINE, ' ') + '\n');
}

function writeAndCloseOpenState(isClosed) {
    var isShouldClose = true;
    if (state.tag) {
        if (isClosed || _options.voidRequireTags.indexOf(state.tag) !== -1) { // void mode
            writeCommand(Command.elementVoid, state.tag, state.attributes);
            isShouldClose = false;
        } else if (state.tag !== _options.evaluate.name) { // standard mode
            writeCommand(Command.elementOpen, state.tag, state.attributes);
        } // if we write code, do nothing
    }

    // clear builder state for next tag
    state.tag = null;
    state.attributes = {};

    return isShouldClose; // should we close this tag: no if we have void element
}

/* public */
function Builder(functionWrapper) {
    wrapper = functionWrapper;
    this.reset();
}

Builder.prototype.reset = function () {
    stack = [];
    state = {
        tag: null,
        attributes: {}
    };
    staticArraysHolder = {};
};

Builder.prototype.write = function (command) {
    var tag;
    switch (command.type) {
        case Mode.Tag:
            tag = command.name.replace('/', empty);
            if (command.name.indexOf('/') === 0) { // close tag case
                if (writeAndCloseOpenState(true) && tag !== _options.evaluate.name)
                    writeCommand(Command.elementClose, tag);
            } else { // open tag case
                writeAndCloseOpenState();
                state.tag = tag;
                state.attributes = {};
            }
            break;
        case Mode.Attr: // push attribute in state
            state.attributes[command.name] = command.data;
            break;
        case Mode.Text: // write text
            tag = state.tag;
            writeAndCloseOpenState();
            if (tag === _options.evaluate.name) {
                writeCode(command.data);
            } else {
                writeText(command.data);
            }
            break;
        case Mode.Comment: // write comments immediately
            writeComment(command.data);
            break;
    }
};

Builder.prototype.done = function () {
    return wrapper(stack, staticArraysHolder);
};

module.exports = Builder;