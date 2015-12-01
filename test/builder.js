var chai = require("chai");
chai.use(require('chai-fuzzy'));
var should = chai.should();

var itemplate = require("../source/itemplate");

itemplate.registerHelper('console', function (data) {
    console.log();
    console.log('helper data: ', data);
    console.log();
});

describe("0.1: Parser checking", function () {
    it("0.1.2: plain html", function () {
        var html = require('fs').readFileSync('./test/data/test7.html').toString();
        var template = itemplate.compile(html, undefined);
        console.log(template.toString());
    });
});