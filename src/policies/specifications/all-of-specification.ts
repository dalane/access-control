import {AbstractCollectionSpecification} from './abstract-collection-specification';

export class AllOfSpecification extends AbstractCollectionSpecification {
  isSatisfiedBy(accessRequest) {
    if (this.length === 0) {
      return false;
    }
    let failCount = 0;
    this.forEach(specification => {
      let specIsSatisfiedBy = specification.isSatisfiedBy(accessRequest);
      if (!specIsSatisfiedBy) failCount++;
    });
    return (failCount === 0);
  }
}
