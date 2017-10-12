'use strict';

const AbstractSpecification = require('./abstract-specification');

module.exports = class extends AbstractSpecification {
  isSatisfiedBy(accessRequest) {
    let actualValue = this._getActualValue(accessRequest);
    let expectedValue = this._getExpectedValue(accessRequest);
    return (actualValue !== expectedValue);
  }
}
