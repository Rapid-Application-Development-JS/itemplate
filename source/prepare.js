var _options = require('./options');

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