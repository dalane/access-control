'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractSpecification = require('./abstract-specification');
module.exports = (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        _super.apply(this, arguments);
    }
    class_1.prototype.isSatisfiedBy = function (accessRequest) {
        var actualValue = this._getActualValue(accessRequest);
        var expectedValue = this._getExpectedValue(accessRequest);
        return (actualValue <= expectedValue);
    };
    return class_1;
}(AbstractSpecification));
