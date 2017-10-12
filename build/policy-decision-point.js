"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PolicyDecisionPoint {
    constructor(prp, pip) {
        this._prp = prp;
        this._pip = pip;
    }
    authorizeRequestQuery(accessRequest) {
        // verify that access request is satisfactory
        // query PolicyRetrievalPoint for policySet containing policies relevant
        // to request...
        let query = {
            action: accessRequest.action.method,
            resource: accessRequest.resource.uri,
            principal: accessRequest.subject.id
        };
        let policySet = this._retrievePolicySet(query);
        // query policySet for attributes that are missing from the accessRequest
        let additionalAttributesRequired = this._identifyMissingAccessRequestAttributes(accessRequest, policySet);
        // query the PolicyInformationPoint for missing attributes
        // query the
        return {
            decision: 'allow',
            reason: 'you are not allowed to do that',
            filters: []
        };
    }
    _retrievePolicySet(accessRequest) {
        let policyQuery = {
            action: accessRequest.get('action').get('method'),
            resource: accessRequest.get('resource').get('path'),
            principal: accessRequest.get('subject').get('id')
        };
        return this._prp.retrievePolicySet(policyQuery);
    }
    _identifyMissingAccessRequestAttributes(accessRequest, policySet) {
    }
}
exports.PolicyDecisionPoint = PolicyDecisionPoint;
;
