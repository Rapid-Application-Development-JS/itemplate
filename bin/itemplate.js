;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.itemplate = factory();
  }
}(this, function() {
/*
 * Original code by HTML Parser By John Resig (ejohn.org)
 * http://ejohn.org/blog/pure-javascript-html-parser/
 */

// Regular Expressions for parsing tags and attributes
var startTag = /^<([-A-Za-z0-9_]+)((?:[\s\w\-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
    endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
    attr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

// Empty Elements - HTML 4.01
var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

// Block Elements - HTML 4.01
var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

// Inline Elements - HTML 4.01
var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

// Elements that you can, intentionally, leave open
// (and which close themselves)
var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

// Attributes that have their values filled in disabled="disabled"
var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

// Special Elements (can contain anything),
var special = makeMap("");//"script", "style"

function makeMap(str) {
    var obj = {}, items = str.split(",");
    for (var i = 0; i < items.length; i++)
        obj[items[i]] = true;
    return obj;
}

var HTMLParser = function (html, handler) {
    var index, chars, match, stack = [], last = html;
    stack.last = function () {
        return this[this.length - 1];
    };

    while (html) {
        chars = true;

        if (!stack.last() || !special[stack.last()]) {

            // Comment
            if (html.indexOf("<!--") == 0) {
                index = html.indexOf("-->");

                if (index >= 0) {
                    if (handler.comment)
                        handler.comment(html.substring(4, index));
                    html = html.substring(index + 3);
                    chars = false;
                }

                // end tag
            } else if (html.indexOf("</") == 0) {
                match = html.match(endTag);

                if (match) {
                    html = html.substring(match[0].length);
                    match[0].replace(endTag, parseEndTag);
                    chars = false;
                }

                // start tag
            } else if (html.indexOf("<") == 0) {
                match = html.match(startTag);
                if (match) {
                    html = html.substring(match[0].length);
                    match[0].replace(startTag, parseStartTag);
                    chars = false;
                }
            }

            if (chars) {
                index = html.indexOf("<");

                var text = index < 0 ? html : html.substring(0, index);
                html = index < 0 ? "" : html.substring(index);

                if (handler.chars)
                    handler.chars(text);
            }

        } else {
            html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function (all, text) {
                text = text.replace(/<!--(.*?)-->/g, "$1")
                    .replace(/<!\[CDATA\[(.*?)]]>/g, "$1");

                if (handler.chars)
                    handler.chars(text);

                return "";
            });

            parseEndTag("", stack.last());
        }

        if (html == last)
            throw "Parse Error: " + html;

        last = html;
    }

    // Clean up any remaining tags
    parseEndTag();

    function parseStartTag(tag, tagName, rest, unary) {
        tagName = tagName.toLowerCase();

        if (block[tagName]) {
            while (stack.last() && inline[stack.last()]) {
                parseEndTag("", stack.last());
            }
        }

        if (closeSelf[tagName] && stack.last() == tagName) {
            parseEndTag("", tagName);
        }

        unary = empty[tagName] || !!unary;

        if (!unary)
            stack.push(tagName);

        if (handler.start) {
            var attrs = [];

            rest.replace(attr, function (match, name) {
                var value = arguments[2] ? arguments[2] :
                    arguments[3] ? arguments[3] :
                        arguments[4] ? arguments[4] :
                            fillAttrs[name] ? name : "";

                attrs.push({
                    name: name,
                    value: value,
                    escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
                });
            });

            if (handler.start)
                handler.start(tagName, attrs, unary);
        }
    }

    function parseEndTag(tag, tagName) {
        var pos;

        // If no tag name is provided, clean shop
        if (!tagName)
            pos = 0;

        // Find the closest opened tag of the same type
        else
            for (pos = stack.length - 1; pos >= 0; pos--)
                if (stack[pos] == tagName)
                    break;

        if (pos >= 0) {
            // Close all the open elements, up the stack
            for (var i = stack.length - 1; i >= pos; i--)
                if (handler.end)
                    handler.end(stack[i]);

            // Remove the open elements from the stack
            stack.length = pos;
        }
    }
};
// Consts
const EXCEPTIONS = ["pre", "script"];
const DUTY = ["evaluate"];
const BREAK_LINE = /(\r\n|\n|\r)/gm;
const NEW_LINE = "String.fromCharCode(10)";

if (typeof special === 'object')
    special[DUTY] = true;

// variables
var _result = [];
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
    format: true,
    ignore: "js",
    helpers: {
        open: "{%",
        close: "%}"
    }
};

function escapeHTML(s) {
    return s.replace(_options.escape, function (c) {
        return _options.MAP[c];
    });
}

function flushParser() {
    _result.length = 0;
    _currentTag = null;
}

function decodeTemplates(string, openTag, closeTag) {
    var regex = new RegExp(openTag + '(.*?)' + closeTag, 'g');
    var prefix = true;
    var suffix = true;

    var result = string.replace(regex, function (match, p1, index, string) {
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

    return (prefix ? '\'' : '') + result + (suffix ? '\'' : '');
}

function encodeTemplates(string) {
    return string
        .replace(_options.template.interpolate, function (match, p1) {
            return _options.helpers.open + p1 + _options.helpers.close;
        })
        .replace(_options.template.escape, function (match, p1) {
            return _options.helpers.open + escapeHTML(p1) + _options.helpers.close;
        })
        .replace(_options.template.evaluate, function (match, p1) {
            return "<evaluate>" + p1.trim() + "</evaluate>";
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
function onopentag(name, attributes, unary) { // todo unary
    var attribs = attrsWrapp(attributes);
    var args = ["'" + name + "'"];

    if (DUTY.indexOf(name) === -1) {
        for (var key in attribs) {
            if (attribs.hasOwnProperty(key)) {
                if (args.length === 1) {
                    args.push(null);
                    args.push(null);
                }

                args.push("'" + key + "'");
                args.push(decodeTemplates(attribs[key], _options.helpers.open, _options.helpers.close));
            }
        }

        writeCommand("elementOpen", args);
    }

    _currentTag = name;
}

function ontext(text) {
    var line;
    if (DUTY.indexOf(_currentTag) !== -1) {
        writeLine(text);
    } else if (EXCEPTIONS.indexOf(_currentTag) === -1) {
        line = text.replace(BREAK_LINE, "").trim();
        if (line.length > 0)
            writeCommand("text", decodeTemplates(line, _options.helpers.open, _options.helpers.close), true);
    } else { // save format (break lines) for exception tags
        var lines = text.split(BREAK_LINE);
        for (var i = 0; i < lines.length; i++) {
            line = lines[i];

            if (BREAK_LINE.exec(line))
                writeCommand("text", NEW_LINE, true);
            else
                writeCommand("text", decodeTemplates(line, _options.helpers.open, _options.helpers.close), true);
        }
    }
}

function onclosetag(tagname) {
    if (DUTY.indexOf(tagname) === -1)
        writeCommand("elementClose", tagname);
}

var itemplate = {
    compile: function (string) {
        flushParser();
        HTMLParser(encodeTemplates(string), {
            start: onopentag,
            chars: ontext,
            end: onclosetag
        });

        return new Function(_options.parameterName, _result.join(""));
    },
    options: function (options) {
        // mix options
        for (var key in options) {
            if (options.hasOwnProperty(key))
                _options[key] = options[key];
        }
    }
};
return itemplate;
}));
