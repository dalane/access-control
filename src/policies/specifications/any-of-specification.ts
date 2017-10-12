import {AbstractLogicSpecification} from './abstract-logic-specification';

export class AnyOfSpecification extends AbstractLogicSpecification {
  isSatisfiedBy(accessRequest) {
    if (this.length === 0) {
      return true;
    }
    let passCount = 0;
    this.forEach(specification => {
      let specIsSatisfiedBy = specification.isSatisfiedBy(accessRequest);
      if (specIsSatisfiedBy) passCount++;
    });
    // only one specification needs to return true for the Or specification to be true
    return (passCount > 0);
  }
}
