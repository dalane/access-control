import { loadJsonPolicyFiles } from '@app/load-policies-from-json';
import { IPolicy, ICompilePolicy, ICompilePolicyAction, ICompilePolicyPrincipal, ICompilePolicyResource, ICompilePolicySpecification, ICompiledPolicy, POLICY_EFFECT, compilePolicy } from '@app/policy/policy';
import { ICompileAssertion, ICompositeAssertions, IAssertions, IAssertionFunction, ASSERTIONS, compileAssertion, COMPOSITES, compileSpecification, compileCompositeAssertion, ISpecification, ICompileSpecification, ISpecificationMatchFunc } from "@app/policy/specification";
import { IAccessRequest } from '@app/access-request';
import { ACCESS_DECISION, IAccessResponse } from '@app/access-response';
import { policyDecisionPoint, policySetIsSatisfiedBy, IMatchedPolicyResult, findPoliciesMatchingAccessRequest, IMatchCompiledPolicies } from '@app/policy-decision';
import { IPrincipalMatchResult, IPrincipalMatchFunc, ICompilePrincipal,compileUserIdPrincipal } from '@app/policy/principal';
import { compileCommandQueryAction, compileHttpAction, ICompileAction, IActionMatchFunc, IActionMatchResult } from '@app/policy/action';
import { ICompilePolicyResourceFunc, IResourceMatchFunc, IResourceMatchResult, compileUrlPatternResource } from '@app/policy/resource';

export { loadJsonPolicyFiles };
export { POLICY_EFFECT, IPolicy, ICompiledPolicy, ICompilePolicySpecification, ICompilePolicyPrincipal, ICompilePolicyResource, ICompilePolicyAction, ICompilePolicy, compilePolicy };
export { compileSpecification, ICompileAssertion, ICompositeAssertions, IAssertionFunction, IAssertions as IAssertionsObject, ISpecification, ISpecificationMatchFunc };
export { IAccessRequest };
export { IAccessResponse, ACCESS_DECISION };

export const ACTION_COMPILERS = {
  compileCommandQueryAction: compileCommandQueryAction,
  compileHttpAction: compileHttpAction
};

export const PRINCIPAL_COMPILERS = {
  compileUserIdPrincipal: compileUserIdPrincipal
};

export const RESOURCE_COMPILERS = {
  compileUrlPatternResource: compileUrlPatternResource
};

/**
 * Create a default policy decision point using HTTP method actions, url patterns for resource
 * and subject user-id for matching the access request to the policy.
 *
 * @param basePath {string} The base path to the folder containing the policy files
 */
export const createDefaultPolicyDecisionPoint = async (basePath:string) => {
  // load policies from JSON policy files located in the base path folder...
  const loadedFilePolicies = await loadJsonPolicyFiles(basePath);
  // compile specications function passed to the policy compilation function using built-in composite assertions and assertions...
  const compileSpecFunc = compileSpecification(compileCompositeAssertion)(compileAssertion)(COMPOSITES)(ASSERTIONS);
  // policies will be matched based on command-query action name, url pattern resource path  and a user-id property in subject...
  const compilePolicyFunc = compilePolicy(ACTION_COMPILERS.compileHttpAction)(RESOURCE_COMPILERS.compileUrlPatternResource)(PRINCIPAL_COMPILERS.compileUserIdPrincipal)(compileSpecFunc);
  const compiledPolicies = loadedFilePolicies.map(compilePolicyFunc);
  return policyDecisionPoint(compiledPolicies)(findPoliciesMatchingAccessRequest)(policySetIsSatisfiedBy);
};
