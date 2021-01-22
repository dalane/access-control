import { ICompiledPolicy } from './policy/index';
import { merge } from './helpers';
import { ACCESS_DECISION, IAccessResponse } from './access-response';
import { IAccessRequest } from './access-request';
import { POLICY_EFFECT } from './policy/effect';
import { PolicyAdministrationPointFn } from './policy-administration';

function prepareResponse(decision: ACCESS_DECISION, failedPolicies?: ICompiledPolicy[], messages?: string[]): IAccessResponse {
  return {
    decision: decision,
    ...!!messages && { messages },
    ...!!failedPolicies && { failedPolicies },
    // TODO: obligations to be added in version 2 policy...
  };
}

export type PolicyDecisionPointFn = (accessRequest: IAccessRequest) => IAccessResponse;

// TODO: obligations in version 2 policies...

export function createPolicyDecisionPointFn(policyAdministrationPointFn: PolicyAdministrationPointFn): PolicyDecisionPointFn {
  return (accessRequest:IAccessRequest):IAccessResponse => {
    const policySet = policyAdministrationPointFn(accessRequest);
    if (policySet.length === 0) {
      return prepareResponse(ACCESS_DECISION.NOT_APPLICABLE, undefined, [ 'No valid policies found that match the request' ]);
    }
    const denyPolicies = policySet.reduce((deniedPolicies, matchedPolicyResult) => {
      // we merge params returned by the policy retrieval with the access request for this
      // policy only.
      const accessRequestWithParams = merge({}, accessRequest, {
        resource: { params: matchedPolicyResult?.params?.resource },
        action: { params: matchedPolicyResult?.params?.action },
        subject: { params: matchedPolicyResult?.params?.principal }
      });
      const policyIsSatisfied = matchedPolicyResult.policy.isSpecificationSatisfied(accessRequestWithParams);
      const policyIsAllow = (matchedPolicyResult.policy.effect === POLICY_EFFECT.ALLOW);
      // if a policy effect is deny and isSpecificationSatisfied is true then we deny
      // if a policy effect is allow and isSpecificationSatisfied is false then we deny
      // if a policy effect is deny and isSpecificationSatisfied is false then we allow
      // if a policy effect is allow and isSpecificationSatisfied is true then we allow
      if ((policyIsAllow && !policyIsSatisfied) || (!policyIsAllow && policyIsSatisfied)) {
        deniedPolicies.push(matchedPolicyResult.policy);
      }
      return deniedPolicies;
    }, []);
    // if there are any deny policies then we will reject the access request
    if (denyPolicies.length !== 0) {
      // deny the request as we deny by default or we
      // deny the request because we haven't passed all the checks
      const messages = denyPolicies.map(policy => policy.name ?? policy.path);
      const failedPolicies = denyPolicies.map(p => ({ ...p }));
      return prepareResponse(ACCESS_DECISION.DENY, failedPolicies, messages);
    }
    // allow the request
    return prepareResponse(ACCESS_DECISION.ALLOW);
  };
}
