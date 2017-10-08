'use strict';

const AbstractSpecification = require('./abstract-specification');

module.exports = class extends AbstractSpecification {
  isSatisfiedlBy(accessRequest) {
    return true;
  }
}
