'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractLogicSpecification = require('./abstract-logic-specification');
module.exports = (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        _super.apply(this, arguments);
    }
    class_1.prototype.isSatisfiedBy = function (accessRequest) {
        if (this.length === 0) {
            return true;
        }
        var failCount = 0;
        this.forEach(function (specification) {
            var isSatisfiedBy = specification.isSatisfiedBy(accessRequest);
            if (!isSatisfiedBy)
                failCount++;
        });
        return (failCount === 0);
    };
    return class_1;
}(AbstractLogicSpecification));
