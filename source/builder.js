/* private */
var _options = require('./options');
var Mode = require('./mode');
var Command = require('./wrapper').Command;

var state; // current builder state
var stack; // result builder
var staticArraysHolder = {}; // holder for static arrays
var wrapper; // external wrapper functionality
var helpers; // keys for helpers

var empty = '', quote = '"', comma = ', "'; // auxiliary

function makeKey() {
    var text = new Array(12), possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgijklmnopqrstuvwxyz';
    for (var i = 0; i < 12; i++)
        text.push(possible.charAt(Math.floor(Math.random() * possible.length)));

    return text.join(empty);
}

function decodeAccessory(string, force) {
    var regex = new RegExp(_options.accessory.open + '|' + _options.accessory.close, 'g');
    var code;
    var isStatic = true, openStub, closeStub;

    code = string.split(regex).map(function (piece, i) {
        openStub = '';
        closeStub = '';

        if (i % 2) {
            isStatic = false;
            piece = piece.trim();
            if (_options.emptyString && !force) { // undefined as empty string
                if (piece.indexOf(' ') !== -1) {
                    openStub = '(';
                    closeStub = ')';
                }
                return ' + ' + openStub + piece + closeStub + '||"" + ';
            } else
                return ' + ' + piece + ' + ';
        } else {
            return JSON.stringify(piece);
        }
    }).join('');

    // micro-optimizations (remove appending empty strings)
    code = code.replace(/^"" \+ | \+ ""$/g, '').replace(/ \+ "" \+ /g, ' + ');

    return {value: code, isStatic: isStatic};
}

function formatText(text) {
    return text.trim().replace(/&#(\d+);/g, function (match, dec) { return String.fromCharCode(dec); });
}

function prepareKey(command, attributes) {
    var result = empty; var decode; var stub;
    if (command === Command.elementOpen || command === Command.elementVoid) {
        if (attributes && attributes.hasOwnProperty(_options.staticKey)) {
            decode = decodeAccessory(attributes[_options.staticKey] || makeKey());
            stub = decode.isStatic ? '"' : empty;
            result = ', ' + stub + decode.value + stub + ', ';
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
            attr = attributes[key];
            attr = (attr === null) ? key : attr;
            decode = decodeAccessory(attr);
            if (decode.isStatic) {
                if (arrayStaticKey)
                    staticArraysHolder[arrayStaticKey].push(quote + key + quote, quote + attr + quote);
                else
                    result += comma + key + '", "' + attr + quote;
            } else {
                result += comma + key + '", ' + decode.value;
            }
        }
    }
    return result;
}

function decodeAttrs(obj) {
    var result = ['{'];
    for (var key in obj)
        result.push(((result.length > 1) ? ',' : empty) + key + ':' + decodeAccessory(obj[key], true).value);
    result.push('}');

    return result.join(empty);
}

function writeCommand(command, tag, attributes) {
    stack.push(command + tag + quote + prepareKey(command, attributes) + prepareAttr(command, attributes)
        + Command.close);
}

function writeText(text) {
    text = formatText(text);
    if (text.length > 0) {
        var decode = decodeAccessory(text);
        stack.push(Command.text + decode.value + Command.close);
    }
}

function writeAndCloseOpenState(isClosed) {
    var isShouldClose = true;
    if (state.tag) {
        if (helpers.indexOf(state.tag) !== -1) { // helper case
            stack.push('helpers["' + state.tag + '"](' + decodeAttrs(state.attributes) + ');');
            isShouldClose = false;
        } else if (isClosed || _options.voidRequireTags.indexOf(state.tag) !== -1) { // void mode
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

Builder.prototype.set = function (helpersKeys) {
    helpers = helpersKeys;
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
            if (tag === _options.evaluate.name) { // write code
                stack.push(formatText(command.data));
            } else {
                writeText(command.data);
            }
            break;
        case Mode.Comment: // write comments immediately
            stack.push('\n// ' + command.data.replace(_options.BREAK_LINE, ' ') + '\n');
            break;
    }
};

Builder.prototype.done = function () {
    return wrapper(stack, staticArraysHolder);
};

module.exports = Builder;