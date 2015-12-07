var N;
var totalTime;
var loopCount;
var timeout;
var $timing = $('#timing');

//benchmark
function benchmarkLoop(fn) {
    var startDate = new Date();
    fn();
    var endDate = new Date();
    totalTime += endDate - startDate;
    loopCount++;
    if (loopCount % 20 === 0) {
        $timing.text('Performed ' + loopCount + ' iterations in ' + totalTime + ' ms (average ' + (totalTime / loopCount).toFixed(2) + ' ms per loop).');
    }
    timeout = _.defer(benchmarkLoop, fn);
}

function benchmarkFlash() {
    totalTime = 0;
    loopCount = 0;
    clearTimeout(timeout);
    $timing.text('-');
    N = parseInt($('input').val(), 10);
    $('#grid').html('');
}

// ReactJS implementation
var reactInit;
(function () {
    var counter;

    var BoxView = React.createClass({
        render: function () {
            var count = this.props.count + 1;
            return (
                React.DOM.div(
                    {className: "box-view"},
                    React.DOM.div(
                        {
                            className: "box",
                            style: {
                                top: Math.ceil(Math.sin(count / 10) * 10),
                                left: Math.ceil(Math.cos(count / 10) * 10),
                                background: 'rgb(0, 0,' + count % 255 + ')'
                            }
                        },
                        count % 100
                    )
                )
            );
        }
    });

    var BoxesView = React.createClass({
        render: function () {
            var boxes = _.map(_.range(N), function (i) {
                return React.createElement(BoxView, {key: i, count: this.props.count});
            }, this);
            return React.DOM.div(null, boxes);
        }
    });

    function reactAnimate() {
        ReactDOM.render(React.createElement(BoxesView, {count: counter++}), document.getElementById('grid'));
    }

    reactInit = function () {
        counter = -1;
        benchmarkLoop(reactAnimate);
    };

})();

// BackboneJS implementation
var backboneInit;
(function () {
    var iDOM = true;
    var boxes;

    var Box = Backbone.Model.extend({
        defaults: {
            top: 0,
            left: 0,
            color: 0,
            content: 0,
            id: 0
        },

        initialize: function () {
            this.count = 0;
        },

        tick: function () {
            var count = this.count += 1;
            this.set({
                top: Math.ceil(Math.sin(count / 10) * 10),
                left: Math.ceil(Math.cos(count / 10) * 10),
                color: (count) % 255,
                content: count % 100,
                id: this.cid
            });
        }
    });

    var BoxView = Backbone.View.extend({
        className: 'box-view',

        itemplate: itemplate.compile($('#i-template').html(), IncrementalDOM),

        template: _.template($('#underscore-template').html()),

        initialize: function () {
            this.model.bind('change', this.render, this);
            console.log(this.itemplate)
        },

        render: function () {
            if (iDOM) {
                IncrementalDOM.patch(this.el, this.itemplate, this.model.attributes);
            } else {
                this.$el.html(this.template(this.model.attributes));
            }
            return this;
        }
    });

    function backboneAnimate() {
        for (var i = 0, l = boxes.length; i < l; i++) {
            boxes[i].tick();
        }
    }

    backboneInit = function (incremental) {
        iDOM = incremental;
        boxes = _.map(_.range(N), function (i) {
            var box = new Box({number: i});
            var view = new BoxView({model: box});
            $('#grid').append(view.render().el);
            return box;
        });
        benchmarkLoop(backboneAnimate);
    };

})();

$('#backbone').click(function () {
    benchmarkFlash();
    backboneInit(false);
});

$('#incremental').click(function () {
    benchmarkFlash();
    backboneInit(true);
});

$('#react').click(function () {
    benchmarkFlash();
    reactInit();
});