function TestBuilder() {
    this.reset();
}
TestBuilder.prototype.setCallback = function (callback) {
    this.cb = callback;
};
TestBuilder.prototype.reset = function () {
    this.output = [];
};
TestBuilder.prototype.write = function (element) {
    this.output.push(element);
};
TestBuilder.prototype.done = function () {
    this.cb(this.output);
};
TestBuilder.prototype.error = function (error) {
    this.cb(error);
};

module.exports = TestBuilder;