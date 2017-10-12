import {AbstractSpecification} from './abstract-specification';

export class IsNullSpecification extends AbstractSpecification {
  constructor(attribute, options = {}) {
    super(attribute, null, options);
  }
  isSatisfiedBy(accessRequest) {
    let actualValue = this._getActualValue(accessRequest);
    return (actualValue === null);
  }
}
