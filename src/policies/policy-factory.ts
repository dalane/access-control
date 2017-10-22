import {Resource} from './resource';
import {ResourceFactory} from './ResourceFactory';
import {Policy} from './policy';
import {Rule} from './rule';
import {RuleFactory} from './RuleFactory';

export class PolicyFactory {
  private _ruleFactory;
  private _resourceFactory;
  constructor(ruleFactory: RuleFactory, resourceFactory: ResourceFactory) {
    this._ruleFactory = ruleFactory;
    this._resourceFactory = resourceFactory;
  }
  create(object) {
    // a rule is not mandatory so if it's not set in the object then we don't 
    // need to create a rule and just pass null to the policy...
    let rule = (object.rule) ? this._createRule(object.rule) : null;
    let resource = this._createResource(object.resource);
    return new Policy(object.id, object.name, object.description, object.effect, object.action, object.principal, resource, rule, object.obligation)
  }
  _createResource(uri) {
    return this._resourceFactory.create(uri);
  }
  _createRule(plainObjectRules) {
    return this._ruleFactory.create(plainObjectRules);
  }
};
