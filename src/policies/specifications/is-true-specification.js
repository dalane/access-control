'use strict';

const AbstractSpecification = require('./abstract-specification');

module.exports = class extends AbstractSpecification {
  constructor(attribute, options = {}) {
    super(attribute, null, options);
  }
  isSatisfiedBy(accessRequest) {
    let actualValue = this._getActualValue(accessRequest);
    return (actualValue === true);
  }
}
