import { ICompilePolicyResourceFunc, IResourceMatchFunc } from './resource';
import { ICompileSpecification, ISpecificationMatchFunc, ISpecification } from './specification';
import { ICompileAction, IActionMatchFunc } from './action';
import { ICompilePrincipal, IPrincipalMatchFunc } from './principal';
import { assert, merge } from '../helpers';

/*
 * Compile policy
 */

export enum POLICY_EFFECT {
  ALLOW = 'allow',
  DENY = 'deny'
}

export interface IPolicy {
  version:number;
  path?:string;
  extends?:string;
  id?:string;
  name?:string;
  description?:string;
  effect:POLICY_EFFECT;
  principal:any;
  action:any;
  resource:any;
  specification:ISpecification|ISpecification[];
  obligations?:any[];
}

export interface ICompiledPolicy {
  version:number;
  extends:string;
  id:string;
  path?:string;
  name:string;
  description:string;
  effect:POLICY_EFFECT;
  isPrincipalSatisfied:IPrincipalMatchFunc;
  isActionSatisfied:IActionMatchFunc;
  isResourceSatisfied:IResourceMatchFunc;
  isSpecificationSatisfied:ISpecificationMatchFunc;
  obligations:any[];
  source?:IPolicy;
}

export interface ICompilePolicySpecification {
  (policy:IPolicy):ICompiledPolicy;
}

export interface ICompilePolicyPrincipal {
  (compileSpecification:ICompileSpecification):ICompilePolicySpecification;
}

export interface ICompilePolicyResource {
  (compilePrincipal:ICompilePrincipal):ICompilePolicyPrincipal;
}

export interface ICompilePolicyAction {
  (compileResource:ICompilePolicyResourceFunc):ICompilePolicyResource;
}

export interface ICompilePolicy {
  (compileAction:ICompileAction):ICompilePolicyAction;
}

const getPolicyVersion = (policy:IPolicy) => {
  assert(policy.version !== undefined, 'The policy version is required');
  assert(policy.version === 1, 'Only version 1 policies are supported');
  return policy.version;
};

const getPolicyEffect = (policy:IPolicy) => {
  assert(policy.effect !== undefined, 'The policy effect is required');
  assert(typeof policy.effect === 'string', 'The policy effect must be a string value');
  assert((policy.effect.toLowerCase() === POLICY_EFFECT.ALLOW || policy.effect.toLowerCase() === POLICY_EFFECT.DENY), 'The policy effect can only be "allow" or "deny"');
  return policy.effect;
};

export const compilePolicy:ICompilePolicy = (compileAction:ICompileAction):ICompilePolicyAction =>
  (compileResource:ICompilePolicyResourceFunc):ICompilePolicyResource =>
    (compilePrincipal:ICompilePrincipal):ICompilePolicyPrincipal =>
      (compileSpecification:ICompileSpecification):ICompilePolicySpecification =>
        (policy:IPolicy):ICompiledPolicy => {
          assert(policy !== undefined, 'The policy is undefined');
          assert(typeof policy === 'object', 'The policy is not an object');
          assert(policy.principal !== undefined, 'A value for principal is required');
          assert(policy.action !== undefined, 'A value for action is required');
          assert(policy.resource !== undefined, 'A value for resource is required');
          assert(policy.specification !== undefined, 'A value for specification is required');
          const id = policy.id ?? null;
          return {
            version: getPolicyVersion(policy),
            extends: policy.extends ?? null,
            path: policy.path ?? null,
            id: policy.id,
            name: policy.name ?? null,
            description: policy.description ?? null,
            effect: getPolicyEffect(policy),
            isPrincipalSatisfied: compilePrincipal(policy.principal),
            isActionSatisfied: compileAction(policy.action),
            isResourceSatisfied: compileResource(policy.resource),
            isSpecificationSatisfied: compileSpecification(policy.specification),
            obligations: policy.obligations ?? null,
            source: merge({}, policy, { id: id })
          };
};