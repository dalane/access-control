import {Resource} from './resource';
import {ResourceFactory} from './ResourceFactory';
import {Policy} from './policy';
import {Rule} from './rule';
import {RuleFactory} from './RuleFactory';
import {ObligationExpressionFactory} from './obligations/ObligationExpressionFactory';

export class PolicyFactory {
  private _ruleFactory;
  private _resourceFactory;
  private _obligationExpressionFactory;
  constructor(ruleFactory: RuleFactory, resourceFactory: ResourceFactory, obligationExpressionFactory: ObligationExpressionFactory) {
    this._ruleFactory = ruleFactory;
    this._resourceFactory = resourceFactory;
    this._obligationExpressionFactory = obligationExpressionFactory;
  }
  create(object) {
    let policyProperties = Object.getOwnPropertyNames(object);
    let invalidProperties = policyProperties.filter(property => {
      let validProperties = [
        'id',
        'name',
        'description',
        'effect',
        'action',
        'principal',
        'resource',
        'rule',
        'obligations'
      ];
      if (validProperties.indexOf(property) === -1) {
        return property;
      }
    });
    if (invalidProperties.length !== 0) {
      throw new TypeError('You have attempted to create a policy with invalid fields: ' + invalidProperties.join('; ') + '.');
    }
    // a rule is not mandatory so if it's not set in the object then we don't 
    // need to create a rule and just pass null to the policy...
    let rule = (object.rule) ? this._createRule(object.rule) : null;
    let resource = this._createResource(object.resource);
    let obligations = this._createObligations(object.obligations);
    return new Policy(object.id, object.name, object.description, object.effect, object.action, object.principal, resource, rule, obligations)
  }
  _createResource(uri) {
    return this._resourceFactory.create(uri);
  }
  _createRule(plainObjectRules) {
    return this._ruleFactory.create(plainObjectRules);
  }
  _createObligations(plainObjectObligations) {
    return this._obligationExpressionFactory.create(plainObjectObligations);
  }
};
