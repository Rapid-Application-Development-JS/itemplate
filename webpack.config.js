"use strict";

var Path = require('path');

function getSourcePath(url) {
    return  Path.join(__dirname, 'source', url);
}

module.exports = {
    entry: getSourcePath('itemplate.js'),
    output: {
        libraryTarget: "umd",
        library: "itemplate",
        path: Path.join(__dirname, 'bin'),
        filename: "itemplate.js"
    }, node: {
        __filename: true
    }
};