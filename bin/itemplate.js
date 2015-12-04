(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["itemplate"] = factory();
	else
		root["itemplate"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var _options = __webpack_require__(1);
	var prepare = __webpack_require__(2);
	var Parser = __webpack_require__(3);
	var Builder = __webpack_require__(5);

	var wrapper = __webpack_require__(6).createWrapper();
	var builder = new Builder(wrapper);
	var parser = new Parser(builder);

	var helpers = {};

	var itemplate = {
	    compile: function (string, library, fnName) {
	        builder.reset();
	        builder.set(Object.keys(helpers));
	        wrapper.set(library, helpers, fnName, string);
	        return parser.parseComplete(prepare(string));
	    },
	    options: function (options) {
	        // mix options
	        for (var key in options) {
	            if (options.hasOwnProperty(key))
	                _options[key] = options[key];
	        }
	    },
	    registerHelper: function (name, fn) {
	        helpers[name] = fn;
	    },
	    unregisterHelper: function (name) {
	        delete helpers[name];
	    }
	};

	module.exports = itemplate;

/***/ },
/* 1 */
/***/ function(module, exports) {

	var _options = {
	    BREAK_LINE: /(\r\n|\n|\r)\s{0,}/gm,
	    // prepare options
	    template: {
	        evaluate: /<%([\s\S]+?)%>/g,
	        interpolate: /<%=([\s\S]+?)%>/g,
	        escape: /<%-([\s\S]+?)%>/g
	    },
	    order: ['interpolate', 'escape', 'evaluate'],
	    evaluate: {
	        name: 'evaluate',
	        open: '<evaluate>',
	        close: '</evaluate>'
	    },
	    accessory: {
	        open: '{%',
	        close: '%}'
	    },
	    // build options
	    emptyString: true,
	    staticKey: 'static-key',
	    staticArray: 'static-array',
	    parameterName: 'data',
	    // tags parse rules
	    textSaveTags: ['pre', 'code'],
	    voidRequireTags: ['input', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'keygen', 'link', 'meta',
	        'param', 'source', 'track', 'wbr'],
	    debug: false
	};

	module.exports = _options;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var _options = __webpack_require__(1);

	function replacer(match, p1) {
	    return _options.accessory.open + p1 + _options.accessory.close;
	}

	var methods = {
	    evaluate: function (string) {
	        return string.replace(_options.template.evaluate, function (match, p1) {
	            return _options.evaluate.open + p1.replace(_options.BREAK_LINE, ' ').trim() + _options.evaluate.close;
	        });
	    },
	    interpolate: function (string) {
	        return string.replace(_options.template.interpolate, replacer);
	    },
	    escape: function (string) {
	        return string.replace(_options.template.escape, replacer);
	    }
	};

	function prepare(string) {
	    var result = string;
	    for (var i = 0; i < _options.order.length; i++) {
	        result = methods[_options.order[i]](result);
	    }
	    return result;
	}

	module.exports = prepare;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Mode = __webpack_require__(4);

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
	    return this.done(data);
	};

	Parser.prototype.done = function (initialData) {
	    this._state.done = true;
	    this._parse(this._state);
	    this._flushWrite();
	    return this._builder.done(initialData);
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
	            this._write({type: Mode.Text, data: text}); // todo node creation
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
	        if (tag.name.toLowerCase() === 'script') { // todo remove or replace functionality from builder(may be better)
	            state.isScript = true;
	        } else if (tag.name.toLowerCase() === '/script') {
	            state.isScript = false;
	        }
	        if (state.mode === Mode.Attr) {
	            this._writePending(tag); // todo node creation
	        } else {
	            this._write(tag); // todo node creation
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
	            this._write({type: Mode.Tag, name: '/' + state.lastTag.name, raw: null}); // todo node creation
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

	    this._writePending({type: Mode.Attr, name: name_data.name, data: value_data.value}); // todo node creation
	};

	Parser.re_parseCData_findEnding = /\]{1,2}$/;
	Parser.prototype._parseCData = function () { // todo remove
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
	        this._write({type: Mode.CData, data: text}); //todo node creation
	        state.mode = Mode.Text;
	        state.pos = foundPos + 3;
	    }
	};

	Parser.prototype._parseDoctype = function () { // todo remove
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
	        this._write({type: Mode.Doctype, data: text}); // todo node creation
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

	        this._write({type: Mode.Comment, data: text}); // todo node creation
	        state.mode = Mode.Text;
	        state.pos = foundPos + 3;
	    }
	};

	module.exports = Parser;

/***/ },
/* 4 */
/***/ function(module, exports) {

	var Mode = {
	    Text: 'text',
	    Tag: 'tag',
	    Attr: 'attr',
	    CData: 'cdata',
	    Doctype: 'doctype',
	    Comment: 'comment'
	};

	module.exports = Mode;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* private */
	var _options = __webpack_require__(1);
	var Mode = __webpack_require__(4);
	var Command = __webpack_require__(6).Command;

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
	                return ' + (' + openStub + piece + closeStub + ' === undefined ? "" : '
	                    + openStub + piece + closeStub + ') + ';
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
	    if ((command === Command.elementOpen || command === Command.elementVoid) && Object.keys(attributes).length > 0) {
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
	    if ((command === Command.elementOpen || command === Command.elementVoid) && Object.keys(attributes).length > 0) {
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
	        case Mode.Comment: // write comments only in debug mode
	            if (_options.debug)
	                stack.push('\n// ' + command.data.replace(_options.BREAK_LINE, ' ') + '\n');
	            break;
	    }
	};

	Builder.prototype.done = function (initialData) {
	    return wrapper(stack, staticArraysHolder, initialData);
	};

	module.exports = Builder;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var _options = __webpack_require__(1);

	// todo create different commands for debug & relize mode
	var Command = { // incremental DOM commands
	    elementOpen: 'elementOpen("',
	    elementVoid: 'elementVoid("',
	    elementClose: 'elementClose("',
	    text: 'text(',
	    close: ');'
	};

	function createWrapper() {
	    var _library, _helpers, _fnName, _template;

	    var error = 'var TE=function(m,n,o){this.original=o;this.name=n;(o)?this.stack=this.original.stack:' +
	        'this.stack=null;this.message=o.message+m;};var CE=function(){};CE.prototype=Error.prototype;' +
	        'TE.prototype=new CE();TE.prototype.constructor=TE;';

	    function wrappFn(body, initialData) { // todo remove initialData
	        return (_options.debug) ? ('try {' + body + '} catch (err) {' + error + 'throw new TE('
	        + JSON.stringify(_template) + ', err.name, err);}') : body;
	    }

	    function wrapper(stack, holder, initialData) { // todo remove initialData
	        var resultFn;
	        var glue = '';
	        var fn = 'var elementOpen=lib.elementOpen,elementClose=lib.elementClose,text=lib.text,' +
	            'elementVoid=lib.elementVoid;';

	        for (var key in holder) { // collect static arrays for function
	            if (holder.hasOwnProperty(key))
	                fn += 'var ' + key + '=[' + holder[key] + '];';
	        }

	        if (_library) {
	            fn += 'return function(' + _options.parameterName + '){' + wrappFn(stack.join(glue), initialData) + '};';
	            if (_fnName) // return function with closure as string
	                resultFn = 'function ' + _fnName + '(lib, helpers){' + fn + '}';
	            else // return function with closure
	                resultFn = (new Function('lib', 'helpers', fn))(_library, _helpers);
	        } else { // todo is it really need ?
	            if (_fnName) // plain function as string
	                resultFn = 'function ' + _fnName + '(' + _options.parameterName + ', lib, helpers){'
	                    + wrappFn(fn + stack.join(glue), initialData) + '}';
	            else // plain function
	                resultFn = new Function(_options.parameterName, 'lib', 'helpers', wrappFn(fn + stack.join(glue), initialData));
	        }

	        return resultFn;
	    }

	    wrapper.set = function (library, helpers, fnName, template) {
	        _library = library;
	        _helpers = helpers;
	        _fnName = fnName;
	        _template = template;
	    };

	    return wrapper;
	}

	module.exports = {
	    createWrapper: createWrapper,
	    Command: Command
	};

/***/ }
/******/ ])
});
;