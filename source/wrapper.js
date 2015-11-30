var _options = require('./options');

var Command = { // incremental DOM commands
    elementOpen: 'o(\'',
    elementVoid: 'v(\'',
    elementClose: 'c(\'',
    text: 't(',
    close: ');'
};

function Wrapper(library, helpers, callback, fnName) {
    return function (stack, holder) {
        var resultFn, fn = 'var o=lib.elementOpen,c=lib.elementClose,t=lib.text,v=lib.elementVoid;';

        for (var key in holder) { // collect static arrays
            if (holder.hasOwnProperty(key))
                fn += 'var ' + key + '=[' + holder[key] + '];';
        }

        if (library) {
            fn += 'return function(' + _options.parameterName + '){' + stack.join('') + '};';
            if (fnName) // return function with closure as string
                resultFn = 'function ' + fnName + '(lib, helpers){' + fn + '}';
            else // return function with closure
                resultFn = (new Function('lib', 'helpers', fn))(library, helpers);
        } else {
            if (fnName) // plain function as string
                resultFn = 'function ' + fnName + '(' + _options.parameterName + ', lib, helpers){'
                    + fn + stack.join('') + '}';
            else // plain function
                resultFn = new Function(_options.parameterName, 'lib', 'helpers', fn + stack.join(''));
        }

        callback(resultFn);
    }
}

module.exports = {
    Wrapper: Wrapper,
    Command: Command
};