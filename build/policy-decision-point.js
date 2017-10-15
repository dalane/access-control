"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const access_response_1 = require("access-request/access-response");
const access_decision_type_1 = require("access-request/access-decision-type");
class PolicyDecisionPoint {
    constructor(prp, pip) {
        this._prp = prp;
        this._pip = pip;
    }
    authorizeRequestQuery(accessRequest) {
        // verify that access request is satisfactory
        // query PolicyRetrievalPoint for policySet containing policies relevant
        // to request...
        let policySet = this._retrievePolicySet(accessRequest);
        // if there are no policies relevant to the access request then send an access-response with 
        // a decision to deny the request
        if (policySet.length === 0)
            return this._prepareDenialMessage([]);
        // query policySet for attributes that are missing from the accessRequest
        // let additionalAttributesRequired = this._identifyMissingAccessRequestAttributes(accessRequest, policySet);
        // query the PolicyInformationPoint for missing attributes
        // additionalAttributesRequired.forEach(missingAttribute => {
        //   this._pip.findValue(accessRequest, missingAttribute.attribute, missingAttribute.datatType, missingAttribute.issuer);
        // });
        // update the access request with the missing attributes
        // let updatedAccessRequest = this._updateAccessRequestWithMissingAttributes(accessRequest, missingAttributes);
        // iterate through each of the policies in the policy set and check if each policy is satisified by the access request
        let allowPolicies = [];
        let denyPolicies = [];
        policySet.forEach(policy => {
            if (policy.isSatisfiedBy(accessRequest)) {
                // policy is satisfied, what is the effect?
                if (policy.effect === 'Allow') {
                    allowPolicies.push(policy);
                }
                else {
                    // the effect if the policy is satisfied is to deny the request.
                    denyPolicies.push(policy);
                }
            }
            else {
                // policy is not satisfied, what is the effect?
                if (policy.effect === 'Deny') {
                    allowPolicies.push(policy);
                }
                else {
                    denyPolicies.push(policy);
                }
            }
        });
        if (allowPolicies.length === 0 || denyPolicies.length !== 0) {
            // deny the request as we deny by default or we 
            // deny the request because we haven't passed all the checks
            return this._prepareDenialMessage(denyPolicies);
        }
        // allow the request
        return this._prepareAllowMessage(allowPolicies);
    }
    _retrievePolicySet(accessRequest) {
        let query = {
            action: accessRequest.body.getIn('action.method'.split('.')),
            resource: accessRequest.body.getIn('resource.path'.split('.')),
            principal: accessRequest.body.getIn('subject.id'.split('.'))
        };
        return this._prp.findPolicies(query);
    }
    _identifyMissingAccessRequestAttributes(accessRequest, policySet) {
        return [];
    }
    _updateAccessRequestWithMissingAttributes(accessRequest, missingAttributes) {
    }
    _noPoliciesFoundDenialResponse() {
        return new access_response_1.AccessResponse(access_decision_type_1.AccessDecisionType.Deny, ['No valid access policies found that match the request.']);
    }
    _prepareDenialMessage(policies) {
        // we need to parse the policies for any obligations on fail
        return new access_response_1.AccessResponse(access_decision_type_1.AccessDecisionType.Deny);
    }
    _prepareAllowMessage(policies) {
        // we need to parse the policies for any obligations on success (e.g. apply a filter)
        return new access_response_1.AccessResponse(access_decision_type_1.AccessDecisionType.Allow);
    }
}
exports.PolicyDecisionPoint = PolicyDecisionPoint;
;
