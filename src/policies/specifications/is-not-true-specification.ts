import {AbstractSpecification} from './abstract-specification';

export class IsNotTrueSpecification extends AbstractSpecification {
  constructor(attribute, options = {}) {
    super(attribute, null, options);
  }
  isSatisfiedBy(accessRequest) {
    let actualValue = this._getActualValue(accessRequest);
    if (typeof actualValue == 'boolean') {
      return (actualValue !== true);
    } else {
      return false;
    }
  }
}
