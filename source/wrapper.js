var _options = require('./options');

var Command = { // incremental DOM commands
    elementOpen: 'elementOpen("',
    elementVoid: 'elementVoid("',
    elementClose: 'elementClose("',
    saveElement: 'rootNodes.push(currentElement());',
    getKey: 'rootKeys.shift()',
    text: 'text(',
    close: ');\n'
};

function createWrapper() {
    var _library, _helpers, _fnName, _template;

    var prepareError = 'var TE=function(m,n,o){this.original=o;this.name=n;(o)?this.stack=this.original.stack:' +
        'this.stack=null;this.message=o.message+m;};var CE=function(){};CE.prototype=Error.prototype;' +
        'TE.prototype=new CE();TE.prototype.constructor=TE;';

    var returnValue = ' return rootNodes;';

    function wrappFn(body) {

        if (_options.debug) {
            return 'try {'
                + body +
                '} catch (err) {'
                + prepareError +
                'throw new TE(' + JSON.stringify(_template) + ', err.name, err);}' + returnValue;
        }

        return body + returnValue;
    }

    function wrapper(stack, holder) {
        var resultFn;
        var glue = '';
        var eol = '\n';
        var fn =
            'var elementOpen = lib.elementOpen;' + eol +
            'var elementClose = lib.elementClose;' + eol +
            'var currentElement = lib.currentElement;' + eol +
            'var text = lib.text;' + eol +
            'var elementVoid = lib.elementVoid;' + eol;

        var innerVars =
            'var rootNodes = [];' + eol +
            'var rootKeys = keys || [];' + eol;

        for (var key in holder) { // collect static arrays for function
            if (holder.hasOwnProperty(key))
                fn += 'var ' + key + '=[' + holder[key] + '];';
        }

        if (_library) {
            fn += 'return function(' + _options.parameterName + ', keys){' + innerVars + wrappFn(stack.join(glue)) + '};';
            resultFn = (new Function('lib', 'helpers', fn))(_library, _helpers);
        } else {
            fn = fn + innerVars + wrappFn( stack.join(glue) );
            resultFn = new Function(_options.parameterName, 'lib', 'helpers, keys', fn );

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