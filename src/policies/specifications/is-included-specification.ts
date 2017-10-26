import {AbstractSpecification} from './abstract-specification';

export class IsIncludedSpecification extends AbstractSpecification {
  constructor(attribute, expected, options = {}) {
    // this regular expression will match '${some.value}'
    let checkExpectedRegExp = /\$\{([^}]+)\}/;
    let isExpected = (checkExpectedRegExp.exec(expected) !== null);
    if (!Array.isArray(expected) && !isExpected) {
      throw new TypeError('expected is required to be an array of values');
    }
    super(attribute, expected, options);
  }
  isSatisfiedBy(accessRequest) {
    let actualValue = this._getActualValue(accessRequest);
    let expectedValue = this._getExpectedValue(accessRequest);
    return expectedValue.includes(actualValue);
  }
}
