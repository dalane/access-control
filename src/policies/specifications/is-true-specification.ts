import {AbstractSpecification} from './abstract-specification';
import {AccessRequest} from 'access-request/access-request';

export class IsTrueSpecification extends AbstractSpecification {
  constructor(attribute, options = {}) {
    super(attribute, null, options);
  }
  isSatisfiedBy(accessRequest: AccessRequest) {
    let actualValue = this._getActualValue(accessRequest);
    if (typeof actualValue == 'boolean') {
      return (actualValue === true);
    } else {
      return false;
    }
  }
}
