'use strict';

const AbstractSpecification = require('./abstract-specification');

module.exports = class extends AbstractSpecification {
  isSatisfiedBy(accessRequest) {
    let actualValue = this._getActualValue(accessRequest);
    return (actualValue < this._expectedValue);
  }
}
