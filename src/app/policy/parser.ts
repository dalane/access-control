import { IAccessRequest } from "../access-request";
import { assert, assertIsDefined, assertIsObject, assertIsString, isSatisfiedByFalseFn, isSatisfiedByTrueFn } from "../helpers";
import { IsPolicyMatchFn, IIsSatisfiedByResult, isSatisfiedByResult } from "./index";

export type CreatePolicyFilterFn = (policyValues: string | string[]) => IsPolicyMatchFn;

export interface IPolicyFilterDefinitions {
  [scheme: string]: CreatePolicyFilterFn;
}

/**
 * Using function composition, takes an object with functions for matching policies
 * to access requests based on the access request. Is used by the PAP.
 * @param policyFilterDefinitions
 */
export function createPolicyFilterValueParser(policyFilterDefinitions: IPolicyFilterDefinitions): CreatePolicyFilterFn {
  assertIsObject(policyFilterDefinitions, 'makePolicyFilterValueParser requires the filter definitions to be an object.');
  return (policyValues: string | string[]): IsPolicyMatchFn => {
    const values = Array.isArray(policyValues) ? policyValues : [ policyValues ];
    // create an array of Policy filtering functions by mapping through each value from
    // the policy and creating the match function that matches the scheme and pattern
    // to the access request
    const isPolicyMatchFns: IsPolicyMatchFn[] = values.map(createMapPolicyValues(policyFilterDefinitions));
    return (accessRequest: IAccessRequest): IIsSatisfiedByResult  => {
      for (const matched of isPolicyMatchFns) {
        const result = matched(accessRequest);
        // if the resource returns true then return the result or else continue
        if (result.result === true) {
          return result;
        }
      }
      // not resource value was matched
      return isSatisfiedByResult(false);
    };
  };
}

/**
 * Composes a function that returns a policy matching function that
 * will match a scheme and pattern in a policy to the value from the policy
 * @param policyFilterDefinitions
 */
function createMapPolicyValues(policyFilterDefinitions: IPolicyFilterDefinitions) {
  return (policyValue: string): IsPolicyMatchFn => {
    // if the policy does not contain a value for principal then it will return
    // a false isSatisfiedByResult. This means that the policy will never match
    // on principal for any access request
    if (policyValue === undefined) {
      return isSatisfiedByFalseFn;
    }
    const trimmed = policyValue.trim();
    // if the policy contains a value of "*" for principal then it will match on
    // principal for all access requests
    if (trimmed === '*') {
      return isSatisfiedByTrueFn;
    }
    const { scheme, pattern } = parsePolicyFilterValue(trimmed);
    // const scheme = trimmed.substring(0, trimmed.indexOf(':'));
    const createPolicyFilterFn = policyFilterDefinitions[scheme];
    assertIsDefined(createPolicyFilterFn, `Unable to match a scheme assertion matcher for scheme "${scheme}"`);
    return createPolicyFilterFn(pattern);
  };
}

/**
 * Takes a value in a policy using the format <scheme>:<pattern> and returns
 * an object with each value
 * @param value
 */
export function parsePolicyFilterValue(value: string): { scheme: string; pattern: string; } {
  assertIsDefined(value, 'A value for the action selector is required.');
  assertIsString(value, 'The value for the action must be a string');
  const trimmed = value.trim();
  assert(trimmed.length !== 0, 'The value for the resource is an empty string');
  const scheme = trimmed.substring(0, trimmed.indexOf(':'));
  assert(scheme.length !== 0, 'There was no specified scheme.');
  const pattern = trimmed.substring(trimmed.indexOf(':') + 1);
  assert(pattern.length !== 0, `There was no value after the scheme.`);
  return { scheme, pattern };
}
