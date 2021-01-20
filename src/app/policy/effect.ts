import { IPolicy } from ".";
import { assert } from "../helpers";

export enum POLICY_EFFECT {
	ALLOW = 'allow',
	DENY = 'deny'
}

export const getPolicyEffect = (policy: IPolicy) => {
	assert(policy.effect !== undefined, 'The policy effect is required');
	assert(typeof policy.effect === 'string', 'The policy effect must be a string value');
	assert((policy.effect.toLowerCase() === POLICY_EFFECT.ALLOW || policy.effect.toLowerCase() === POLICY_EFFECT.DENY), 'The policy effect can only be "allow" or "deny"');
	return policy.effect;
};
