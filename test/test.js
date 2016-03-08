describe("DOM Tests", function () {
    var container;

    beforeEach(function () {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(function () {
        document.body.removeChild(container);
    });

    it("0.0.1: plain html", function () {
        var template = itemplate.compile(document.querySelector('#test-0_0_1').textContent, IncrementalDOM);
        var innerHTML = '<div class="title">Title</div><ul><li class="row even">John Smith<em>*</em></li>' +
            '<li class="row">Mark Smith</li></ul><p style="font-size: 12px; "><em>* Olympic gold medalist</em></p>';

        IncrementalDOM.patch(container, template);

        expect(container.innerHTML).to.equal(innerHTML);
    });

    it("0.0.2: plain html - attributes", function () {
        var template = itemplate.compile(document.querySelector('#test-0_0_2').textContent, IncrementalDOM);
        var innerHTML = '<div class="box" my-attr="my-attr"><span>some text</span></div>' +
            '<div my-attr="" class="box"><span>some text</span></div>' +
            '<div my-attr="some-value" class="box"><span>some text</span></div>';

        IncrementalDOM.patch(container, template);
        expect(container.innerHTML).to.equal(innerHTML);
    });

    it("0.0.3: plain html", function () {
        var template = itemplate.compile(document.querySelector('#test-0_0_3').textContent, IncrementalDOM);
        var innerHTML = '<div>Some text<div class="my_class">Other text</div>' +
            '<pre class="lang">some codes "&lt;" and "&amp;" \'.</pre><code>my code</code>' +
            '<x-tag>My custom tag ;-)</x-tag></div>';

        IncrementalDOM.patch(container, template);
        expect(container.innerHTML).to.equal(innerHTML);
    });

    it("0.1.1: open inputs", function () {
        var template = itemplate.compile(document.querySelector('#test-0_1_1').textContent, IncrementalDOM);
        IncrementalDOM.patch(container, template);

        var input = container.querySelector('input');
        expect(input).to.not.equal(null);
        expect(input.hasAttribute('readonly')).to.equal(true);
        expect(input.getAttribute('type')).to.equal('text');
        expect(input.getAttribute('name')).to.equal('text-2');
        expect(input.getAttribute('placeholder')).to.equal('some name');
    });

    it("0.1.2: close inputs", function () {
        var template = itemplate.compile(document.querySelector('#test-0_1_2').textContent, IncrementalDOM);
        IncrementalDOM.patch(container, template);

        var input = container.querySelector('input');
        expect(input).to.not.equal(null);
        expect(input.hasAttribute('readonly')).to.equal(true);
        expect(input.getAttribute('type')).to.equal('text');
        expect(input.getAttribute('name')).to.equal('text-2');
        expect(input.getAttribute('placeholder')).to.equal('some name');
    });


    it("0.2.1: inner expressions <%= %>, <%- %>", function () {
        var template = itemplate.compile(document.querySelector('#test-0_2_1').textContent, IncrementalDOM);
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

    it("0.2.2: embedded js", function () {
        var template = itemplate.compile(document.querySelector('#test-0_2_2').textContent, IncrementalDOM);
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

    it("0.2.3: decode accessory", function () {
        var template = itemplate.compile(document.querySelector('#test-0_2_3').textContent, IncrementalDOM);
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


    it("0.3.1: static keys", function () {
        var template = itemplate.compile(document.querySelector('#test-0_3_1').textContent, IncrementalDOM);
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

    it("0.3.2: static arrays", function () {
        var template = itemplate.compile(document.querySelector('#test-0_3_2').textContent, IncrementalDOM);
        IncrementalDOM.patch(container, template);

        var firstEl = container.querySelector('#id_1');
        var secondEl = container.querySelector('#id_2');

        expect(firstEl.style.border).to.equal(secondEl.style.border);
        expect(firstEl.className).to.equal(secondEl.className);
    });

    it("0.3.3: helpers", function () {
        itemplate.registerHelper('my-input', function (attr) {
            IncrementalDOM.elementVoid('input', null, null, 'class', attr.class);
        });


        var template = itemplate.compile(document.querySelector('#test-0_3_3').textContent, IncrementalDOM);
        IncrementalDOM.patch(container, template);

        var input = container.querySelector('.my-class');
        expect(input).to.not.equal(null);
    });

    it("0.3.4: wrapped helpers", function () {
        itemplate.registerHelper('my-div', function (attr, render) {
            IncrementalDOM.elementOpen('div', null, null, 'class', attr.class);
            render();
            IncrementalDOM.elementClose('div');
        });

        var innerHTML = '<div class="my-wrapper-class"><input class="my-class"></div>';
        var template = itemplate.compile(document.querySelector('#test-0_3_4').textContent, IncrementalDOM);
        IncrementalDOM.patch(container, template);

        expect(container.innerHTML).to.equal(innerHTML);
    });

    it("0.3.5: wrapped helpers", function () {
        itemplate.registerHelper('my-section', function (attr, render) {
            IncrementalDOM.elementOpen('section');
            render();
            IncrementalDOM.elementClose('section');
        });

        var innerHTML = '<section><div class="my-wrapper-class"><input class="my-class"></div></section>';
        var template = itemplate.compile(document.querySelector('#test-0_3_5').textContent, IncrementalDOM);
        IncrementalDOM.patch(container, template);

        expect(container.innerHTML).to.equal(innerHTML);
    });

    it("0.4.1: static refs", function () {
        var templateFn = itemplate.compile(document.querySelector('#test-0_4_1').textContent);
        var refs;

        IncrementalDOM.patch(container, function(){
            refs = templateFn.call({}, {}, IncrementalDOM);
        });

        expect(container.querySelector('section')).to.equal(refs.section);
        expect(container.querySelector('div')).to.equal(refs.div);
        expect(container.querySelector('input')).to.equal(refs.input);
    });

});