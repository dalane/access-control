import {Rule} from './rule';
import {SpecificationFactory} from './specifications/specification-factory';

export class RuleFactory {
  private _specificationFactory;
  constructor(specificationFactory: SpecificationFactory) {
    this._specificationFactory = specificationFactory;
  }
  create(plainObjectRules) {
    return new Rule(this._specificationFactory.create(plainObjectRules));
  }
}