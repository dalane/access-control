import {AbstractLogicSpecification} from './abstract-logic-specification';

export class AllOfSpecification extends AbstractLogicSpecification {
  isSatisfiedBy(accessRequest) {
    if (this.length === 0) {
      return true;
    }
    let failCount = 0;
    this.forEach(specification => {
      let specIsSatisfiedBy = specification.isSatisfiedBy(accessRequest);
      if (!specIsSatisfiedBy) failCount++;
    });
    return (failCount === 0);
  }
}
