'use strict';

const UrlPattern = require('url-pattern');
const Policy = require('./policy');
const RuleFactory = require('./rules/factory');

module.exports = class PolicyFactory {
  constructor(ruleFactory) {
    if (!ruleFactory instanceof RuleFactory) {
      throw new TypeError('ruleFactory expected instance of RuleFactory');
    }
    this._ruleFactory = ruleFactory;
  }
  createPolicyFromJson(jsonPolicy) {
    let plainObjectPolicy = JSON.parse(jsonPolicy);
    let rule = this._createRule(plainObjectPolicy.rules);
    let resource = new UrlPattern(plainObjectPolicy.resource);
    return new Policy(plainObjectPolicy.id, plainObjectPolicy.effect, plainObjectPolicy.action, resource, rule);
  }
  createPolicyFromStore(storePolicy) {
    
  }
  _createRule(plainObjectRules) {
    return this._ruleFactory.build(plainObjectRules);
  }
};
