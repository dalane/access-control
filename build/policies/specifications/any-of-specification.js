"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_collection_specification_1 = require("./abstract-collection-specification");
class AnyOfSpecification extends abstract_collection_specification_1.AbstractCollectionSpecification {
    isSatisfiedBy(accessRequest) {
        if (this.length === 0) {
            return true;
        }
        let passCount = 0;
        this.forEach(specification => {
            let specIsSatisfiedBy = specification.isSatisfiedBy(accessRequest);
            if (specIsSatisfiedBy)
                passCount++;
        });
        // only one specification needs to return true for the Or specification to be true
        return (passCount > 0);
    }
}
exports.AnyOfSpecification = AnyOfSpecification;
