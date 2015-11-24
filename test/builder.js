var chai = require("chai");
chai.use(require('chai-fuzzy'));
var should = chai.should();

var Parser = require("../source/parser");
var Builder = require("../source/builder");
var prepare = require("../source/prepare").prepare;

var builder = new Builder();
var parser = new Parser(builder);

describe("0.1: Parser checking", function () {

    beforeEach(function () {
        builder.reset();
    });

    it("0.1.1: Builder exist", function () {
        Builder.should.be.a('function');
    });

    it("0.1.2: plain html", function () {
        var html = require('fs').readFileSync('./test/data/test6.html').toString();
        parser.parseComplete(prepare(html));
    });

});