import { assert } from 'chai';
import { CompiledAllowPolicy, CompiledDenyPolicy } from './fixtures/test-data';
import { makePolicyDecisionPoint, IMatchedPolicyResult, makeFindPolicySet } from '../app/policy-decision';
import { ICompiledPolicy, POLICY_EFFECT } from '../app/policy/index';
import { merge } from '../app/helpers';
import { IAccessRequest } from '../app/access-request';
import { ACCESS_DECISION } from '../app/access-response';

describe('Policy Decision Point', () => {
  describe('finding a policy set from an access request', () => {
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
      const mockAccessRequest = {} as unknown as IAccessRequest;
      const itThrows = () => makeFindPolicySet(compiledPolicies)(mockAccessRequest);
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
      const mockAccessRequest = {} as unknown as IAccessRequest;
      const itThrows = () => makeFindPolicySet(compiledPolicies)(mockAccessRequest);
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
      const mockAccessRequest = {} as unknown as IAccessRequest;
      const itThrows = () => makeFindPolicySet(compiledPolicies)(mockAccessRequest);
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
      const mockAccessRequest = {} as unknown as IAccessRequest;
      const sut = makeFindPolicySet(compiledPolicies)(mockAccessRequest);
      assert.isArray(sut, 'Expected an array to be returned');
      assert.equal(sut.length, 1, 'Expected only one record to be returned');
      assert.equal(sut[0].policy.name, CompiledAllowPolicy.name, 'Expected the policy name to match the fixture');
    });
  });
  describe('#policyDecisionPoint function returns an Access Response', () => {
    it('returns a not applicable access response if no policies matched using #findPoliciesMatchingAccessRequest', () => {
      const policies:ICompiledPolicy[] = [];
      // none of the mocks are using the access request so we can provide an empty object...
      const mockAccessRequest = {} as unknown as IAccessRequest;
      // the mock should return an empty array. This will result in a "ACCESS_DECISION.NOT_APPLICABLE"...
      const mockFindPoliciesMatchingAccessRequest = (accessRequest:IAccessRequest) => [];
      const sut = makePolicyDecisionPoint(mockFindPoliciesMatchingAccessRequest)(mockAccessRequest);
      assert.equal(sut.decision, ACCESS_DECISION.NOT_APPLICABLE, 'expected a deny decision');
      assert.equal(sut.messages.length, 1, 'Expected one message to be returned');
      assert.equal(sut.messages[0], 'No valid policies found that match the request', 'expected a message that no valid policies were found');
    });
    it('returns an access denied response if an allow policy specifications is not satisfied', () => {
      const mockAccessRequest = {} as unknown as IAccessRequest;
      // we have to return at least one record with #findPoliciesMatchingAccessRequest to avoid
      // a NOT_APPLICABLE access response...
      const mockFindPolicySet = (accessRequest:IAccessRequest) => [
        {
          policy: merge({}, CompiledAllowPolicy, {
            isSpecificationSatisfied: () => false // returns false so should result in deny decision...
          }),
          params: {}
        }
      ];
      const sut = makePolicyDecisionPoint(mockFindPolicySet)(mockAccessRequest);
      assert.equal(sut.decision, ACCESS_DECISION.DENY, 'expected a deny decision');
      assert.equal(sut.messages.length, 1, 'Expected one message to be returned');
    });
    it('returns an access allowed response if an allow policy specification is satisfied', () => {
      const fixture:IMatchedPolicyResult[] = [
        {
          policy: merge({}, CompiledAllowPolicy, {
            effect: POLICY_EFFECT.ALLOW,
            isSpecificationSatisfied: () => true // returns false so should result in deny decision...
          }),
          params: {}
        }
      ];
      const mockAccessRequest = {} as unknown as IAccessRequest;
      // we have to return at least one record with #findPoliciesMatchingAccessRequest to avoid
      // a NOT_APPLICABLE access response...
      const mockFindPoliciesMatchingAccessRequest = (accessRequest:IAccessRequest) => fixture;
      const sut = makePolicyDecisionPoint(mockFindPoliciesMatchingAccessRequest)(mockAccessRequest);
      assert.equal(sut.decision, ACCESS_DECISION.ALLOW, 'expected an allow decision');
      assert.equal(sut.messages.length, 0, 'Expected no messages to be returned');
    });
    it('returns an access denied response if a deny policy specifications is satisfied', () => {
      const mockAccessRequest = {} as unknown as IAccessRequest;
      // we have to return at least one record with #findPoliciesMatchingAccessRequest to avoid
      // a NOT_APPLICABLE access response...
      const mockFindPolicySet = (accessRequest:IAccessRequest) => [
        {
          policy: merge({}, CompiledDenyPolicy, {
            isSpecificationSatisfied: () => true // returns false so should result in deny decision...
          }),
          params: {}
        }
      ];
      const sut = makePolicyDecisionPoint(mockFindPolicySet)(mockAccessRequest);
      assert.equal(sut.decision, ACCESS_DECISION.DENY, 'expected a deny decision');
      assert.equal(sut.messages.length, 1, 'Expected one message to be returned');
    });
    it('returns an access allowed response if a deny policy specification is not satisfied', () => {
      const fixture:IMatchedPolicyResult[] = [
        {
          policy: merge({}, CompiledDenyPolicy, {
            isSpecificationSatisfied: () => false // returns false so should result in deny decision...
          }),
          params: {}
        }
      ];
      const mockAccessRequest = {} as unknown as IAccessRequest;
      // we have to return at least one record with #findPoliciesMatchingAccessRequest to avoid
      // a NOT_APPLICABLE access response...
      const mockFindPoliciesMatchingAccessRequest = (accessRequest:IAccessRequest) => fixture;
      const sut = makePolicyDecisionPoint(mockFindPoliciesMatchingAccessRequest)(mockAccessRequest);
      assert.equal(sut.decision, ACCESS_DECISION.ALLOW, 'expected an allow decision');
      assert.equal(sut.messages.length, 0, 'Expected no messages to be returned');
    });
  });
});