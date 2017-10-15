"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_specification_1 = require("./abstract-specification");
class IsNotTrueSpecification extends abstract_specification_1.AbstractSpecification {
    constructor(attribute, options = {}) {
        super(attribute, null, options);
    }
    isSatisfiedBy(accessRequest) {
        let actualValue = this._getActualValue(accessRequest);
        if (typeof actualValue == 'boolean') {
            return (actualValue !== true);
        }
        else {
            return false;
        }
    }
}
exports.IsNotTrueSpecification = IsNotTrueSpecification;
