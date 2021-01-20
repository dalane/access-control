import { IAccessRequest } from './access-request';
import { IAccessResponse, ACCESS_DECISION } from './access-response';
import { assertIsArray } from './helpers';
import { ICompiledPolicy, IPolicy, makeCompilePolicy } from './policy';
import { IPolicyDecisionPointFn, makeFindPolicySet, makePolicyDecisionPoint } from './policy-decision';
import { defaultActionPolicyMatchers } from './policy/action';
import { ASSERTIONS, COMPOSITES, IAssertions, CompileCompositeAssertionsFn, ICompositeAssertions, makeCompileAssertions, makeCompileCompositeAssertions } from './policy/assertion';
import { CreateIsSatisfiedParseFn, makePolicySchemeValueParser, PolicySchemeMatchDefinition } from './policy/parser';
import { defaultPrincipalPolicyMatchers } from './policy/principal';
import { defaultResourcePolicyMatchers } from './policy/resource';
import { ICompileSpecificationsFn, makeCompileSpecification } from './policy/specification';

export { loadJsonPolicyFiles } from './load-policies-from-json';
export { PolicySchemeMatchDefinition, ICompositeAssertions, IAssertions, IAccessRequest, IAccessResponse, IPolicy, ACCESS_DECISION }

export const POLICY_MATCH_FNS = {
	actions: defaultActionPolicyMatchers,
	resources: defaultResourcePolicyMatchers,
	principals: defaultPrincipalPolicyMatchers
};

export interface PolicyDefinitions {
	actions: PolicySchemeMatchDefinition[];
	principals: PolicySchemeMatchDefinition[];
	resources: PolicySchemeMatchDefinition[];
	specification?: {
		composites?: ICompositeAssertions;
		assertions?: IAssertions;
	};
}

export function createPolicyDecisionPoint(policies: IPolicy[], definitions: PolicyDefinitions): IPolicyDecisionPointFn {

	console.log(policies, definitions);

	assertIsArray(policies, 'Policies must be an array.');

	// combine assertions from definitions with built-in definitions. These
	// can be overwritten through the externally provided definitions
	const compositeAssertions: ICompositeAssertions = { ...COMPOSITES, ...!!definitions?.specification?.composites && { ...definitions.specification.composites } };
	const assertions: IAssertions = { ...ASSERTIONS, ...!!definitions?.specification?.assertions && { ...definitions.specification.assertions } };

	const compilePrincipalFn: CreateIsSatisfiedParseFn = makePolicySchemeValueParser(definitions.principals);
	const compileActionFn: CreateIsSatisfiedParseFn = makePolicySchemeValueParser(definitions.actions);
	const compileResourceFn: CreateIsSatisfiedParseFn = makePolicySchemeValueParser(definitions.resources);
	const compileCompositeAssertionsFn: CompileCompositeAssertionsFn = makeCompileCompositeAssertions(compositeAssertions);
	const compileAssertionsFn: ICompileSpecificationsFn = makeCompileAssertions(assertions);
	const compileSpecificationFn: ICompileSpecificationsFn = makeCompileSpecification(compileCompositeAssertionsFn, compileAssertionsFn);

	const compilePolicyFn = makeCompilePolicy(compileActionFn, compileResourceFn, compilePrincipalFn, compileSpecificationFn);
	const compiledPolicies: ICompiledPolicy[] = policies.map(compilePolicyFn);

	const findPolicySetFn = makeFindPolicySet(compiledPolicies);

	const pdp = makePolicyDecisionPoint(findPolicySetFn);

	return (accessRequest: IAccessRequest): IAccessResponse => pdp(accessRequest);

}


