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
	    compile: function (string, library, scopedHelpers, rootKeys) {
	        builder.reset();
	        builder.set(
	            Object.keys(helpers),
	            scopedHelpers ? Object.keys(scopedHelpers) : [],
	            rootKeys
	        );
	        wrapper.set(library, helpers, null, string);
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

	Object.defineProperty(itemplate, 'helpers', {
	    get: function () {
	        return helpers;
	    },
	    set: function () {
	    }
	});

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
	        name: 'script',
	        open: '<script>',
	        close: '</script>'
	    },
	    accessory: {
	        open: '{%',
	        close: '%}'
	    },
	    escape: /(&amp;|&lt;|&gt;|&quot;)/g,
	    MAP: {
	        '&amp;': '&',
	        '&lt;': '<',
	        '&gt;': '>',
	        '&quot;': '"'
	    },
	    // build options
	    emptyString: true,
	    skipAttr: 'skip',
	    staticKey: 'key',
	    staticArray: 'static-array',
	    nonStaticAttributes: ['id', 'name'],
	    parameterName: 'data',
	    parentParameterName: 'parent',
	    renderContentFnName: 'content',
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
	var localComponentNames = []; // keys for local helpers

	var empty = '', quote = '"', comma = ', "', removable = '-%%&&##__II-'; // auxiliary

	var nestingLevelInfo = {level: 0, skip: -1};

	function isRootNode() {
	    return nestingLevelInfo.level === 0;
	}

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

	    if (string !== undefined)
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
	    else
	        code = '""';

	    // micro-optimizations (remove appending empty strings)
	    code = code.replace(/^"" \+ | \+ ""$/g, '').replace(/ \+ "" \+ /g, ' + ');

	    return {value: code, isStatic: isStatic};
	}

	function formatText(text) {
	    return text.trim()
	        .replace(/&#(\d+);/g, function (match, dec) {
	            return String.fromCharCode(dec);
	        })
	        .replace(_options.escape, function (m) {
	            return _options.MAP[m];
	        });
	}

	function prepareKey(command, attributes, useKeyCommand) {
	    var result = empty, decode, stub;
	    if ((command === Command.elementOpen || command === Command.elementVoid)) {

	        if (attributes && attributes.hasOwnProperty(_options.staticKey)) {
	            decode = decodeAccessory(attributes[_options.staticKey] || makeKey());
	            delete attributes[_options.staticKey];
	        } else if (useKeyCommand) {
	            decode = {value: Command.getKey};
	        } else {
	            decode = {value: 'null'};
	        }
	        stub = (Object.keys(attributes).length > 0) ? ', ' : empty;
	        result = ', ' + decode.value + stub;
	    }
	    return result;
	}

	function prepareAttr(command, attributes) {
	    var result = empty, attr, decode, arrayStaticKey = false, isSkipped = false, skipCommand;
	    if ((command === Command.elementOpen || command === Command.elementVoid) && Object.keys(attributes).length > 0) {
	        if (attributes && attributes.hasOwnProperty(_options.staticArray)) {
	            arrayStaticKey = attributes[_options.staticArray] || makeKey();
	            staticArraysHolder[arrayStaticKey] = staticArraysHolder[arrayStaticKey] || {};
	            delete attributes[_options.staticArray];
	        }

	        if (attributes && attributes.hasOwnProperty(_options.skipAttr)) {
	            isSkipped = true;
	            skipCommand = Command.startSkipContent(decodeAccessory(attributes[_options.skipAttr], true).value);
	            delete attributes[_options.skipAttr];
	        }

	        result = arrayStaticKey || null;
	        for (var key in attributes) {
	            attr = attributes[key];
	            attr = (attr === null) ? key : ((attr === undefined) ? '' : attr);
	            decode = decodeAccessory(attr);
	            if (decode.isStatic && (_options.nonStaticAttributes.indexOf(key) === -1)) {
	                if (arrayStaticKey) {
	                    var value = formatText(attr);
	                    if (!staticArraysHolder[arrayStaticKey].hasOwnProperty(key)) {
	                        staticArraysHolder[arrayStaticKey][key] = value;
	                    } else if (staticArraysHolder[arrayStaticKey][key] !== value) {
	                        staticArraysHolder[arrayStaticKey][key] = removable;
	                        result += comma + key + '", "' + value + quote;
	                    }
	                } else
	                    result += comma + key + '", "' + formatText(attr) + quote;
	            } else {
	                result += comma + key + '", ' + formatText(decode.value);
	            }
	        }
	    }
	    return {value: result, isSkipped: isSkipped, skip: skipCommand};
	}

	function unwrapStaticArrays(holder) {
	    var result = {}, obj, key;
	    for (var arrayName in holder) {
	        obj = holder[arrayName];
	        result[arrayName] = [];

	        for (key in obj)
	            if (obj[key] !== removable)
	                result[arrayName].push(quote + key + quote, quote + obj[key] + quote);
	    }

	    return result;
	}

	function decodeAttrs(obj) {
	    var result = ['{'];
	    for (var key in obj)
	        result.push(((result.length > 1) ? ',' : empty) + '\'' + key + '\'' + ':' + decodeAccessory(obj[key], true).value);
	    result.push('}');

	    return result.join(empty);
	}

	function camelCase(input) {
	    return input.replace(/\s/g, '').replace(/-(.)/g, function (match, group1) {
	        return group1.toUpperCase();
	    });
	}

	function writeCommand(command, tag, attributes) {
	    if (attributes && attributes.ref) {
	        var refName = attributes.ref;
	        delete attributes.ref;
	    }

	    var strKey = prepareKey(command, attributes);
	    var strAttrs = prepareAttr(command, attributes);

	    if (refName) {
	        // i.e. ref[refName] = elementOpen(...)
	        command = Command.saveRef(camelCase(decodeAccessory(refName, true).value), command);
	    }

	    stack.push(command + tag + quote + strKey + strAttrs.value + Command.close);

	    // save skipped
	    if (strAttrs.isSkipped) {
	        stack.push(strAttrs.skip);
	        nestingLevelInfo.skip = nestingLevelInfo.level;
	    }
	}

	function writeText(text) {
	    text = formatText(text);
	    if (text.length > 0) {
	        var decode = decodeAccessory(text);
	        stack.push(Command.text + decode.value + Command.close);
	    }
	}

	var helperOpen = function (helperName, attrs) {
	    stack.push('helpers["' + helperName + '"](' + decodeAttrs(attrs) + ', function ('
	        + _options.parentParameterName + '){');
	};
	var helperClose = function () {
	    stack.push('}.bind(this));');
	};

	function isHelperTag(tag) {
	    return localComponentNames.indexOf(tag) !== -1 || helpers.indexOf(tag) !== -1;
	}

	// TODO: Clarify logic.
	// Seems like this method only opens state but named as 'CloseOpenState'
	// also seems like `isClosed` flags used only to detect elementVoid and it's a bit confusing
	// because sounds like it can be used to detect tags open or close state.
	function writeAndCloseOpenState(isClosed) {
	    var isShouldClose = true;

	    if (state.tag) {
	        var isRoot = isRootNode();

	        if (isHelperTag(state.tag)) { // helper case
	            helperOpen(state.tag, state.attributes);
	            isShouldClose = isClosed;
	        } else if (isClosed || _options.voidRequireTags.indexOf(state.tag) !== -1) { // void mode
	            writeCommand(Command.elementVoid, state.tag, state.attributes, isRoot);
	            nestingLevelInfo.level--;
	            isShouldClose = false;
	        } else if (state.tag !== _options.evaluate.name) { // standard mode
	            writeCommand(Command.elementOpen, state.tag, state.attributes, isRoot);
	        } // if we write code, do nothing

	        nestingLevelInfo.level++;
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
	    nestingLevelInfo = {level: 0, skip: -1};
	};

	Builder.prototype.set = function (helpersKeys, localNames) {
	    helpers = helpersKeys;
	    localComponentNames = localNames || [];
	};

	Builder.prototype.write = function (command) {
	    var tag;
	    switch (command.type) {
	        case Mode.Tag:
	            tag = command.name.replace('/', empty);

	            if (command.name.indexOf('/') === 0) {

	                // close tag case
	                if (writeAndCloseOpenState(true) && tag !== _options.evaluate.name) {
	                    nestingLevelInfo.level--;
	                    
	                    if (nestingLevelInfo.level === nestingLevelInfo.skip) { // write end skip functionality
	                        stack.push(Command.endSkipContent);
	                        nestingLevelInfo.skip = -1;
	                    }

	                    if (isHelperTag(tag))
	                        helperClose();
	                    else
	                        writeCommand(Command.elementClose, tag);
	                }
	            } else {
	                // open tag case
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

	Builder.prototype.done = function () {
	    return wrapper(stack, unwrapStaticArrays(staticArraysHolder));
	};

	module.exports = Builder;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var _options = __webpack_require__(1);

	var Command = { // incremental DOM commands
	    elementOpen: 'elementOpen("',
	    elementVoid: 'elementVoid("',
	    elementClose: 'elementClose("',
	    saveRef: function (name, command) {
	        return 'refs[' + name + '] = ' + command;
	    },
	    text: 'text(',
	    close: ');\n',
	    startSkipContent: function (flag) {
	        // compile static values
	        flag = (flag === '"false"') ? false : flag;
	        flag = (flag === '"true"') ? true : flag;

	        return 'if(' + flag + '){lib.skip();}else{';
	    },
	    endSkipContent: '}'
	};

	function createWrapper() {
	    var _library, _helpers, _fnName, _template;
	    var glue = '';
	    var eol = '\n';

	    function wrapFn(body) {
	        var returnValue = eol + ' return refs;';

	        var prepareError = 'var TE=function(m,n,o){this.original=o;this.name=n;(o)?this.stack=this.original.stack:' +
	            'this.stack=null;this.message=o.message+m;};var CE=function(){};CE.prototype=Error.prototype;' +
	            'TE.prototype=new CE();TE.prototype.constructor=TE;';

	        if (_options.debug) {
	            return 'try {'
	                + body +
	                '} catch (err) {'
	                + prepareError +
	                'throw new TE(' + JSON.stringify(_template) + ', err.name, err);' +
	                '}'
	                + returnValue;
	        }
	        return body + returnValue;
	    }

	    function wrapper(stack, holder) {
	        var resultFn;
	        var variables = [
	                'var elementOpen = lib.elementOpen;',
	                'var elementClose = lib.elementClose;',
	                'var currentElement = lib.currentElement;',
	                'var text = lib.text;',
	                'var elementVoid = lib.elementVoid;',
	                'var refs = {};'
	            ].join(eol) + eol;

	        for (var key in holder) { // collect static arrays for function
	            if (holder.hasOwnProperty(key))
	                variables += 'var ' + key + '=[' + holder[key] + '];';
	        }
	        var body = variables + wrapFn(stack.join(glue));

	        if (_library) {
	            body = 'return function(' + _options.parameterName + ', ' + _options.renderContentFnName + '){' + body + '};';
	            resultFn = (new Function('lib', 'helpers', body))(_library, _helpers);
	        } else {
	            resultFn = new Function(_options.parameterName, 'lib', 'helpers', _options.renderContentFnName, body);
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