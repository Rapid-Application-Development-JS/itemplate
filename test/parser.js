var chai = require("chai");
chai.use(require('chai-fuzzy'));
var should = chai.should();

var Parser = require("../source/parser.js");
var TestBuilder = require("../test/testbuilder.js");
var utils = require("../test/testutils.js");

var builder = new TestBuilder();
var parser = new Parser(builder);
utils.setDependencies(parser, builder);

describe("0.1: Parser checking", function () {

    beforeEach(function () {
        builder.reset();
    });

    it("0.1.1: Parser' exist", function () {
        Parser.should.be.a('function');
    });

    it("0.1.2: plain html", function (done) {
        utils.fileToJsonAssert(
            './test/data/test1.html',
            './test/data/test1.json',
            function (parseData, jsonData) {
                parseData.should.be.like(jsonData);
                done();
            });
    });

    it("0.1.3: several independent html parts", function (done) {
        utils.fileToJsonAssert(
            './test/data/test2.html',
            './test/data/test2.json',
            function (parseData, jsonData) {
                parseData.should.be.like(jsonData);
                done();
            });
    });

    it("0.1.4: support attribute names without values", function (done) {
        utils.fileToJsonAssert(
            './test/data/test3.html',
            './test/data/test3.json',
            function (parseData, jsonData) {
                parseData.should.be.like(jsonData);
                done();
            });
    });

    it("0.1.5: markup inside tag attribute", function (done) {
        utils.fileToJsonAssert(
            './test/data/test4.html',
            './test/data/test4.json',
            function (parseData, jsonData) {
                parseData.should.be.like(jsonData);
                done();
            });
    });

    it("0.1.6: 'script' tag", function (done) {
        utils.fileToJsonAssert(
            './test/data/test5.html',
            './test/data/test5.json',
            function (parseData, jsonData) {
                parseData.should.be.like(jsonData);
                done();
            });
    });

    it("x.x.x: - ", function (done) {
        var html = require('fs').readFileSync('./test/data/test6.html').toString();
        builder.setCallback(function (data) {
            //require('jsonfile').writeFile('./test/data/test5.json', data, function (err) {
            //    console.error(err)
            //});
            console.log(data);
            done();
        });

        parser.parseComplete(html);
    });

    });