import { POLICY_EFFECT, ICompiledPolicy } from './policy/index';
import { merge, assertIsBoolean } from './helpers';
import { ACCESS_DECISION, IAccessResponse } from './access-response';
import { IAccessRequest } from './access-request';

const prepareResponse = (decision:ACCESS_DECISION) => (failedPolicies:ICompiledPolicy[] = []) => (messages:string[] = []) => (obligations:any[] = []):IAccessResponse => ({
  decision: decision,
  messages: messages,
  // obligations: obligations, TODO: version 2 policy...
  failedPolicies: failedPolicies
});

// TODO: obligations in version 2 policies...

// const _prepareObligationsResponse = (policySet, accessRequest, decision: ACCESS_DECISION):object[] => {
//   const obligationsResponse = [];
//   const matchedObligationExpressions = this._findMatchingDecisionObligations(policySet, decision);
//   if (matchedObligationExpressions.length === 0) {
//     return obligationsResponse;
//   }
//   const requiredAttributes = [];
//   // identify the attributes that are required for all of the obligations
//   matchedObligationExpressions.forEach(obligation => {
//     obligation.attributes.forEach(attribute => {
//       if (requiredAttributes.indexOf(attribute) === -1) {
//         requiredAttributes.push(attribute);
//       }
//     });
//   });

//   // // create the obligations response for each obligation with the final values
//   // matchedObligationExpressions.forEach(obligation => {
//   //   let payload = {
//   //     id: obligation.id,
//   //     data: {}
//   //   };
//   //   obligation.expression.forEach(attributeExpression => {
//   //     payload.data[attributeExpression.property] = (attributeExpression.value !== undefined) ? attributeExpression.value : matchedAttributes.get(attributeExpression.attribute);
//   //   });
//   //   obligationsResponse.push(payload);
//   // });
//   return obligationsResponse;
// };

export const makePolicyDecisionPoint = (findPolicySet:IMatchAccessRequestToPolicy) => (accessRequest:IAccessRequest):IAccessResponse => {
  const policySet = findPolicySet(accessRequest);
  if (policySet.length === 0) {
    return prepareResponse(ACCESS_DECISION.NOT_APPLICABLE)()([ 'No valid policies found that match the request' ])();
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
    const failedPolicies = denyPolicies.map(p => merge({}, p));
    return prepareResponse(ACCESS_DECISION.DENY)(failedPolicies)(messages)([]);
  }
  // allow the request
  return prepareResponse(ACCESS_DECISION.ALLOW)()()();
};

export interface IMatchedPolicyResult {
  policy: ICompiledPolicy;
  params?: {
    resource?: {
      [key:string]:any
    },
    principal?: {
      [key:string]:any
    },
    action?: {
      [key:string]:any
    }
  };
}

export interface IMatchCompiledPolicies {
  (compiledPolicies:ICompiledPolicy[]):IMatchAccessRequestToPolicy;
}

export interface IMatchAccessRequestToPolicy {
  (accessRequest:IAccessRequest):IMatchedPolicyResult[];
}

export const makeFindPolicySet:IMatchCompiledPolicies = (compiledPolicies:ICompiledPolicy[]):IMatchAccessRequestToPolicy => (accessRequest:IAccessRequest):IMatchedPolicyResult[] => {
  return compiledPolicies.reduce((policySet:IMatchedPolicyResult[], compiledPolicy:ICompiledPolicy) => {
    // console.log(accessRequest, compiledPolicy, compiledPolicy.isPrincipalSatisfied(accessRequest), compiledPolicy.isActionSatisfied(accessRequest), compiledPolicy.isResourceSatisfied(accessRequest));
    const principalResult = compiledPolicy.isPrincipalSatisfied(accessRequest);
    assertIsBoolean(principalResult.result, 'Expected the compiled policy to return a "result" property with a boolean value to "#isPrincipalSatisfied"');
    if (principalResult.result === false) {
      return policySet;
    }
    const actionResult = compiledPolicy.isActionSatisfied(accessRequest);
    assertIsBoolean(actionResult.result, 'Expected the compiled policy to return a "result" property with a boolean value to "#isActionSatisfied"');
    if (actionResult.result === false) {
      return policySet;
    }
    const resourceResult = compiledPolicy.isResourceSatisfied(accessRequest);
    assertIsBoolean(resourceResult.result, 'Expected the compiled policy to return a "result" property with a boolean value to "#isResourceSatisfied"');
    if (resourceResult.result === false) {
      return policySet;
    }
    policySet.push({
      policy: compiledPolicy,
      params: {
        resource: resourceResult.params || {},
        principal: principalResult.params || {},
        action: actionResult.params || {}
      }
    });
    return policySet;
  }, []);
};