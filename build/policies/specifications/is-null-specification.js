"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_specification_1 = require("./abstract-specification");
class IsNullSpecification extends abstract_specification_1.AbstractSpecification {
    constructor(attribute, options = {}) {
        super(attribute, null, options);
    }
    isSatisfiedBy(accessRequest) {
        let actualValue = this._getActualValue(accessRequest);
        return (actualValue === null);
    }
}
exports.IsNullSpecification = IsNullSpecification;
