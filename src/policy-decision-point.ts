import {PolicyRetrievalPoint} from 'policy-retrieval-point';
import {PolicyInformationPoint} from 'policy-information-point';
import {AccessRequest} from 'access-request/access-request';
import {AccessResponse} from 'access-request/access-response';
import {AccessDecisionType} from 'access-request/access-decision-type';
import {PolicySet} from 'policies/policy-set';

export class PolicyDecisionPoint {
  private _prp: PolicyRetrievalPoint;
  private _pip: PolicyInformationPoint;
  constructor(prp: PolicyRetrievalPoint, pip: PolicyInformationPoint) {
    this._prp = prp;
    this._pip = pip;
  }
  authorizeRequestQuery(accessRequest: AccessRequest): AccessResponse {
    // verify that access request is satisfactory
    // query PolicyRetrievalPoint for policySet containing policies relevant
    // to request...
    let policySet = this._retrievePolicySet(accessRequest);
    // if there are no policies relevant to the access request then send an access-response with 
    // a decision to deny the request
    if (policySet.length === 0) return this._prepareDenialMessage([]);
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
        } else { 
          // the effect if the policy is satisfied is to deny the request.
          denyPolicies.push(policy);
        }
      } else {
        // policy is not satisfied, what is the effect?
        if (policy.effect === 'Deny') {
          allowPolicies.push(policy);
        } else {
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
  private _retrievePolicySet(accessRequest: AccessRequest): PolicySet {
    let query = {
      action: accessRequest.body.getIn('action.method'.split('.')),
      resource: accessRequest.body.getIn('resource.path'.split('.')),
      principal: accessRequest.body.getIn('subject.id'.split('.'))
    };
    return this._prp.findPolicies(query);
  }
  private _identifyMissingAccessRequestAttributes(accessRequest: AccessRequest, policySet: PolicySet): Array<object> {
    return [];
  }
  private _updateAccessRequestWithMissingAttributes(accessRequest: AccessRequest, missingAttributes): void {

  }
  private _noPoliciesFoundDenialResponse(): AccessResponse {
    return new AccessResponse(AccessDecisionType.Deny, ['No valid access policies found that match the request.'])
  }
  _prepareDenialMessage(policies): AccessResponse {
    // we need to parse the policies for any obligations on fail
    return new AccessResponse(AccessDecisionType.Deny);
  }
  _prepareAllowMessage(policies): AccessResponse {
    // we need to parse the policies for any obligations on success (e.g. apply a filter)
    return new AccessResponse(AccessDecisionType.Allow);
  }
};
