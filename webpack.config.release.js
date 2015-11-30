"use strict";

var Path = require('path');
var webpack = require("webpack");

function getSourcePath(url) {
    return  Path.join(__dirname, 'source', url);
}

module.exports = {
    entry: getSourcePath('itemplate.js'),
    output: {
        libraryTarget: "umd",
        library: "itemplate",
        path: Path.join(__dirname, 'bin'),
        filename: "itemplate.min.js"
    },
    node: {
        __filename: true
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({ output: {comments: false} })
    ]
};