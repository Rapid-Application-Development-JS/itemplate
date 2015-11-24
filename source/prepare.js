var _options = {
    BREAK_LINE: /(\r\n|\n|\r)/gm,
    template: {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    },
    accessory: {
        open: "{%",
        close: "%}"
    },
    evaluate: {
        open: "<evaluate>",
        close: "</evaluate>"
    },
    MAP: {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    },
    order: ['interpolate', 'escape', 'evaluate']
};

function escapeHTML(s) {
    return s.replace(_options.escape, function (c) {
        return _options.MAP[c];
    });
}

function evaluate(string) {
    return string.replace(_options.template.evaluate, function (match, p1) {
        return _options.evaluate.open + p1.replace(_options.BREAK_LINE, " ").trim() + _options.evaluate.close;
    });

}

function interpolate(string) {
    return string.replace(_options.template.interpolate, function (match, p1) {
        return _options.accessory.open + p1 + _options.accessory.close;
    });
}

function escape(string) {
    return string.replace(_options.template.escape, function (match, p1) {
        return _options.accessory.open + escapeHTML(p1) + _options.accessory.close;
    });
}

var methods = {
    evaluate: evaluate,
    interpolate: interpolate,
    escape: escape
};

function prepare(string) {
    var result = string;
    for (var i = 0; i < _options.order.length; i++) {
        result = methods[_options.order[i]](result);
    }
    return result;
}

module.exports = {
    prepare: prepare,
    options: function (options) {
        for (var key in options) { // mix options
            if (options.hasOwnProperty(key) && _options.hasOwnProperty(key))
                _options[key] = options[key];
        }
    }
};