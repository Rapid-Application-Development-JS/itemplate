var fs = require('fs');
var jsonfile = require('jsonfile');

var parser;
var builder;

function fileToJsonAssert(filePath, jsonPath, callback) {
    var html = fs.readFileSync(filePath).toString();

    builder.setCallback(function (data) {
        jsonfile.readFile(jsonPath, function (err, dataFromFile) {
            callback(data, dataFromFile);
        });
    });

    parser.parseComplete(html);

}

function setDependencies(p, b) {
    parser = p;
    builder = b;
}

module.exports = {
    setDependencies: setDependencies,
    fileToJsonAssert: fileToJsonAssert
};