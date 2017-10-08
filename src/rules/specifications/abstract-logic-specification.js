'use strict';

const AbstractSpecification = require('./abstract-specification');

module.exports = class {
  constructor() {
    this._specifications = [];
  }
  add(specification) {
    this._specifications.push(specification);
  }
  get specifications() {
    return this._specifications;
  }
  isSatisfiedBy(accessRequest) {
    throw new Error('Abstract base class is to be extended');
  }
}
