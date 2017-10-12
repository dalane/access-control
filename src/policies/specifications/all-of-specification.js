'use strict';

const AbstractLogicSpecification = require('./abstract-logic-specification');

module.exports = class extends AbstractLogicSpecification {
  isSatisfiedBy(accessRequest) {
    if (this.length === 0) {
      return true;
    }
    let failCount = 0;
    this.forEach(specification => {
      let isSatisfiedBy = specification.isSatisfiedBy(accessRequest);
      if (!isSatisfiedBy) failCount++;
    });
    return (failCount === 0);
  }
};
