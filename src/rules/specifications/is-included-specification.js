'use strict';

const AbstractSpecification = require('./abstract-specification');

module.exports = class extends AbstractSpecification {
  constructor(path, expected) {
    if (!Array.isArray(expected)) {
      throw new TypeError('expected is required to be an array of values');
    }
    super(path, expected);
  }
  isSatisfiedBy(accessRequest) {
    let actualValue = this._getActualValue(accessRequest);
    return this._expectedValue.includes(actualValue);
  }
}
