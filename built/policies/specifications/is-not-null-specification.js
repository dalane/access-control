'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractSpecification = require('./abstract-specification');
module.exports = (function (_super) {
    __extends(class_1, _super);
    function class_1(attribute, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, attribute, null, options);
    }
    class_1.prototype.isSatisfiedBy = function (accessRequest) {
        var actualValue = this._getActualValue(accessRequest);
        return (actualValue !== null);
    };
    return class_1;
}(AbstractSpecification));
