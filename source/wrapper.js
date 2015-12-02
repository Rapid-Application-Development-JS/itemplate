var _options = require('./options');

var Command = { // incremental DOM commands
    elementOpen: 'elementOpen("',
    elementVoid: 'elementVoid("',
    elementClose: 'elementClose("',
    text: 'text(',
    close: ');'
};

function createWrapper() {
    var _library, _helpers, _fnName;

    function wrapper(stack, holder) {
        var resultFn, fn = 'var elementOpen=lib.elementOpen,elementClose=lib.elementClose,text=lib.text,' +
            'elementVoid=lib.elementVoid;';

        for (var key in holder) { // collect static arrays
            if (holder.hasOwnProperty(key))
                fn += 'var ' + key + '=[' + holder[key] + '];';
        }

        if (_library) {
            fn += 'return function(' + _options.parameterName + '){' + stack.join('') + '};';
            if (_fnName) // return function with closure as string
                resultFn = 'function ' + _fnName + '(lib, helpers){' + fn + '}';
            else // return function with closure
                resultFn = (new Function('lib', 'helpers', fn))(_library, _helpers);
        } else {
            if (_fnName) // plain function as string
                resultFn = 'function ' + _fnName + '(' + _options.parameterName + ', lib, helpers){'
                    + fn + stack.join('') + '}';
            else // plain function
                resultFn = new Function(_options.parameterName, 'lib', 'helpers', fn + stack.join(''));
        }

        return resultFn;
    }

    wrapper.set = function (library, helpers, fnName) {
        _library = library;
        _helpers = helpers;
        _fnName = fnName;
    };

    return wrapper;
}

module.exports = {
    createWrapper: createWrapper,
    Command: Command
};