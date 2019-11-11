import { IAccessRequest } from "../../app/access-request";
import { IPolicy, POLICY_EFFECT, ICompiledPolicy } from "../../app/policy/policy";

export const EmptyAccessRequest:IAccessRequest = {
  action: {},
  subject: {},
  resource: {},
  environment: {}
};

export const DefaultPolicy:IPolicy = {
  version: 1,
  effect: POLICY_EFFECT.ALLOW,
  principal: 'test-principal',
  action: 'command:test',
  resource: '/path/to/:test',
  specification: {}
};

export const CompiledAllowPolicy:ICompiledPolicy = {
  version: 1,
  extends: null,
  id: null,
  name: 'Allow Policy Test 1',
  description: null,
  effect: POLICY_EFFECT.ALLOW,
  isPrincipalSatisfied: (accessRequest) => ({ result: true }),
  isActionSatisfied: (accessRequest) => ({ result: true }),
  isResourceSatisfied: (accessRequest) => ({ result: true }),
  isSpecificationSatisfied: (accessRequest) => true,
  obligations: []
};

export const CompiledDenyPolicy:ICompiledPolicy = {
  version: 1,
  extends: null,
  id: null,
  name: 'Deny Policy Test 1',
  description: null,
  effect: POLICY_EFFECT.DENY,
  isPrincipalSatisfied: (accessRequest) => ({ result: true }),
  isActionSatisfied: (accessRequest) => ({ result: true }),
  isResourceSatisfied: (accessRequest) => ({ result: true }),
  isSpecificationSatisfied: (accessRequest) => true,
  obligations: []
};