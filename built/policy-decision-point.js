'use strict';
module.exports = (function () {
    function PolicyDecisionPoint(prp, pip) {
        this._prp = prp;
        this._pip = pip;
    }
    PolicyDecisionPoint.prototype.authorizeRequestQuery = function (accessRequest) {
        // verify that access request is satisfactory
        // query PolicyRetrievalPoint for policySet containing policies relevant
        // to request...
        var policySet = this._retrievePolicySet(accessRequest);
        // query policySet for attributes that are missing from the accessRequest
        var additionalAttributesRequired = this._identifyMissingAccessRequestAttributes(accessRequest, policySet);
        // query the PolicyInformationPoint for missing attributes
        // query the
        return {
            decision: 'allow',
            reason: 'you are not allowed to do that',
            filters: []
        };
    };
    PolicyDecisionPoint.prototype._retrievePolicySet = function (accessRequest) {
        var policyQuery = {
            action: accessRequest.get('action').get('method'),
            resource: accessRequest.get('resource').get('path'),
            principal: accessRequest.get('subject').get('id')
        };
        return this._prp.retrievePolicySet(policyQuery);
    };
    PolicyDecisionPoint.prototype._identifyMissingAccessRequestAttributes = function (accessRequest, policySet) {
    };
    return PolicyDecisionPoint;
}());
