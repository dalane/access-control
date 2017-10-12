import {AbstractSpecification} from './abstract-specification';

export class IsGreaterThanOrEqualSpecification extends AbstractSpecification {
  isSatisfiedBy(accessRequest) {
    let actualValue = this._getActualValue(accessRequest);
    let expectedValue = this._getExpectedValue(accessRequest);
    return (actualValue >= expectedValue);
  }
}
