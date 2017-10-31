import {PolicyRetrievalPoint} from 'policy-retrieval-point';
import {PolicyInformationPoint} from 'policy-information-point';
import {AccessRequest} from './access-request/access-request';
import {AccessResponse} from './access-request/access-response';
import {AccessDecisionType} from './access-request/access-decision-type';
import {PolicySet} from 'policies/policy-set';
import {Map} from 'immutable';

export class PolicyDecisionPoint {
  private _prp: PolicyRetrievalPoint;
  private _pip: PolicyInformationPoint;
  constructor(prp: PolicyRetrievalPoint, pip: PolicyInformationPoint) {
    this._prp = prp;
    this._pip = pip;
  }
  async authorizeRequestQuery(accessRequest: AccessRequest): Promise<AccessResponse> {
    // verify that access request is satisfactory
    // query PolicyRetrievalPoint for policySet containing policies relevant
    // to request...
    let policySet = await this._retrievePolicySet(accessRequest);
    // if there are no policies relevant to the access request then send an access-response with 
    // a decision to deny the request
    if (policySet.length === 0) return this._noPoliciesFoundDenialResponse(accessRequest);
    // update the access request with missing attributes
    // let updatedAccessRequest = await this._updateAccessRequestWithMissingAttributes(accessRequest, policySet);
    let updatedAccessRequest = await this._retrieveMissingAttributes(accessRequest, policySet);
    // iterate through each of the policies in the policy set and check if each policy is satisified by the updated access request
    let allowPolicies = [];
    let denyPolicies = [];
    policySet.forEach(policy => {
      let policyIsSatisfied = policy.isSatisfiedBy(updatedAccessRequest);
      if (policyIsSatisfied) {
        // policy is satisfied, what is the effect?
        switch (policy.effect.toLowerCase()) {
          case 'allow':
            allowPolicies.push(policy);
            break;
          case 'deny':
            denyPolicies.push(policy);
            break;
        }
      } else {
        // policy is not satisfied, what is the effect?
        switch (policy.effect.toLowerCase()) {
          case 'allow':
            denyPolicies.push(policy);
            break;
          case 'deny':
            allowPolicies.push(policy);
            break;
        }
      }
    });
    if (allowPolicies.length === 0 || denyPolicies.length !== 0) {
      // deny the request as we deny by default or we 
      // deny the request because we haven't passed all the checks
      return this._prepareDenialMessage(denyPolicies, updatedAccessRequest);
    }
    // allow the request
    return this._prepareAllowMessage(allowPolicies, updatedAccessRequest);
  }
  private _retrievePolicySet(accessRequest: AccessRequest): Promise<PolicySet> {
    let query = {
      action: accessRequest.getIn('action.method'.split('.')),
      resource: accessRequest.getIn('resource.uri'.split('.')),
      principal: accessRequest.getIn('subject.id'.split('.'))
    };
    return this._prp.find(query);
  }
  private async _retrieveMissingAttributes(accessRequest, policySet: PolicySet): Promise<AccessRequest> {
    // get a list of missing attributes which is achieved by comparing the access 
    // request to the attributes required by the policies...
    let additionalAttributesRequired = this._identifyMissingAccessRequestAttributes(accessRequest, policySet);
    // go through each additional attribute and find a value using the PIP and 
    // store each promise in an array...
    let promises = additionalAttributesRequired.map(attribute => {
      return this._pip.findValue(accessRequest, attribute);
    });
    // await for the promises to resolve
    let values = await Promise.all(promises);
    // create a map joining the attribute names to the found values...
    let foundAttributes = Map<string, any>().withMutations(map => {
      for (let i = 0; i < additionalAttributesRequired.length; i++) {
        let key = additionalAttributesRequired[i].split('.');
        let value = values[i];
        map.setIn(key, value);
      }
    });
    // merge the found attributes maps and get a new merged access request
    return accessRequest.merge(foundAttributes);
  }
  private _identifyMissingAccessRequestAttributes(accessRequest: AccessRequest, policySet: PolicySet): Array<string> {
    // iterate through each policy in the policy set and confirm that the attribute
    // is already in the request. If not, add it to the set of missing attributes.
    return policySet.reduce((missingAttributes, policy) => {
      // it's not a requirement for a policy to have a rule...
      if (!policy.rule) return missingAttributes;
      return policy.rule.attributes.reduce((missingAttributes, attribute) => {
        let searchKey = attribute.split('.');
        if (!accessRequest.hasIn(searchKey)) {
          missingAttributes.push(attribute);
        }
        return missingAttributes;
      }, missingAttributes);
    }, []);
  }
  private _noPoliciesFoundDenialResponse(accessRequest: AccessRequest): AccessResponse {
    return new AccessResponse(accessRequest, AccessDecisionType.Deny, ['No valid access policies found that match the request.'], []);
  }
  private _prepareDenialMessage(policies, accessRequest: AccessRequest): AccessResponse {
    let messages = policies.map(policy => policy.description);
    // we need to parse the policies for any obligations on fail
    return new AccessResponse(accessRequest, AccessDecisionType.Deny, messages, policies.obligations);
  }
  private _prepareAllowMessage(policies, accessRequest: AccessRequest): AccessResponse {
    // we need to parse the policies for any obligations on success (e.g. apply a filter)
    return new AccessResponse(accessRequest, AccessDecisionType.Allow, null, policies.obligations);
  }
};
