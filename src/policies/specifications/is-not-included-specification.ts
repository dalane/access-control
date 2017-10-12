import {AbstractSpecification} from './abstract-specification';

export class IsNotIncludedSpecification extends AbstractSpecification {
  constructor(attribute, expected, options = {}) {
    if (!Array.isArray(expected)) {
      throw new TypeError('expected is required to be an array of values');
    }
    super(attribute, expected, options);
  }
  isSatisfiedBy(accessRequest) {
    let actualValue = this._getActualValue(accessRequest);
    let expectedValue = this._getExpectedValue(accessRequest);
    return !expectedValue.includes(actualValue);
  }
}
