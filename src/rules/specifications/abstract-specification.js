'use strict';

class AbstractSpecification {
  constructor(path, expected) {
    this._path = path;
    this._expectedValue = expected;
  }
  isSatisfiedBy(accessRequest) {
    throw new Error('Abstract base class is to be extended');
  }
  _getActualValue(obj) {
    let path = this._path;
    var paths = path.split('.')
    var current = obj
    for (var i = 0; i < paths.length; i++) {
      if (current[paths[i]] === undefined) {
        return undefined;
      } else {
        current = current[paths[i]];
      }
    }
    return current;
  }
}

module.exports = AbstractSpecification;
