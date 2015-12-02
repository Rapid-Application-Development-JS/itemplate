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
        var html = require('fs').readFileSync('./test/data/test6.html').toString();
        var template = itemplate.compile(html, undefined);
        console.log(template.toString());
    });
});

function (lib) {
    var o = lib.elementOpen, c = lib.elementClose, t = lib.text, v = lib.elementVoid;
    var box = ["class", "box"];
    return function (data) {
        o("div", data.id || "", box, "style", "top: " + data.top || "" + "px; left: " + data.left || "" + "px; background: rgb(0,0," + data.color || "" + ");");
        t(data.content || "");
        c("div");
    };
}

"top: " + 6 || "" + "px; left: " + 7 || "" + "px; background: rgb(0,0," + 7 || "" + ");"