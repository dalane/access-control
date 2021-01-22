import { IAccessRequest } from "../access-request";
import { assert, assertIsDefined, assertIsString, isSatisfiedByFalseFn, isSatisfiedByTrueFn } from "../helpers";
import { IIsPolicyMatchFn, IIsSatisfiedByResult, isSatisfiedByResult } from "./index";

export type CreateIsSatisfiedParseFn = (value:any) => IIsPolicyMatchFn;

export interface PolicySchemeMatchDefinition {
  scheme: string;
  matchFn: CreateIsSatisfiedParseFn;
}

export function makePolicySchemeValueParser(parserDefinitions: PolicySchemeMatchDefinition[]): CreateIsSatisfiedParseFn {
  return (policyValues: string | string[]): IIsPolicyMatchFn => {
    const values = Array.isArray(policyValues) ? policyValues : [ policyValues ];
    const matchFns: IIsPolicyMatchFn[] = values.map((value: string): IIsPolicyMatchFn => {
      // if the policy does not contain a value for principal then it will return
      // a false isSatisfiedByResult. This means that the policy will never match
      // on principal for any access request
      if (value === undefined) {
        return isSatisfiedByFalseFn;
      }
      const trimmed = value.trim();
      // if the policy contains a value of "*" for principal then it will match on
      // principal for all access requests
      if (trimmed === '*') {
        return isSatisfiedByTrueFn;
      }
      const { scheme, pattern } = parseValue(trimmed);
      // const scheme = trimmed.substring(0, trimmed.indexOf(':'));
      const parser = parserDefinitions.find(schemeCompiler => schemeCompiler.scheme === scheme);
      assertIsDefined(parser, `Unable to match a scheme assertion matcher for scheme "${scheme}"`);
      return parser.matchFn(pattern);
    });
    return (accessRequest: IAccessRequest): IIsSatisfiedByResult  => {
      for (const matched of matchFns) {
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

export function parseValue(value: string): { scheme: string; pattern: string; } {
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
