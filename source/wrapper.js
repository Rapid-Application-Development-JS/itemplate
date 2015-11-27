var _options = require('./options');

var Command = { // incremental DOM commands
    elementOpen: 'o(\'',
    elementVoid: 'v(\'',
    elementClose: 'c(\'',
    text: 't(',
    close: ');'
};

function Wrapper(library, helpers, callback) {
    return function (stack, holder) {
        var resultFn, fn = '';

        stack.unshift('var o=lib.elementOpen,c=lib.elementClose,t=lib.text,v=lib.elementVoid;'); // todo
        for (var key in holder) {
            if (holder.hasOwnProperty(key)) {
                fn += 'var ' + key + '=' + holder[key] + ';';
            }
        }

        if (library) {
            fn += 'return function(' + _options.parameterName + '){' + stack.join('') + '}';
            resultFn = (new Function('lib', 'helpers', fn))(library, helpers);
        } else {
            resultFn = new Function(_options.parameterName, 'lib', 'helpers', stack.join(''));
        }

        callback(resultFn);
    }
}

module.exports = {
    Wrapper: Wrapper,
    Command: Command
};