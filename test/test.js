var fs = require('fs');
var chai = require("chai");
chai.use(require('chai-fuzzy'));
var should = chai.should();

var itemplate = require("../source/itemplate");

itemplate.registerHelper('console', function (data) {
});

function compareStr(pathToTemplate, pathToResult, callback) {
    fs.readFile(pathToTemplate, 'utf8', function (err, testData) {
        if (err) throw err;
        fs.readFile(pathToResult, 'utf8', function (err, resultData) {
            if (err) throw err;
            var template = itemplate.compile(testData, true, 'myFn');
            callback(template, resultData);
        });
    });
}

describe("0.1: Template decoder checking", function () {
    it("0.1.1: inputs", function (done) {
        compareStr('./test/data/test_1.html', './test/data/test_1.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    it("0.1.2: plain html", function (done) {
        compareStr('./test/data/test_2.html', './test/data/test_2.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    it("0.1.3: <%= %>, <%- %>", function (done) {
        compareStr('./test/data/test_3.html', './test/data/test_3.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    it("0.1.4: embedded js", function (done) {
        compareStr('./test/data/test_4.html', './test/data/test_4.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    it("0.1.5: decode accessory", function (done) {
        compareStr('./test/data/test_5.html', './test/data/test_5.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    it("0.1.6: decode static keys & arrays", function (done) {
        compareStr('./test/data/test_6.html', './test/data/test_6.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    it("0.1.7: decode helpers", function (done) {
        compareStr('./test/data/test_7.html', './test/data/test_7.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
           done();
        });
    });

    it("0.1.8: > & < in templates", function (done) {
        compareStr('./test/data/test_8.html', './test/data/test_8.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    it("0.1.9: text format", function (done) {
        compareStr('./test/data/test_9.html', './test/data/test_9.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    it("0.1.10: attribute with link & format", function (done) {
        compareStr('./test/data/test_10.html', './test/data/test_10.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    it("0.1.11: html5 attributes", function (done) {
        compareStr('./test/data/test_11.html', './test/data/test_11.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    it("0.1.12: plain html", function (done) {
        compareStr('./test/data/test_12.html', './test/data/test_12.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    it("0.1.13: empty attribute value", function (done) {
        compareStr('./test/data/test_13.html', './test/data/test_13.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    it("0.1.14: empty attribute value in helper", function (done) {
        compareStr('./test/data/test_14.html', './test/data/test_14.txt', function (testStr, resultStr) {
            testStr.should.be.equal(resultStr);
            done();
        });
    });

    //
    //it("0.1.2: plain html", function () {
    //    var html = fs.readFileSync('./test/data/test_10.html').toString();
    //    var template = itemplate.compile(html, true, 'myFn');
    //    console.log(template.toString());
    //});
});