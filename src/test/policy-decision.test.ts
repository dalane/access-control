import { assert } from 'chai';
import { CompiledAllowPolicy, CompiledDenyPolicy } from './fixtures/test-data';
import { merge, isEqualObject } from '../app/helpers';
import { ICompiledPolicy } from '../app/policy';
import { IAccessRequest } from '../app/access-request';
import { createPolicyDecisionPointFn } from '../app/policy-decision';
import { PolicyAdministrationPointFn, IMatchedPolicyResult, createPolicyFilterFn } from '../app/policy-administration';
import { ACCESS_DECISION } from '../app/access-response';
import { POLICY_EFFECT } from '../app/policy/effect';

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
      const itThrows = () => createPolicyFilterFn(compiledPolicies)(mockAccessRequest);
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
      const itThrows = () => createPolicyFilterFn(compiledPolicies)(mockAccessRequest);
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
      const itThrows = () => createPolicyFilterFn(compiledPolicies)(mockAccessRequest);
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
      const sut = createPolicyFilterFn(compiledPolicies)(mockAccessRequest);
      assert.isArray(sut, 'Expected an array to be returned');
      assert.equal(sut.length, 1, 'Expected only one record to be returned');
      assert.equal(sut[0].policy.name, CompiledAllowPolicy.name, 'Expected the policy name to match the fixture');
    });
  });
  describe('#policyDecisionPoint function returns an Access Response', () => {
    it('returns a not applicable access response if no policies matched using #findPoliciesMatchingAccessRequest', () => {
      // none of the mocks are using the access request so we can provide an empty object...
      const mockAccessRequest = {} as unknown as IAccessRequest;
      // the mock should return an empty array. This will result in a "ACCESS_DECISION.NOT_APPLICABLE"...
      const mockFindPoliciesMatchingAccessRequest = (accessRequest:IAccessRequest) => [];
      const sut = createPolicyDecisionPointFn(mockFindPoliciesMatchingAccessRequest)(mockAccessRequest);
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
      const sut = createPolicyDecisionPointFn(mockFindPolicySet)(mockAccessRequest);
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
      const sut = createPolicyDecisionPointFn(mockFindPoliciesMatchingAccessRequest)(mockAccessRequest);
      assert.equal(sut.decision, ACCESS_DECISION.ALLOW, 'expected an allow decision');
      assert.isUndefined(sut.messages, 'Expected no messages to be returned');
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
      const sut = createPolicyDecisionPointFn(mockFindPolicySet)(mockAccessRequest);
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
      const sut = createPolicyDecisionPointFn(mockFindPoliciesMatchingAccessRequest)(mockAccessRequest);
      assert.equal(sut.decision, ACCESS_DECISION.ALLOW, 'expected an allow decision');
      assert.isUndefined(sut.messages, 'Expected no messages to be returned');
    });
    it('merges params provided in the policy set into the access request passed to the specification of each matched policy', () => {
       // result of an object comparison of the access request from the PDP versus the expected access request
      let isExpectedPolicy1AccessRequestSpy:boolean = false;
       // result of an object comparison of the access request from the PDP versus the expected access request
      let isExpectedPolicy2AccessRequestSpy:boolean = false;
      // the mockFindPolicySet returns an array of policies that "match" the access request...
      const mockFindPolicySet: PolicyAdministrationPointFn = <PolicyAdministrationPointFn><unknown>((accessRequest: IAccessRequest) => [
        {
          // policy 1 access request should have params from the matched policy params only
          policy: {
            // mock the isSpecificationSatisfied method to populate our spy...
            isSpecificationSatisfied: (accessRequest) => {
              isExpectedPolicy1AccessRequestSpy = isEqualObject(accessRequest, {
                resource: {
                  params: {
                    resourceTest1: 'test-resource-1' // from the matched policy params
                  }
                },
                subject: {
                  'user-id': 'test-user-id', // from the access request
                  params: {
                    principalTest1: 'test-principal-1' // from the matched policy params
                  }
                },
                action: {
                  params: {
                    actionTest1: 'test-action-1' // from the matched policy params
                  }
                },
                environment: {
                  ip: '192.168.0.10' // from the access request
                }
              });
              return true;
            }
          },
          // these are the params that findPolicySet matcher would return...
          params: {
            resource: {
              resourceTest1: 'test-resource-1'
            },
            action: {
              actionTest1: 'test-action-1'
            },
            principal: {
              principalTest1: 'test-principal-1'
            }
          }
        },
        {
          // policy 2 access request should have params from the matched policy params only
          policy: {
            // mock the isSpecificationSatisfied method to populate our spy...
            isSpecificationSatisfied: (accessRequest) => {
              isExpectedPolicy2AccessRequestSpy = isEqualObject(accessRequest, {
                resource: {
                  params: {
                    resourceTest2: 'test-resource-2' // from the matched policy params
                  }
                },
                subject: {
                  'user-id': 'test-user-id', // from the access rquest
                  params: {
                    principalTest2: 'test-principal-2' // from the matched policy params
                  }
                },
                action: {
                  params: {
                    actionTest2: 'test-action-2' // from the matched policy params
                  }
                },
                environment: {
                  ip: '192.168.0.10' // from the access request
                }
              });
              return true;
            }
          },
          // these are the params that findPolicySet matcher would return...
          params: {
            resource: {
              resourceTest2: 'test-resource-2'
            },
            action: {
              actionTest2: 'test-action-2'
            },
            principal: {
              principalTest2: 'test-principal-2'
            }
          }
        }
      ]);
      const mockAccessRequest: IAccessRequest = {
        subject: {
          'user-id': 'test-user-id'
        },
        environment: {
          ip: '192.168.0.10'
        },
        action: {},
        resource: {},
      };
      createPolicyDecisionPointFn(mockFindPolicySet)(mockAccessRequest);
      // assert.isTrue(isExpectedPolicy1AccessRequestSpy, 'Expected the policy 1 params to be found in policy 1 matched access request');
      assert.isTrue(isExpectedPolicy2AccessRequestSpy, 'Expected the policy 2 params to be found in policy 2 isSpecificationSatisfied access request');
    });
  });
});
