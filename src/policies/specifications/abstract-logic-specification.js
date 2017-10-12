'use strict';

module.exports = class extends Array {
  isSatisfiedBy(accessRequest) {
    throw new Error('Abstract base class is to be extended');
  }
}
