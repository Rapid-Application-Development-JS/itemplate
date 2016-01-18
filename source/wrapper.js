var _options = require('./options');

var Command = { // incremental DOM commands
    elementOpen: 'elementOpen("',
    elementVoid: 'elementVoid("',
    elementClose: 'elementClose("',
    saveElement: 'rootNodes.push(currentElement());',
    getKey: 'rootKeys.shift()',
    text: 'text(',
    close: ');'
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
        var fn =
            'var elementOpen = lib.elementOpen;' +
            'var elementClose = lib.elementClose;' +
            'var currentElement = lib.currentElement;' +
            'var text = lib.text;' +
            'var elementVoid = lib.elementVoid;';

        var innerVars =
            'var rootNodes = [];' +
            'var rootKeys = keys || [];';

        for (var key in holder) { // collect static arrays for function
            if (holder.hasOwnProperty(key))
                fn += 'var ' + key + '=[' + holder[key] + '];';
        }

        if (_library) {
            fn += 'return function(' + _options.parameterName + ', keys){' + innerVars + wrappFn(stack.join(glue)) + '};';
            if (_fnName) // return function with closure as string
                resultFn = 'function ' + _fnName + '(lib, helpers){' + fn + '}';
            else // return function with closure
                resultFn = (new Function('lib', 'helpers', fn))(_library, _helpers);
        } else {
            if (_fnName) // plain function as string
                resultFn = 'function ' + _fnName + '(' + _options.parameterName + ', lib, helpers){'
                    + wrappFn(fn + stack.join(glue)) + '}';
            else // plain function
                resultFn = new Function(_options.parameterName, 'lib', 'helpers', wrappFn(fn + stack.join(glue)));
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