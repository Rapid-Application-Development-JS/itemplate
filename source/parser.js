var Mode = require('./mode');

function Parser(builder) {
    this._builder = builder;
    this.reset();
}

//**Public**//
Parser.prototype.reset = function () {
    this._state = {
        mode: Mode.Text,
        pos: 0,
        data: null,
        pendingText: null,
        pendingWrite: null,
        lastTag: null,
        isScript: false,
        needData: false,
        output: [],
        done: false
    };
    this._builder.reset();
};

Parser.prototype.parseChunk = function (chunk) {
    this._state.needData = false;
    this._state.data = (this._state.data !== null) ? this._state.data.substr(this.pos) + chunk : chunk;
    while (this._state.pos < this._state.data.length && !this._state.needData) {
        this._parse(this._state);
    }
};

Parser.prototype.parseComplete = function (data) {
    this.reset();
    this.parseChunk(data);
    return this.done();
};

Parser.prototype.done = function () {
    this._state.done = true;
    this._parse(this._state);
    this._flushWrite();
    return this._builder.done();
};

//**Private**//
Parser.prototype._parse = function () {
    switch (this._state.mode) {
        case Mode.Text:
            return this._parseText(this._state);
        case Mode.Tag:
            return this._parseTag(this._state);
        case Mode.Attr:
            return this._parseAttr(this._state);
        case Mode.CData:
            return this._parseCData(this._state);
        case Mode.Doctype:
            return this._parseDoctype(this._state);
        case Mode.Comment:
            return this._parseComment(this._state);
    }
};

Parser.prototype._writePending = function (node) {
    if (!this._state.pendingWrite) {
        this._state.pendingWrite = [];
    }
    this._state.pendingWrite.push(node);
};

Parser.prototype._flushWrite = function () {
    if (this._state.pendingWrite) {
        for (var i = 0, len = this._state.pendingWrite.length; i < len; i++) {
            var node = this._state.pendingWrite[i];
            this._builder.write(node);
        }
        this._state.pendingWrite = null;
    }
};

Parser.prototype._write = function (node) {
    this._flushWrite();
    this._builder.write(node);
};

Parser._re_parseText_scriptClose = /<\s*\/\s*script/ig;
Parser.prototype._parseText = function () {
    var state = this._state;
    var foundPos;
    if (state.isScript) {
        Parser._re_parseText_scriptClose.lastIndex = state.pos;
        foundPos = Parser._re_parseText_scriptClose.exec(state.data);
        foundPos = (foundPos) ? foundPos.index : -1;
    } else {
        foundPos = state.data.indexOf('<', state.pos);
    }
    var text = (foundPos === -1) ? state.data.substring(state.pos, state.data.length) : state.data.substring(state.pos, foundPos);
    if (foundPos < 0 && state.done) {
        foundPos = state.data.length;
    }
    if (foundPos < 0) {
        if (state.isScript) {
            state.needData = true;
            return;
        }
        if (!state.pendingText) {
            state.pendingText = [];
        }
        state.pendingText.push(state.data.substring(state.pos, state.data.length));
        state.pos = state.data.length;
    } else {
        if (state.pendingText) {
            state.pendingText.push(state.data.substring(state.pos, foundPos));
            text = state.pendingText.join('');
            state.pendingText = null;
        } else {
            text = state.data.substring(state.pos, foundPos);
        }
        if (text !== '') {
            this._write({type: Mode.Text, data: text});
        }
        state.pos = foundPos + 1;
        state.mode = Mode.Tag;
    }
};

Parser.re_parseTag = /\s*(\/?)\s*([^\s>\/]+)(\s*)\??(>?)/g;
Parser.prototype._parseTag = function () {
    var state = this._state;
    Parser.re_parseTag.lastIndex = state.pos;
    var match = Parser.re_parseTag.exec(state.data);

    if (match) {
        if (!match[1] && match[2].substr(0, 3) === '!--') {
            state.mode = Mode.Comment;
            state.pos += 3;
            return;
        }
        if (!match[1] && match[2].substr(0, 8) === '![CDATA[') {
            state.mode = Mode.CData;
            state.pos += 8;
            return;
        }
        if (!match[1] && match[2].substr(0, 8) === '!DOCTYPE') {
            state.mode = Mode.Doctype;
            state.pos += 8;
            return;
        }
        if (!state.done && (state.pos + match[0].length) === state.data.length) {
            //We're at the and of the data, might be incomplete
            state.needData = true;
            return;
        }
        var raw;
        if (match[4] === '>') {
            state.mode = Mode.Text;
            raw = match[0].substr(0, match[0].length - 1);
        } else {
            state.mode = Mode.Attr;
            raw = match[0];
        }
        state.pos += match[0].length;
        var tag = {type: Mode.Tag, name: match[1] + match[2], raw: raw, position: Parser.re_parseTag.lastIndex };
        if (state.mode === Mode.Attr) {
            state.lastTag = tag;
        }
        if (tag.name.toLowerCase() === 'script') {
            state.isScript = true;
        } else if (tag.name.toLowerCase() === '/script') {
            state.isScript = false;
        }
        if (state.mode === Mode.Attr) {
            this._writePending(tag);
        } else {
            this._write(tag);
        }
    } else {
        state.needData = true;
    }
};

Parser.re_parseAttr_findName = /\s*([^=<>\s'"\/]+)\s*/g;
Parser.prototype._parseAttr_findName = function () {
    // todo: parse {{ checked ? 'checked' : '' }} in input
    Parser.re_parseAttr_findName.lastIndex = this._state.pos;
    var match = Parser.re_parseAttr_findName.exec(this._state.data);
    if (!match) {
        return null;
    }
    if (this._state.pos + match[0].length !== Parser.re_parseAttr_findName.lastIndex) {
        return null;
    }
    return {
        match: match[0],
        name: match[1]
    };
};
Parser.re_parseAttr_findValue = /\s*=\s*(?:'([^']*)'|"([^"]*)"|([^'"\s\/>]+))\s*/g;
Parser.re_parseAttr_findValue_last = /\s*=\s*['"]?(.*)$/g;
Parser.prototype._parseAttr_findValue = function () {
    var state = this._state;
    Parser.re_parseAttr_findValue.lastIndex = state.pos;
    var match = Parser.re_parseAttr_findValue.exec(state.data);
    if (!match) {
        if (!state.done) {
            return null;
        }
        Parser.re_parseAttr_findValue_last.lastIndex = state.pos;
        match = Parser.re_parseAttr_findValue_last.exec(state.data);
        if (!match) {
            return null;
        }
        return {
            match: match[0],
            value: (match[1] !== '') ? match[1] : null
        };
    }
    if (state.pos + match[0].length !== Parser.re_parseAttr_findValue.lastIndex) {
        return null;
    }
    return {
        match: match[0],
        value: match[1] || match[2] || match[3]
    };
};
Parser.re_parseAttr_splitValue = /\s*=\s*['"]?/g;
Parser.re_parseAttr_selfClose = /(\s*\/\s*)(>?)/g;
Parser.prototype._parseAttr = function () {
    var state = this._state;
    var name_data = this._parseAttr_findName(state);
    if (!name_data || name_data.name === '?') {
        Parser.re_parseAttr_selfClose.lastIndex = state.pos;
        var matchTrailingSlash = Parser.re_parseAttr_selfClose.exec(state.data);
        if (matchTrailingSlash && matchTrailingSlash.index === state.pos) {
            if (!state.done && !matchTrailingSlash[2] && state.pos + matchTrailingSlash[0].length === state.data.length) {
                state.needData = true;
                return;
            }
            state.lastTag.raw += matchTrailingSlash[1];
            this._write({type: Mode.Tag, name: '/' + state.lastTag.name, raw: null});
            state.pos += matchTrailingSlash[1].length;
        }
        var foundPos = state.data.indexOf('>', state.pos);
        if (foundPos < 0) {
            if (state.done) {
                state.lastTag.raw += state.data.substr(state.pos);
                state.pos = state.data.length;
                return;
            }
            state.needData = true;
        } else {
            // state.lastTag = null;
            state.pos = foundPos + 1;
            state.mode = Mode.Text;
        }
        return;
    }
    if (!state.done && state.pos + name_data.match.length === state.data.length) {
        state.needData = true;
        return null;
    }
    state.pos += name_data.match.length;
    var value_data = this._parseAttr_findValue(state);
    if (value_data) {
        if (!state.done && state.pos + value_data.match.length === state.data.length) {
            state.needData = true;
            state.pos -= name_data.match.length;
            return;
        }
        state.pos += value_data.match.length;
    } else {
        if (state.data.indexOf(' ', state.pos - 1)) {
            value_data = {
                match: '',
                value: null
            };

        } else {
            Parser.re_parseAttr_splitValue.lastIndex = state.pos;
            if (Parser.re_parseAttr_splitValue.exec(state.data)) {
                state.needData = true;
                state.pos -= name_data.match.length;
                return;
            }
            value_data = {
                match: '',
                value: null
            };
        }
    }
    state.lastTag.raw += name_data.match + value_data.match;

    this._writePending({type: Mode.Attr, name: name_data.name, data: value_data.value});
};

Parser.re_parseCData_findEnding = /\]{1,2}$/;
Parser.prototype._parseCData = function () {
    var state = this._state;
    var foundPos = state.data.indexOf(']]>', state.pos);
    if (foundPos < 0 && state.done) {
        foundPos = state.data.length;
    }
    if (foundPos < 0) {
        Parser.re_parseCData_findEnding.lastIndex = state.pos;
        var matchPartialCDataEnd = Parser.re_parseCData_findEnding.exec(state.data);
        if (matchPartialCDataEnd) {
            state.needData = true;
            return;
        }
        if (!state.pendingText) {
            state.pendingText = [];
        }
        state.pendingText.push(state.data.substr(state.pos, state.data.length));
        state.pos = state.data.length;
        state.needData = true;
    } else {
        var text;
        if (state.pendingText) {
            state.pendingText.push(state.data.substring(state.pos, foundPos));
            text = state.pendingText.join('');
            state.pendingText = null;
        } else {
            text = state.data.substring(state.pos, foundPos);
        }
        this._write({type: Mode.CData, data: text});
        state.mode = Mode.Text;
        state.pos = foundPos + 3;
    }
};

Parser.prototype._parseDoctype = function () {
    var state = this._state;
    var foundPos = state.data.indexOf('>', state.pos);
    if (foundPos < 0 && state.done) {
        foundPos = state.data.length;
    }
    if (foundPos < 0) {
        Parser.re_parseCData_findEnding.lastIndex = state.pos;
        if (!state.pendingText) {
            state.pendingText = [];
        }
        state.pendingText.push(state.data.substr(state.pos, state.data.length));
        state.pos = state.data.length;
        state.needData = true;
    } else {
        var text;
        if (state.pendingText) {
            state.pendingText.push(state.data.substring(state.pos, foundPos));
            text = state.pendingText.join('');
            state.pendingText = null;
        } else {
            text = state.data.substring(state.pos, foundPos);
        }
        this._write({type: Mode.Doctype, data: text});
        state.mode = Mode.Text;
        state.pos = foundPos + 1;
    }
};

Parser.re_parseComment_findEnding = /\-{1,2}$/;
Parser.prototype._parseComment = function () {
    var state = this._state;
    var foundPos = state.data.indexOf('-->', state.pos);
    if (foundPos < 0 && state.done) {
        foundPos = state.data.length;
    }
    if (foundPos < 0) {
        Parser.re_parseComment_findEnding.lastIndex = state.pos;
        var matchPartialCommentEnd = Parser.re_parseComment_findEnding.exec(state.data);
        if (matchPartialCommentEnd) {
            state.needData = true;
            return;
        }
        if (!state.pendingText) {
            state.pendingText = [];
        }
        state.pendingText.push(state.data.substr(state.pos, state.data.length));
        state.pos = state.data.length;
        state.needData = true;
    } else {
        var text;
        if (state.pendingText) {
            state.pendingText.push(state.data.substring(state.pos, foundPos));
            text = state.pendingText.join('');
            state.pendingText = null;
        } else {
            text = state.data.substring(state.pos, foundPos);
        }

        this._write({type: Mode.Comment, data: text});
        state.mode = Mode.Text;
        state.pos = foundPos + 3;
    }
};

module.exports = Parser;