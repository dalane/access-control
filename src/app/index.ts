export { IAccessRequest } from './access-request';
export { IAccessResponse, ACCESS_DECISION } from './access-response';
export { IPolicy } from './policy';
export { PolicyAdministrationPointFn, createPolicyAdministrationPointFn, PolicyDefinitions } from './policy-administration';
export { PolicyDecisionPointFn, createPolicyDecisionPointFn } from './policy-decision';
export { IAssertions, IArrayAssertions, AssertionFunction, ArrayAssertionFn } from './policy/assertion';
export { PolicySchemeMatchDefinition } from './policy/parser';
export { SpecificationMatchFn } from './policy/specification';
export { loadJsonPolicyFiles } from './load-policies-from-json';

import { defaultActionPolicyMatchers } from './policy/action';
import { defaultPrincipalPolicyMatchers } from './policy/principal';
import { defaultResourcePolicyMatchers } from './policy/resource';

export const POLICY_MATCH_FNS = {
	actions: defaultActionPolicyMatchers,
	resources: defaultResourcePolicyMatchers,
	principals: defaultPrincipalPolicyMatchers
};
