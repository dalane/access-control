import { IAccessRequest } from "../access-request";
import { compileHttpAction, ICompileAction } from "./action";
import { assert, assertIsDefined, assertIsObject, merge } from '../helpers';
import { loadJsonPolicyFiles } from '../load-policies-from-json';
import { CompilePrincipalFunc, compileUserIdPrincipal } from './principal';
import { compileUrlPatternResource, ICompileResource } from "./resource";
import { COMPOSITES, ASSERTIONS, ICompileSpecificationFunc, ISpecificationMatchFunc, ISpecification, makeCompileCompositeAssertions, makeCompileAssertions, makeCompileSpecification } from "./specification";


export interface IIsSatisfiedByResult {
  result:boolean;
  params?:{
    [key:string]:any;
  };
  message?:string;
}

export interface IIsSatisfiedByFunction {
  (accessRequest:IAccessRequest):IIsSatisfiedByResult;
}

export const makeIsSatisfiedByResult = (result:boolean, params?:object, message?:string):IIsSatisfiedByResult => ({
  result,
  ...{ params },
  ...{ message }
});


/**
 * Create compiled policies using HTTP method actions, url patterns for resources
 * and subject user-id for principal matching of policies to an access request
 * given the base path to a folder that contains the policy json files.
 * @param basePath {string} path to folder containing policy files
 */
export const createDefaultCompiledPolicies = async (basePath:string):Promise<ICompiledPolicy[]> => {
  // load policies from JSON policy files located in the base path folder...
  const loadedFilePolicies = await loadJsonPolicyFiles(basePath);
  const compileComposites = makeCompileCompositeAssertions(COMPOSITES);
  const compileAssertions = makeCompileAssertions(ASSERTIONS);
  const compileSpecification = makeCompileSpecification(compileComposites)(compileAssertions);
  // compile specications function passed to the policy compilation function using built-in composite assertions and assertions...
  // const compileSpecFunc = compileSpecification(compileCompositeAssertion)(compileAssertion)(COMPOSITES)(ASSERTIONS);
  // policies will be matched based on command-query action name, url pattern resource path  and a user-id property in subject...
  const compilePolicyFunc = makeCompilePolicy(compileHttpAction)(compileUrlPatternResource)(compileUserIdPrincipal)(compileSpecification);
  return loadedFilePolicies.map(compilePolicyFunc);
 };

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
  // obligations?:any[]; TODO: version 2 policy
}

export interface ICompiledPolicy {
  version:number;
  extends?:string;
  id?:string;
  path?:string;
  name?:string;
  description?:string;
  effect:POLICY_EFFECT;
  isPrincipalSatisfied:IIsSatisfiedByFunction;
  isActionSatisfied:IIsSatisfiedByFunction;
  isResourceSatisfied:IIsSatisfiedByFunction;
  isSpecificationSatisfied:ISpecificationMatchFunc;
  principal:any;
  action:any;
  resource:any;
  specification:ISpecification|ISpecification[];
  // obligations?:any[]; TODO: version 2 policy
}

export interface ICompilePolicy {
  (compileAction:ICompileAction):{
    (compileResource:ICompileResource):{
      (compilePrincipal:CompilePrincipalFunc):{
        (compileSpecification:ICompileSpecificationFunc):{
          (policy:IPolicy):ICompiledPolicy;
        };
      };
    };
  };
}

const getPolicyEffect = (policy:IPolicy) => {
  assert(policy.effect !== undefined, 'The policy effect is required');
  assert(typeof policy.effect === 'string', 'The policy effect must be a string value');
  assert((policy.effect.toLowerCase() === POLICY_EFFECT.ALLOW || policy.effect.toLowerCase() === POLICY_EFFECT.DENY), 'The policy effect can only be "allow" or "deny"');
  return policy.effect;
};

export const makeCompilePolicy:ICompilePolicy = (compileActionFn:ICompileAction) =>
  (compileResourceFn:ICompileResource) =>
    (compilePrincipalFn:CompilePrincipalFunc) =>
      (compileSpecificationFn:ICompileSpecificationFunc) =>
        (policy:IPolicy):ICompiledPolicy => {assertIsDefined(policy, 'The policy is undefined');
          assertIsObject(policy, 'The policy is not an object');
          assertIsDefined(policy.version, 'You must specify a policy version');
          assert(policy.version === 1, 'Only version 1 policies are supported');
          assertIsDefined(policy?.effect, 'You must specify a policy effect');
          return {
            version: policy.version,
            extends: policy.extends,
            path: policy.path,
            id: policy.id,
            name: policy.name,
            description: policy?.description,
            effect: getPolicyEffect(policy),
            isPrincipalSatisfied: compilePrincipalFn(policy.principal),
            isActionSatisfied: compileActionFn(policy.action),
            isResourceSatisfied: compileResourceFn(policy.resource),
            isSpecificationSatisfied: compileSpecificationFn(policy.specification),
            // each obligation to a new object and to a new array... TODO: version 2 policy
            // obligations: (undefined !== policy.obligations) ? policy.obligations.map(o => merge({}, o)) : undefined,
            principal: policy.principal,
            action: policy.action,
            resource: policy.resource,
            specification: merge({}, policy.specification)
          };
};