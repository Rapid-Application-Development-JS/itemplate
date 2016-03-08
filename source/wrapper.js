var _options = require('./options');

var Command = { // incremental DOM commands
    elementOpen: 'elementOpen("',
    elementVoid: 'elementVoid("',
    elementClose: 'elementClose("',
    saveRef: function(name, command) {
        return 'refs.'+ name +' = ' + command;
    },
    text: 'text(',
    close: ');\n'
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
            body = 'return function(' + _options.parameterName + '){' + body + '};';
            resultFn = (new Function('lib', 'helpers', body))(_library, _helpers);
        } else {
            resultFn = new Function(_options.parameterName, 'lib', 'helpers', body );
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