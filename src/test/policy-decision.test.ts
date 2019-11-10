import { assert } from 'chai';
import { CompiledAllowPolicy, CompiledDenyPolicy } from '@tests/fixtures/test-data';
import { policyDecisionPoint, policySetIsSatisfiedBy, IMatchedPolicyResult, findPoliciesMatchingAccessRequest, IMatchCompiledPolicies } from '@app/policy-decision';
import { ICompiledPolicy } from '@app/policy/policy';
import { merge } from '@app/helpers';
import { IAccessRequest } from '@app/access-request';
import { ACCESS_DECISION } from '@app/access-response';

describe('Policy Decision Point', () => {
  describe('#findPoliciesMatchingAccessRequest function returns a policy set', () => {
    it('throws an error if the policy\'s #isPrincipalSatisfied is not correctly formatted', () => {
      // four policies provided to the SUT, only one should be returned that
      // returns true on principal, action and resource...
      const compiledPolicies:ICompiledPolicy[] = [
        merge({}, CompiledAllowPolicy, {
          isPrincipalSatisfied: () => false
        })
      ];
      // we can provide an empty access request as the mock functions will
      // return true / false without needing the access request.
      const mockAccessRequest = <IAccessRequest><unknown>{};
      const itThrows = () => findPoliciesMatchingAccessRequest(compiledPolicies)(mockAccessRequest);
      assert.throws(itThrows, 'Expected the compiled policy to return a "result" property with a boolean value to "#isPrincipalSatisfied"');
    });
    it('throws an error if the policy\'s #isActionSatisfied is not correctly formatted', () => {
      // four policies provided to the SUT, only one should be returned that
      // returns true on principal, action and resource...
      const compiledPolicies:ICompiledPolicy[] = [
        merge({}, CompiledAllowPolicy, {
          isActionSatisfied: () => false
        })
      ];
      // we can provide an empty access request as the mock functions will
      // return true / false without needing the access request.
      const mockAccessRequest = <IAccessRequest><unknown>{};
      const itThrows = () => findPoliciesMatchingAccessRequest(compiledPolicies)(mockAccessRequest);
      assert.throws(itThrows, 'Expected the compiled policy to return a "result" property with a boolean value to "#isActionSatisfied"');
    });
    it('throws an error if the policy\'s #isResourceSatisfied is not correctly formatted', () => {
      // four policies provided to the SUT, only one should be returned that
      // returns true on principal, action and resource...
      const compiledPolicies:ICompiledPolicy[] = [
        merge({}, CompiledAllowPolicy, {
          isResourceSatisfied: () => false
        })
      ];
      // we can provide an empty access request as the mock functions will
      // return true / false without needing the access request.
      const mockAccessRequest = <IAccessRequest><unknown>{};
      const itThrows = () => findPoliciesMatchingAccessRequest(compiledPolicies)(mockAccessRequest);
      assert.throws(itThrows, 'Expected the compiled policy to return a "result" property with a boolean value to "#isResourceSatisfied"');
    });
    it('returns a set of policies that match the access request on resource, principal and action', () => {
      // four policies provided to the SUT, only one should be returned that
      // returns true on principal, action and resource...
      const compiledPolicies:ICompiledPolicy[] = [
        CompiledAllowPolicy,
        merge({}, CompiledAllowPolicy, {
          name: 'Allowed Policy Test 2',
          isPrincipalSatisfied: () => ({ result: false })
        }),
        merge({}, CompiledAllowPolicy, {
          name: 'Allowed Policy Test 3',
          isActionSatisfied: () => ({ result: false })
        }),
        merge({}, CompiledAllowPolicy, {
          name: 'Allowed Policy Test 4',
          isResourceSatisfied: () => ({ result: false })
        })
      ];
      // we can provide an empty access request as the mock functions will
      // return true / false without needing the access request.
      const mockAccessRequest = <IAccessRequest><unknown>{};
      const sut = findPoliciesMatchingAccessRequest(compiledPolicies)(mockAccessRequest);
      assert.isArray(sut, 'Expected an array to be returned');
      assert.equal(sut.length, 1, 'Expected only one record to be returned');
      assert.equal(sut[0].policy.name, CompiledAllowPolicy.name, 'Expected the policy name to match the fixture');
    });
  });
  describe('#policySetIsSatisfiedBy function returns an array of policies that have failed the specification', () => {
    it('merges params from IMatchedResult objects into the access request for that policy only', () => {
      // the spy is used to verify that the params were merged into the access request...
      let spyTest1ResourceParams, spyTest2ActionParams, spyTest1ActionParams, spyTest2ResourceParams;
      const policySet:IMatchedPolicyResult[] = [
        {
          policy: merge({}, CompiledAllowPolicy, {
            name: 'Test 1',
            isSpecificationSatisfied: (accessRequest:IAccessRequest) => {
              spyTest1ResourceParams = accessRequest.resource.params;
              spyTest1ActionParams = accessRequest.action.params;
              return true;
            }
          }),
          params: {
            resource: {
              test: 'resource-test' // this param should be merged into the access request but only for this policy...
            }
          }
        },
        {
          policy: merge({}, CompiledAllowPolicy, {
            name: 'Test 2',
            isSpecificationSatisfied: (accessRequest:IAccessRequest) => {
              spyTest2ResourceParams = accessRequest.resource.params;
              spyTest2ActionParams = accessRequest.action.params;
              return true;
            }
          }),
          params: {
            action: {
              test: 'action-test' // this param should be merged into the access request only for this policy...
            }
          }
        }
      ];
      const mockAccessRequest = <IAccessRequest><unknown>{
        action: {
          test: 'test-action'
        },
        resource: {
          test: 'test-resource'
        }
      };
      const sut = policySetIsSatisfiedBy(policySet)(mockAccessRequest);
      assert.isDefined(spyTest1ResourceParams, 'The resource spy in policy Test 1 should be defined');
      assert.isNull(spyTest1ActionParams, 'The action spy in policy Test 1 should be null as it is a param passed by Test 2 policy');
      assert.isDefined(spyTest2ActionParams, 'The actionspy in policy Test 2 should be defined');
      assert.isNull(spyTest2ResourceParams, 'The resource spy in policy Test 2 should be null as it is a param passed by Test 1 policy');
      assert.equal(spyTest1ResourceParams.test, 'resource-test', 'Expected the Test 1 policy resource parameter to equal "resource-test"');
      assert.equal(spyTest2ActionParams.test, 'action-test', 'Expected the Test 1 policy resource parameter to equal "action-test"');
    });
    it('passes a policy if the specification fails and the policy effect is to deny', () => {
      const policySet:IMatchedPolicyResult[] = [
        {
          policy: merge({}, CompiledDenyPolicy, {
              // effect: POLICY_EFFECT.DENY,
              isSpecificationSatisfied: () => false
          })
        }
      ];
      const mockAccessRequest = <IAccessRequest><unknown>{};
      const sut = policySetIsSatisfiedBy(policySet)(mockAccessRequest);
      assert.equal(sut.length, 0, 'Expected no denied policies to be returned');
    });
    it('passes a policy if the specification passes and the policy effect is to allow', () => {
      const policySet:IMatchedPolicyResult[] = [
        {
          policy: merge({}, CompiledAllowPolicy, {
              // effect: POLICY_EFFECT.ALLOW,
              isSpecificationSatisfied: () => true
          })
        }
      ];
      const mockAccessRequest = <IAccessRequest><unknown>{};
      const sut = policySetIsSatisfiedBy(policySet)(mockAccessRequest);
      assert.equal(sut.length, 0, 'Expected no denied policies to be returned');
    });
    it('fails a policy if the specification passes and the policy effect is to deny', () => {
      const policySet:IMatchedPolicyResult[] = [
        {
          policy: merge({}, CompiledDenyPolicy, {
              // effect: POLICY_EFFECT.DENY,
              isSpecificationSatisfied: () => true
          })
        }
      ];
      const mockAccessRequest = <IAccessRequest><unknown>{};
      const sut = policySetIsSatisfiedBy(policySet)(mockAccessRequest);
      assert.equal(sut.length, 1, 'Expected one policy to be denied');
    });
    it('fails a policy if the specification fails and the policy effect it to allow', () => {
      const policySet:IMatchedPolicyResult[] = [
        {
          policy: merge({}, CompiledAllowPolicy, {
              // effect: POLICY_EFFECT.ALLOW,
              isSpecificationSatisfied: () => false
          })
        }
      ];
      const mockAccessRequest = <IAccessRequest><unknown>{};
      const sut = policySetIsSatisfiedBy(policySet)(mockAccessRequest);
      assert.equal(sut.length, 1, 'Expected one policy to be denied');
    });
  });
  describe('#policyDecisionPoint function returns an Access Response', () => {
    it('returns a not applicable access response if no policies matched using #findPoliciesMatchingAccessRequest', () => {
      const policies:ICompiledPolicy[] = [];
      // none of the mocks are using the access request so we can provide an empty object...
      const mockAccessRequest = <IAccessRequest><unknown>{};
      // the mock should return an empty array. This will result in a "ACCESS_DECISION.NOT_APPLICABLE"...
      const mockFindPoliciesMatchingAccessRequest = () => () => [];
      // mockPolicySetIsSatisfiedBy should not be reached...
      const mockPolicySetIsSatisfiedBy = () => () => [];
      const sut = policyDecisionPoint(policies)(mockFindPoliciesMatchingAccessRequest)(mockPolicySetIsSatisfiedBy)(mockAccessRequest);
      assert.equal(sut.decision, ACCESS_DECISION.NOT_APPLICABLE, 'expected a deny decision');
      assert.equal(sut.messages.length, 1, 'Expected one message to be returned');
      assert.equal(sut.messages[0], 'No valid policies found that match the request', 'expected a message that no valid policies were found');
    });
    it('returns an access denied response if any allow specifications are not satisfied', () => {
      const fixture:ICompiledPolicy[] = [
        merge({}, CompiledAllowPolicy, {
          name: 'Allowed Policy Test 4',
          isSpecificationSatisfied: () => false // returns false so should result in deny decision...
        })
      ];
      const mockAccessRequest = <IAccessRequest><unknown>{};
      // we have to return at least one record with #findPoliciesMatchingAccessRequest to avoid
      // a NOT_APPLICABLE access response...
      const mockFindPoliciesMatchingAccessRequest = () => () => fixture;
      const mockPolicySetIsSatisfiedBy = () => () => fixture;
      const sut = policyDecisionPoint(fixture)(<IMatchCompiledPolicies><unknown>mockFindPoliciesMatchingAccessRequest)(mockPolicySetIsSatisfiedBy)(mockAccessRequest);
      assert.equal(sut.decision, ACCESS_DECISION.DENY, 'expected a deny decision');
      assert.equal(sut.messages.length, 1, 'Expected one message to be returned');
      assert.equal(sut.messages[0], 'Failed "Allowed Policy Test 4"', 'expected the policy "Allow Test 4" to be the failing policy');
    });
    it('returns an access allowed response if there are no denied policies in a policy set', () => {
      const fixtures:ICompiledPolicy[] = [
        CompiledAllowPolicy
      ];
      const mockAccessRequest = <IAccessRequest><unknown>{};
      // we have to return at least one record with #findPoliciesMatchingAccessRequest to avoid
      // a NOT_APPLICABLE access response...
      const mockFindPoliciesMatchingAccessRequest = () => () => fixtures;
      // returning an empty array for #policySetIsSatisfiedBy means no policies failed
      // and therefore we will allow the access request...
      const mockPolicySetIsSatisfiedBy = () => () => [];
      const sut = policyDecisionPoint(fixtures)(<IMatchCompiledPolicies><unknown>mockFindPoliciesMatchingAccessRequest)(mockPolicySetIsSatisfiedBy)(mockAccessRequest);
      assert.equal(sut.decision, ACCESS_DECISION.ALLOW, 'expected an allow decision');
      assert.equal(sut.messages.length, 0, 'Expected no messages to be returned');
    });
  });
});