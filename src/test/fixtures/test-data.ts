import { IAccessRequest } from "../../app/access-request";
import { IPolicy, POLICY_EFFECT, ICompiledPolicy } from "../../app/policy/index";
import { merge } from "../../app/helpers";


export const EmptyAccessRequest:IAccessRequest = {
  action: {},
  subject: {},
  resource: {},
  environment: {}
};

export const DefaultAllowPolicy:IPolicy = {
  version: 1,
  name: 'Allow Policy',
  effect: POLICY_EFFECT.ALLOW,
  principal: 'test-principal',
  action: 'command:test',
  resource: '/path/to/:test',
  specification: {}
};


export const DefaultDenyPolicy:IPolicy = {
  version: 1,
  name: 'Deny Policy',
  effect: POLICY_EFFECT.DENY,
  principal: 'test-principal',
  action: 'command:test',
  resource: '/path/to/:test',
  specification: {}
};

export const CompiledAllowPolicy:ICompiledPolicy = merge({}, DefaultAllowPolicy, {
  isPrincipalSatisfied: (accessRequest) => ({ result: true }),
  isActionSatisfied: (accessRequest) => ({ result: true }),
  isResourceSatisfied: (accessRequest) => ({ result: true }),
  isSpecificationSatisfied: (accessRequest) => true
});

export const CompiledDenyPolicy:ICompiledPolicy = merge({}, DefaultDenyPolicy, {
  isPrincipalSatisfied: (accessRequest) => ({ result: true }),
  isActionSatisfied: (accessRequest) => ({ result: true }),
  isResourceSatisfied: (accessRequest) => ({ result: true }),
  isSpecificationSatisfied: (accessRequest) => true
});