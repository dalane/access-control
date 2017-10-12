"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_1 = require("./resource");
const policy_1 = require("./policy");
const rule_1 = require("./rule");
class PolicyFactory {
    constructor(specificationFactory) {
        this._specificationFactory = specificationFactory;
    }
    createPolicyFromJson(jsonPolicy) {
        let plainObjectPolicy = JSON.parse(jsonPolicy);
        let rule = this._createRule(plainObjectPolicy.rules);
        let resource = this._createResource(plainObjectPolicy.resource);
        return new policy_1.Policy(plainObjectPolicy.id, plainObjectPolicy.name, plainObjectPolicy.description, plainObjectPolicy.effect, plainObjectPolicy.action, plainObjectPolicy.principal, resource, rule, plainObjectPolicy.obligation);
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
        return new policy_1.Policy(record.id, record.name, record.description, record.effect, record.action, record.principal, resource, rule, record.obligation);
    }
    _createResource(uri) {
        return new resource_1.Resource(uri);
    }
    _createRule(plainObjectRules) {
        return new rule_1.Rule(this._specificationFactory.build(plainObjectRules));
    }
}
exports.PolicyFactory = PolicyFactory;
;
