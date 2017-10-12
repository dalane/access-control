"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_specification_1 = require("./abstract-specification");
class IsGreaterThanSpecification extends abstract_specification_1.AbstractSpecification {
    isSatisfiedBy(accessRequest) {
        let actualValue = this._getActualValue(accessRequest);
        let expectedValue = this._getExpectedValue(accessRequest);
        return (actualValue > expectedValue);
    }
}
exports.IsGreaterThanSpecification = IsGreaterThanSpecification;
