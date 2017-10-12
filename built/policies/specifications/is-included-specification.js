'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractSpecification = require('./abstract-specification');
module.exports = (function (_super) {
    __extends(class_1, _super);
    function class_1(attribute, expected, options) {
        if (options === void 0) { options = {}; }
        if (!Array.isArray(expected)) {
            throw new TypeError('expected is required to be an array of values');
        }
        _super.call(this, attribute, expected, options);
    }
    class_1.prototype.isSatisfiedBy = function (accessRequest) {
        var actualValue = this._getActualValue(accessRequest);
        var expectedValue = this._getExpectedValue(accessRequest);
        return expectedValue.includes(actualValue);
    };
    return class_1;
}(AbstractSpecification));
