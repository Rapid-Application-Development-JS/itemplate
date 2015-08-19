// Consts
const EXCEPTIONS = ["pre", "script"];
const DUTY = ["evaluate"];
const BREAK_LINE = /(\r\n|\n|\r)/gm;
const NEW_LINE = "String.fromCharCode(10)";

if (typeof special === 'object')
    special[DUTY] = true;

// variables
var _helpers = {};
var _result = [];
var _staticArrays = {};
var _currentTag = null;
var _options = {
    parameterName: "data",
    functionName: function (filename, path) {
        return filename;
    },
    template: {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    },
    escape: /[&<>]/g,
    MAP: {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    },
    ignore: "js",
    accessory: {
        open: "{%",
        close: "%}"
    },
    staticKey: "static-key"
};

function makeKey() {
    var text = "", possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 12; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function escapeHTML(s) {
    return s.replace(_options.escape, function (c) {
        return _options.MAP[c];
    });
}

function flushParser() {
    _result.length = 0;
    _staticArrays = {};
    _currentTag = null;

    _result.push('var o=lib.elementOpen,c=lib.elementClose,t=lib.text,v=lib.elementVoid;');
}

function decodeTemplates(string, openTag, closeTag) {
    var regex = new RegExp(openTag + '(.*?)' + closeTag, 'g');
    var prefix = true;
    var suffix = true;
    var isStatic = true;

    var result = string.replace(regex, function (match, p1, index, string) {
        isStatic = false;

        if (index !== 0)
            p1 = "\'+" + p1;
        else
            prefix = false;

        if ((string.length - (index + match.length)) > 0)
            p1 += "+\'";
        else
            suffix = false;

        return p1;
    });

    return {
        isStatic: isStatic,
        value: (prefix ? '\'' : '') + result + (suffix ? '\'' : '')
    };
}

function encodeTemplates(string) {
    return string
        .replace(_options.template.interpolate, function (match, p1) {
            return _options.accessory.open + p1 + _options.accessory.close;
        })
        .replace(_options.template.escape, function (match, p1) {
            return _options.accessory.open + escapeHTML(p1) + _options.accessory.close;
        })
        .replace(_options.template.evaluate, function (match, p1) {
            return "<evaluate>" + p1.replace(BREAK_LINE, " ").trim() + "</evaluate>";
        });
}

function writeCommand(command, line, noEscape) {
    var attribs = "";

    if (line.length === 0) // don't write empty string or array
        return;

    if (typeof line === "string") {
        if (noEscape)
            attribs = line;
        else
            attribs = "'" + line.replace("'", "\\'") + "'"; // wrap attribute value

    } else { // create formatted string from array
        for (var i = 0; i < line.length; i++) {
            if (i > 0) // add comma between parameters
                attribs += ", ";

            attribs += line[i];
        }
    }

    // wrap in command
    _result.push(command + "(" + attribs + ");");
}

function writeLine(string, noEscape) {
    _result.push(noEscape ? string : string.replace(BREAK_LINE, " "));
}

function attrsWrapp(array) {
    for (var i = 0, obj = {}; i < array.length; i += 1) {
        obj[array[i].name] = array[i].value;
    }
    return obj;
}

// parsing of string
function onopentag(name, attributes, unary) {
    var attribs = attrsWrapp(attributes);
    var args = ["'" + name + "'"];
    var staticAttrs = [], attr;
    var staticKey = false;

    if (attribs.hasOwnProperty(_options.staticKey)) {
        staticKey = attribs[_options.staticKey] || "'" + makeKey() + "'";
        delete attribs[_options.staticKey];
    }

    if (DUTY.indexOf(name) === -1) {
        for (var key in attribs) {
            if (!attribs.hasOwnProperty(key))
                continue;

            if (args.length == 1) {
                args.push(null);
                args.push(null);
            }

            attr = decodeTemplates(attribs[key], _options.accessory.open, _options.accessory.close);
            if (staticKey && attr.isStatic) {
                staticAttrs.push("'" + key + "'");
                staticAttrs.push(attr.value);
            } else {
                args.push("'" + key + "'");
                args.push(attr.value);
            }
        }

        if (staticKey) {
            _staticArrays[staticKey] = "[" + staticAttrs.join(",") + "]";

            args[1] = "'" + makeKey() + "'";
            args[2] = staticKey;
        }

        if (unary)
            if (_helpers.hasOwnProperty(name))
                writeLine("helpers['" + name + "'](" + decodeAttrs(attribs) + ");", true);
            else
                writeCommand("v", args);
        else
            writeCommand("o", args);
    }

    _currentTag = name;
}

function decodeAttrs(obj) {
    var result = ["{"];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (result.length > 1)
                result.push(",");

            result.push(key + ":" +decodeTemplates(obj[key], _options.accessory.open, _options.accessory.close).value);
        }
    }
    result.push("}");

    return result.join("");
}

function ontext(text) {
    var line;
    if (DUTY.indexOf(_currentTag) !== -1) {
        writeLine(text);
    } else if (EXCEPTIONS.indexOf(_currentTag) === -1) {
        line = text.replace(BREAK_LINE, "").trim();
        if (line.length > 0)
            writeCommand("t", decodeTemplates(line, _options.accessory.open, _options.accessory.close).value, true);
    } else { // save format (break lines) for exception tags
        var lines = text.split(BREAK_LINE);
        for (var i = 0; i < lines.length; i++) {
            line = lines[i];

            if (BREAK_LINE.exec(line))
                writeCommand("t", NEW_LINE, true);
            else
                writeCommand("t", decodeTemplates(line, _options.accessory.open, _options.accessory.close).value, true);
        }
    }
}

function onclosetag(tagname) {
    if (DUTY.indexOf(tagname) === -1)
        writeCommand("c", tagname);
}

var itemplate = {
    compile: function (string, library) {
        flushParser();
        HTMLParser(encodeTemplates(string), {
            start: onopentag,
            chars: ontext,
            end: onclosetag
        });

        var fn = "";
        for (var key in _staticArrays) {
            if (_staticArrays.hasOwnProperty(key)) {
                fn += "var " + key + "=" + _staticArrays[key] + ";";
            }
        }
        fn += "return function(" + _options.parameterName + "){" + _result.join("") + "}";

        return (new Function('lib', 'helpers', fn))(library, _helpers);
    },
    options: function (options) {
        // mix options
        for (var key in options) {
            if (options.hasOwnProperty(key))
                _options[key] = options[key];
        }
    },
    registerHelper: function (name, fn) {
        _helpers[name] = fn;
    },
    unregisterHelper: function (name) {
        delete _helpers[name];
    }
};