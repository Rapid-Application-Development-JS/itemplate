/* private */
var Mode = {
    Text: 'text',
    Tag: 'tag',
    Attr: 'attr',
    CData: 'cdata',
    Doctype: 'doctype',
    Comment: 'comment',
    Script: 'script'
};

function openTag(name, raw) {

}

function closeTag(name) {

}

function setAttr(name, value) {

}

function setText(value) {

}

// todo attributes & multiply attributes
// todo close tag

/* public */
function IBuilder() {
    this.reset();
}

IBuilder.prototype.reset = function () {
    //todo
};

IBuilder.prototype.write = function (command) {
    if (command.type === Mode.Tag) {
        if (command.name.indexOf('/') === 0)
            closeTag(command.name.replace('/', ''));
        else
            openTag(command.name, command.raw);
    } else if (command.type === Mode.Attr) {
        setAttr(command.name, command.data);
    } else if (command.type === Mode.Text) {
        setText(command.data);
    } else if (command.type === Mode.Comment) {
        // todo
    } else if (command.type === Mode.CData) {
        //todo, is it need?
    } else if (command.type === Mode.Doctype) {
        //todo, is it need?
    } else if (command.type === Mode.Script) {
        //todo, is it need?
    }
};

IBuilder.prototype.done = function () {
    // todo
};

IBuilder.prototype.error = function (error) {
    throw new Error(error);
};

module.exports = IBuilder;