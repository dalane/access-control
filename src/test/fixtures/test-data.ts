import { IAccessRequest } from "../../app/access-request";
import { IPolicy, ICompiledPolicy } from "../../app/policy/index";
import { POLICY_EFFECT } from "../../app/policy/effect";

export const EmptyAccessRequest:IAccessRequest = {
  action: {},
  subject: {},
  resource: {},
  environment: {}
};

export const DefaultAllowPrincipalPolicy:IPolicy = {
  version: 1,
  name: 'Allow Policy',
  effect: POLICY_EFFECT.ALLOW,
  principal: 'userid:test-principal',
  action: 'command:test',
  specification: {}
};

export const DefaultAllowResourcePolicy:IPolicy = {
  version: 1,
  name: 'Allow Policy',
  effect: POLICY_EFFECT.ALLOW,
  action: 'command:test',
  resource: 'path:/path/to/:test',
  specification: {}
};


export const DefaultDenyPolicy:IPolicy = {
  version: 1,
  name: 'Deny Policy',
  effect: POLICY_EFFECT.DENY,
  action: 'command:test',
  resource: 'path:/path/to/:test',
  specification: {}
};

export const CompiledAllowPolicy:ICompiledPolicy = <ICompiledPolicy>{ ...DefaultAllowPrincipalPolicy, ...{
  isPrincipalSatisfied: (accessRequest) => ({ result: true }),
  isActionSatisfied: (accessRequest) => ({ result: true }),
  isResourceSatisfied: (accessRequest) => ({ result: true }),
  isSpecificationSatisfied: (accessRequest) => true
}};

export const CompiledDenyPolicy:ICompiledPolicy = <ICompiledPolicy>{ ...DefaultDenyPolicy, ...{
  isPrincipalSatisfied: (accessRequest) => ({ result: true }),
  isActionSatisfied: (accessRequest) => ({ result: true }),
  isResourceSatisfied: (accessRequest) => ({ result: true }),
  isSpecificationSatisfied: (accessRequest) => true
}};
