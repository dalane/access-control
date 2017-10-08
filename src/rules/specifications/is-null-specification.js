'use strict';

const AbstractSpecification = require('./abstract-specification');

module.exports = class extends AbstractSpecification {
  constructor(path) {
    super(path, null);
  }
  isSatisfiedBy(accessRequest) {
    let actualValue = this._getActualValue(accessRequest, true);
    return (actualValue === null);
  }
}
