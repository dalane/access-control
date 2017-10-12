'use strict';

const UrlPattern = require('url-pattern');
const Resource = require('./resource');
const Policy = require('./policy');
const Rule = require('./rule');
const SpecificationFactory = require('./specifications/factory');

module.exports = class PolicyFactory {
  constructor(specificationFactory) {
    if (!specificationFactory instanceof SpecificationFactory) {
      throw new TypeError('The parameter ruleFactory must be instance of RuleFactory');
    }
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
    return new Rule(this._specificationFactory.build(plainObjectRules));
  }
};
