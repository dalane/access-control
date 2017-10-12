"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_specification_1 = require("./abstract-specification");
class IsNotIncludedSpecification extends abstract_specification_1.AbstractSpecification {
    constructor(attribute, expected, options = {}) {
        if (!Array.isArray(expected)) {
            throw new TypeError('expected is required to be an array of values');
        }
        super(attribute, expected, options);
    }
    isSatisfiedBy(accessRequest) {
        let actualValue = this._getActualValue(accessRequest);
        let expectedValue = this._getExpectedValue(accessRequest);
        return !expectedValue.includes(actualValue);
    }
}
exports.IsNotIncludedSpecification = IsNotIncludedSpecification;
