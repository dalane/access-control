import {Resource} from './resource';
import {Policy} from './policy';
import {Rule} from './rule';
import {SpecificationFactory} from './specifications/specification-factory';
import * as UrlPattern from 'url-pattern';

export class PolicyFactory {
  private _specificationFactory: SpecificationFactory;
  constructor(specificationFactory: SpecificationFactory) {
    this._specificationFactory = specificationFactory;
  }
  createPolicyFromJson(jsonPolicy) {
    let plainObjectPolicy = JSON.parse(jsonPolicy);
    let rule = this._createRule(plainObjectPolicy.rules);
    let resource = this._createResource(plainObjectPolicy.resource);
    return new Policy(plainObjectPolicy.id, plainObjectPolicy.name, plainObjectPolicy.description, plainObjectPolicy.effect, plainObjectPolicy.action, plainObjectPolicy.principal, resource, rule, plainObjectPolicy.obligation);
  }
  createPolicyFromRepository(record) {
    record = {
      id: 'xxxx',
      name: '',
      description: '',
      effect: '',
      action: '',
      principal: [],
      resource: [],
      rule: [],
      obligation: [],
    };
    let rule = this._createRule(record.rule);
    let resource = this._createResource(record.resource);
    return new Policy(record.id, record.name, record.description, record.effect, record.action, record.principal, resource, rule, record.obligation)
  }
  _createResource(uri) {
    return new Resource(uri);
  }
  _createRule(plainObjectRules) {
    return new Rule(this._specificationFactory.create(plainObjectRules));
  }
};
