"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_logic_specification_1 = require("./abstract-logic-specification");
class AllOfSpecification extends abstract_logic_specification_1.AbstractLogicSpecification {
    isSatisfiedBy(accessRequest) {
        if (this.length === 0) {
            return true;
        }
        let failCount = 0;
        this.forEach(specification => {
            let specIsSatisfiedBy = specification.isSatisfiedBy(accessRequest);
            if (!specIsSatisfiedBy)
                failCount++;
        });
        return (failCount === 0);
    }
}
exports.AllOfSpecification = AllOfSpecification;
