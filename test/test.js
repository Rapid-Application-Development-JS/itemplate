//
//it("0.1.7: decode helpers", function (done) {
//    compareStr('./test/data/test_7.html', './test/data/test_7.txt', function (testStr, resultStr) {
//        testStr.should.be.equal(resultStr);
//       done();
//    });
//});
//
//it("0.1.8: > & < in templates", function (done) {
//    compareStr('./test/data/test_8.html', './test/data/test_8.txt', function (testStr, resultStr) {
//        testStr.should.be.equal(resultStr);
//        done();
//    });
//});
//
//it("0.1.9: text format", function (done) {
//    compareStr('./test/data/test_9.html', './test/data/test_9.txt', function (testStr, resultStr) {
//        testStr.should.be.equal(resultStr);
//        done();
//    });
//});
//
//it("0.1.10: attribute with link & format", function (done) {
//    compareStr('./test/data/test_10.html', './test/data/test_10.txt', function (testStr, resultStr) {
//        testStr.should.be.equal(resultStr);
//        done();
//    });
//});
//
//it("0.1.11: html5 attributes", function (done) {
//    compareStr('./test/data/test_11.html', './test/data/test_11.txt', function (testStr, resultStr) {
//        testStr.should.be.equal(resultStr);
//        done();
//    });
//});
//
//it("0.1.12: plain html", function (done) {
//    compareStr('./test/data/test_12.html', './test/data/test_12.txt', function (testStr, resultStr) {
//        testStr.should.be.equal(resultStr);
//        done();
//    });
//});
//
//it("0.1.13: empty attribute value", function (done) {
//    compareStr('./test/data/test_13.html', './test/data/test_13.txt', function (testStr, resultStr) {
//        testStr.should.be.equal(resultStr);
//        done();
//    });
//});
//
//it("0.1.14: empty attribute value in helper", function (done) {
//    compareStr('./test/data/test_14.html', './test/data/test_14.txt', function (testStr, resultStr) {
//        testStr.should.be.equal(resultStr);
//        done();
//    });
//});

//
//it("0.1.2: plain html", function () {
//    var html = fs.readFileSync('./test/data/test_10.html').toString();
//    var template = itemplate.compile(html, true, 'myFn');
//    console.log(template.toString());
//});

//describe("DOM Tests", function () {
//    var el = document.createElement("div");
//    el.id = "myDiv";
//    el.innerHTML = "Hi there!";
//    el.style.background = "#ccc";
//    document.body.appendChild(el);
//
//    var myEl = document.getElementById('myDiv');
//    it("is in the DOM", function () {
//        expect(myEl).to.not.equal(null);
//    });
//
//    it("is a child of the body", function () {
//        expect(myEl.parentElement).to.equal(document.body);
//    });
//
//    it("has the right text", function () {
//        expect(myEl.innerHTML).to.equal("Hi there!");
//    });
//
//    it("has the right background", function () {
//        expect(myEl.style.background).to.equal("rgb(204, 204, 204)");
//    });
//});

describe("DOM Tests", function () {
    var container;

    beforeEach(function () {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(function () {
        document.body.removeChild(container);
    });

    it("0.1.1: inputs", function () {
        var template = itemplate.compile(document.querySelector('#test-1').textContent, IncrementalDOM);
        IncrementalDOM.patch(container, template);

        var inputs = container.querySelectorAll('input');
        expect(inputs.length).to.equal(5);
    });

    it("0.1.2: inputs attributes", function () {
        var template = itemplate.compile(document.querySelector('#test-1').textContent, IncrementalDOM);
        IncrementalDOM.patch(container, template);

        var input = container.querySelector('#readonly-input');
        expect(input.hasAttribute('readonly')).to.equal(true);
        expect(input.getAttribute('type')).to.equal('text');
        expect(input.getAttribute('name')).to.equal('text-2');
        expect(input.getAttribute('placeholder')).to.equal('some name');
    });

    it("0.1.3: plain html", function () {
        var template = itemplate.compile(document.querySelector('#test-2').textContent, IncrementalDOM);
        var innerHTML = '<div class="title">Title</div><ul><li class="row even">John Smith<em>*</em></li>' +
            '<li class="row">Mark Smith</li></ul><p style="font-size: 12px; "><em>* Olympic gold medalist</em></p>';

        IncrementalDOM.patch(container, template);

        expect(container.innerHTML).to.equal(innerHTML);
    });

    it("0.1.4: expressions <%= %>, <%- %>", function () {
        var template = itemplate.compile(document.querySelector('#test-3').textContent, IncrementalDOM);
        var data = {
            isTrue: true,
            name: 'name',
            lastName: 'lastName',
            listTitle: 'listTitle'
        };
        IncrementalDOM.patch(container, template, data);

        var span = container.querySelector('span.first');
        expect(span).to.not.equal(null);
        expect(span.getAttribute('title')).to.equal('name lastName');

        expect(container.querySelector('._1').textContent).to.equal('listTitle');
        expect(container.querySelector('._2').textContent).to.equal('testlistTitle');
        expect(container.querySelector('._3').textContent).to.equal('listTitletest');
        expect(container.querySelector('._4').textContent).to.equal('testlistTitletest');
        expect(container.querySelector('._5').textContent).to.equal('testlistTitletestlistTitle');
    });

    it("0.1.5: embedded js", function () {
        var template = itemplate.compile(document.querySelector('#test-4').textContent, IncrementalDOM);
        var data = {
            listTitle: "Olympic Volleyball Players",
            listItems: [
                {
                    // name: "Misty May-Treanor",
                    hasOlympicGold: true
                },
                {
                    name: "Kerri Walsh Jennings",
                    hasOlympicGold: true
                },
                {
                    name: "Jennifer Kessy",
                    hasOlympicGold: false
                },
                {
                    name: "April Ross",
                    hasOlympicGold: false
                }
            ]
        };
        var innerHTML = '<ul><li class="row "><em>*</em></li><li class="row  even">Kerri Walsh Jennings<em>*</em></li>' +
            '<li class="row ">Jennifer Kessy</li><li class="row  even">April Ross</li></ul>' +
            '<p style="font-size: 12px; "><em>* Olympic gold medalist</em></p><ul><li class="row"><em>*</em></li>' +
            '<li class="row">Kerri Walsh Jennings<em>*</em></li><li class="row even">Jennifer Kessy<em>*</em></li>' +
            '<li class="row even">April Ross<em>*</em></li></ul>';
        IncrementalDOM.patch(container, template, data);

        expect(container.innerHTML).to.equal(innerHTML);
    });

    it("0.1.6: decode accessory", function () {
        var template = itemplate.compile(document.querySelector('#test-5').textContent, IncrementalDOM);
        var data = {
            listTitle: 'listTitle'
        };
        IncrementalDOM.patch(container, template, data);

        expect(container.querySelector('._1').getAttribute('attr')).to.equal('listTitle');
        expect(container.querySelector('._2').getAttribute('attr')).to.equal('testlistTitle');
        expect(container.querySelector('._3').getAttribute('attr')).to.equal('listTitletest');
        expect(container.querySelector('._4').getAttribute('attr')).to.equal('testlistTitletest');
        expect(container.querySelector('._5').getAttribute('attr')).to.equal('testlistTitletestlistTitle');
    });


    it("0.1.7: static keys", function () {
        var template = itemplate.compile(document.querySelector('#test-6').textContent, IncrementalDOM);
        var data = {
            array: [
                {id: 0, value: 0},
                {id: 1, value: 1},
                {id: 2, value: 2}
            ]
        };

        // render
        IncrementalDOM.patch(container, template, data);

        // get pointer to static & non static elements
        var staticLI = container.querySelectorAll('ul li');
        var nonStaticLI = container.querySelectorAll('ul:nth-child(2) li');

        // insert first element to data array
        data.array.unshift({id: 3, value: 3});

        // rerender
        IncrementalDOM.patch(container, template, data);

        expect(container.querySelectorAll('ul li')[0]).to.not.equal(staticLI[0]);
        expect(container.querySelectorAll('ul li')[1]).to.equal(staticLI[0]);

        expect(container.querySelectorAll('ul:nth-child(2) li')[0]).to.equal(nonStaticLI[0]);
    });

    it("0.1.8: static arrays", function () {
        var template = itemplate.compile(document.querySelector('#test-7').textContent, IncrementalDOM);
        IncrementalDOM.patch(container, template);

        console.log(container.innerHTML);
    });
});