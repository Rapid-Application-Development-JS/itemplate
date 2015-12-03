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

    function reversTemplatePrepare(string) { // todo make revers template preparing
        return JSON.stringify(string)
    }

    function wrappFn(body, initialData) {
        if (_options.debug) {
            body = 'try {\n' + body + '\n} catch (err) {\n' +
                //'/*============template===============\n' + initialData + '\n===================================*/\n' +
                    //'console.log("error: ",err.stack, err.message, err.name);' +
                'throw new Error(err.message+"\\n"+' + reversTemplatePrepare(initialData) + ');' +
                '\n}';
        }
        return body;
    }

    function wrapper(stack, holder, initialData) {
        var resultFn;
        var glue = _options.debug ? '\n' : '';
        var fn = 'var elementOpen=lib.elementOpen,elementClose=lib.elementClose,text=lib.text,' +
            'elementVoid=lib.elementVoid;';

        for (var key in holder) { // collect static arrays
            if (holder.hasOwnProperty(key))
                fn += 'var ' + key + '=[' + holder[key] + '];';
        }

        if (_library) {
            fn += 'return function(' + _options.parameterName + '){' + wrappFn(stack.join(glue), initialData) + '};';
            if (_fnName) // return function with closure as string
                resultFn = 'function ' + _fnName + '(lib, helpers){' + fn + '}';
            else // return function with closure
                resultFn = (new Function('lib', 'helpers', fn))(_library, _helpers);
        } else { // todo is it really need ?
            if (_fnName) // plain function as string
                resultFn = 'function ' + _fnName + '(' + _options.parameterName + ', lib, helpers){'
                    + wrappFn(fn + stack.join(glue), initialData) + '}';
            else // plain function
                resultFn = new Function(_options.parameterName, 'lib', 'helpers', wrappFn(fn + stack.join(glue), initialData));
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