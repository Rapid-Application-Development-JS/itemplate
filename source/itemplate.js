var _options = require('./options');
var prepare = require("./prepare");
var Parser = require("./parser");
var Builder = require("./builder");

var wrapper = require("./wrapper").createWrapper();
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

module.exports = itemplate;