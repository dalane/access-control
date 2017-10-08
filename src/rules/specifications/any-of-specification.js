'use strict';

const AbstractLogicSpecification = require('./abstract-logic-specification');

module.exports = class extends AbstractLogicSpecification {
  isSatisfiedBy(accessRequest) {
    if (this._specifications.length === 0) {
      return true;
    }
    let passCount = 0;
    this._specifications.forEach(specification => {
      let isSatisfiedBy = specification.isSatisfiedBy(accessRequest);
      if (isSatisfiedBy) passCount++;
    });
    // only one specification needs to return true for the Or specification to be true
    return (passCount > 0);
  }
};
