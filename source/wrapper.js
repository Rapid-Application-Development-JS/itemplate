var _options = require('./options');

var Command = { // incremental DOM commands
    helpers: '_h',
    binder: '_b',
    elementOpen: '_o("',
    elementClose: '_c("',
    elementVoid: '_v("',
    saveRef: function (name, command) {
        return '_r[' + name + '] = ' + command;
    },
    text: '_t(',
    close: ');\n',
    startSkipContent: function (flag) {
        // compile static values
        flag = (flag === '"false"') ? false : flag;
        flag = (flag === '"true"') ? true : flag;

        return 'if(' + flag + '){_l.skip();}else{';
    },
    endSkipContent: '}'
};

function createWrapper() {
    var _library, _helpers, _fnName, _template;
    var glue = '';
    var eol = '\n';

    function wrapFn(body) {
        var returnValue = eol + ' return _r;';

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
                'var _o = _l.elementOpen;',
                'var _c = _l.elementClose;',
                'var _v = _l.elementVoid;',
                'var _t = _l.text;',
                'var _r = {};',
                '_b = _b || function(fn, data, content){ return fn(data, content); };'
            ].join(eol) + eol;

        for (var key in holder) { // collect static arrays for function
            if (holder.hasOwnProperty(key))
                variables += 'var ' + key + '=[' + holder[key] + '];';
        }
        var body = variables + wrapFn(stack.join(glue));

        if (_library) {
            body = 'return function(' + _options.parameterName + ', ' + _options.renderContentFnName + ', _b){' + body + '};';
            resultFn = (new Function('_l', '_h', body))(_library, _helpers);
        } else {
            resultFn = new Function(_options.parameterName, '_l', '_h', _options.renderContentFnName, '_b', body);
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