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
        'param', 'source', 'track', 'wbr']
};

module.exports = _options;