/* private */
var ParserMode = {
    Text: 'text',
    Tag: 'tag',
    Attr: 'attr',
    CData: 'cdata', //todo, is it need?
    Doctype: 'doctype', //todo, is it need?
    Comment: 'comment', //todo, is it need?
    Script: 'script' //todo, is it need?
};

// current builder state
var state;
// result builder
var stack;

function writeCommand(command, tag, attributes) {
    // todo attributes
    prepeareAttr(attributes);
    stack.push(command + '("' + tag + ');');
}

function writeAttributes(attrs) {
    for (var attrName in attrs) {
        if (attrs.hasOwnProperty(attrName))
            stack.push('attr("' + attrName + ', ' + attrs[attrName] + ');');
    }
}

function writeText(text) {
    stack.push('text("' + text + ');');
}

function pushState(isClosed) {
    var type = 'standard';
    if (state.extendMode) {
        type = 'extend'
    } else if (isClosed) {
        type = 'void';
    }

    if (state.tag) {
        switch (type) {
            case 'void':
                writeCommand('elementVoid', state.tag, state.attributes);
                break;
            case 'extend':
                writeCommand('elementOpenStart', state.tag);
                writeAttributes(state.attributes);
                writeCommand('elementOpenEnd', state.tag);
                break;
            case 'standard':
                writeCommand('elementOpen', state.tag, state.attributes);
                break;
        }
    }

    // clear builder state for next tag
    state.tag = null;
    state.attributes = {};
    state.extendMode = false;
}

function openTag(name, raw) {
    pushState();
    state.tag = name;
    state.attributes = {};
}

function closeTag(name) {
    pushState(true);
    writeCommand('elementClose', name);
}

function setAttr(name, value) {
    state.attributes[name] = value;

    // switch to elementOpen extend mode
    if (value === null) {
        state.extendMode = true;
    }
}

function setText(value) {
    pushState();
    writeText(value);
}

/* public */
function IBuilder() {
    this.reset();
}

IBuilder.prototype.reset = function () {
    stack = [];
    state = {
        tag: null,
        attributes: {},
        extendMode: false
    };
};

IBuilder.prototype.write = function (command) {
    switch (command.type) {
        case ParserMode.Tag:
            if (command.name.indexOf('/') === 0)
                closeTag(command.name.replace('/', ''));
            else
                openTag(command.name, command.raw);
            break;
        case ParserMode.Attr:
            setAttr(command.name, command.data);
            break;
        case ParserMode.Text:
            setText(command.data);
            break;
    }
};

IBuilder.prototype.done = function () {
    // todo
    console.log(stack.join('\n'));
};

IBuilder.prototype.error = function (error) {
    throw new Error(error);
};

module.exports = IBuilder;