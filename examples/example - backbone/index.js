var N = 100;
var iDOM = true;

var Box = Backbone.Model.extend({
    defaults: {
        top: 0,
        left: 0,
        color: 0,
        content: 0
    },

    initialize: function() {
        this.count = 0;
    },

    tick: function() {
        var count = this.count += 1;
        this.set({
            top: Math.ceil(Math.sin(count / 10) * 10),
            left: Math.ceil(Math.cos(count / 10) * 10),
            color: (count) % 255,
            content: count % 100
        });
    }
});

var BoxView = Backbone.View.extend({
    className: 'box-view',

    itemplate: itemplate.compile($('#i-template').html()),

    template: _.template($('#underscore-template').html()),

    initialize: function() {
        this.model.bind('change', this.render, this);
    },

    render: function() {
        if (iDOM) {
            IncrementalDOM.patch(this.el, this.itemplate, this.model.attributes);
        } else {
            this.$el.html(this.template(this.model.attributes));
        }
        return this;
    }
});

var boxes;

var backboneInit = function() {
    boxes = _.map(_.range(N), function(i) {
        var box = new Box({number: i});
        var view = new BoxView({model: box});
        $('#grid').append(view.render().el);
        return box;
    });
};

var backboneAnimate = function() {
    for (var i = 0, l = boxes.length; i < l; i++) {
        boxes[i].tick();
    }
    window.timeout = _.defer(backboneAnimate);
};

backboneInit();
backboneAnimate();

$('button').click(function () {
    iDOM = !iDOM;
    this.innerHTML = iDOM ? 'to normal DOM' : 'to incremental DOM';
});

