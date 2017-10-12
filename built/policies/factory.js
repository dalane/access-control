'use strict';
var UrlPattern = require('url-pattern');
var Resource = require('./resource');
var Policy = require('./policy');
var Rule = require('./rule');
var SpecificationFactory = require('./specifications/factory');
module.exports = (function () {
    function PolicyFactory(specificationFactory) {
        if (!specificationFactory instanceof SpecificationFactory) {
            throw new TypeError('The parameter ruleFactory must be instance of RuleFactory');
        }
        this._specificationFactory = specificationFactory;
    }
    PolicyFactory.prototype.createPolicyFromJson = function (jsonPolicy) {
        var plainObjectPolicy = JSON.parse(jsonPolicy);
        var rule = this._createRule(plainObjectPolicy.rules);
        var resource = this._createResource(plainObjectPolicy.resource);
        return new Policy(plainObjectPolicy.id, plainObjectPolicy.name, plainObjectPolicy.description, plainObjectPolicy.effect, plainObjectPolicy.action, plainObjectPolicy.principal, resource, rule, plainObjectPolicy.obligation);
    };
    PolicyFactory.prototype.createPolicyFromRepository = function (record) {
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
        var rule = this._createRule(record.rule);
        var resource = this._createResource(record.resource);
        return new Policy(record.id, record.name, record.description, record.effect, record.action, record.principal, resource, rule, record.obligation);
    };
    PolicyFactory.prototype._createResource = function (uri) {
        return new Resource(uri);
    };
    PolicyFactory.prototype._createRule = function (plainObjectRules) {
        return new Rule(this._specificationFactory.build(plainObjectRules));
    };
    return PolicyFactory;
}());
