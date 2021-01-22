import { ICompiledPolicy } from "./policy";
import { IAccessRequest, IPolicy } from ".";
import { assertIsArray, assertIsBoolean } from "./helpers";
import { CompileArrayAssertionsFn, DEFAULT_ARRAY_ASSERTIONS, DEFAULT_ASSERTIONS, IArrayAssertions, IAssertions, makeCompileArrayAssertions, makeCompileAssertions } from "./policy/assertion";
import { CreatePolicyFilterFn, createPolicyFilterValueParser, IPolicyFilterDefinitions } from "./policy/parser";
import { CompileSpecificationsFn, makeCompileSpecification } from "./policy/specification";
import { makeCompilePolicy } from './policy';

export interface PolicyDefinitions {
	actions: IPolicyFilterDefinitions;
	principals: IPolicyFilterDefinitions;
	resources: IPolicyFilterDefinitions;
	specification?: {
		arrays?: IArrayAssertions;
		assertions?: IAssertions;
	};
}

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

export type PolicySet = IMatchedPolicyResult[];

export type PolicyAdministrationPointFn = (accessRequest: IAccessRequest) => PolicySet;

export function createPolicyAdministrationPointFn(policies: IPolicy[], definitions: PolicyDefinitions): PolicyAdministrationPointFn {

	assertIsArray(policies, 'Policies must be an array.');

	// combine assertions from definitions with built-in definitions. These
	// can be overwritten through the externally provided definitions
	const arrayAssertions: IArrayAssertions = { ...DEFAULT_ARRAY_ASSERTIONS, ...!!definitions?.specification?.arrays && { ...definitions.specification.arrays } };
	const assertions: IAssertions = { ...DEFAULT_ASSERTIONS, ...!!definitions?.specification?.assertions && { ...definitions.specification.assertions } };

	const compilePrincipalFn: CreatePolicyFilterFn = createPolicyFilterValueParser(definitions.principals);
	const compileActionFn: CreatePolicyFilterFn = createPolicyFilterValueParser(definitions.actions);
	const compileResourceFn: CreatePolicyFilterFn = createPolicyFilterValueParser(definitions.resources);
	const compileArrayAssertionsFn: CompileArrayAssertionsFn = makeCompileArrayAssertions(arrayAssertions);
	const compileAssertionsFn: CompileSpecificationsFn = makeCompileAssertions(assertions);
	const compileSpecificationFn: CompileSpecificationsFn = makeCompileSpecification(compileArrayAssertionsFn, compileAssertionsFn);

	const compilePolicyFn = makeCompilePolicy(compileActionFn, compileResourceFn, compilePrincipalFn, compileSpecificationFn);
	const compiledPolicies: ICompiledPolicy[] = policies.map(compilePolicyFn);

	return createPolicyFilterFn(compiledPolicies);

}

export function createPolicyFilterFn(compiledPolicies: ICompiledPolicy[]): PolicyAdministrationPointFn {
	return (accessRequest: IAccessRequest): IMatchedPolicyResult[] => {
		const reducer: PolicySetReducerFn = createPolicySetReducerFn(accessRequest);
    return compiledPolicies.reduce(reducer, []);
  };
}

type PolicySetReducerFn = (policySet: IMatchedPolicyResult[], compiledPolicy:ICompiledPolicy) => IMatchedPolicyResult[];

function createPolicySetReducerFn(accessRequest: IAccessRequest): PolicySetReducerFn {
	return (policySet: IMatchedPolicyResult[], compiledPolicy: ICompiledPolicy): IMatchedPolicyResult[] => {
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
	};
}
