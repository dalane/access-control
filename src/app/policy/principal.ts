import { IAccessRequest } from "../access-request";
import { assertIsDefined, assertIsString, isSatisfiedByTrueFn, } from "../helpers";
import { IIsPolicyMatchFn, makeIsSatisfiedByResult } from "./index";
import { PolicySchemeMatchDefinition } from "./parser";

/*
  BUILT-IN PRINCIPAL PARSERS
*/

export enum BuiltInPrincipalParserSchemes {
  USERID = 'userid',
}

export function matchUserIdPrincipalFn(value: string): IIsPolicyMatchFn {
  assertIsDefined(value, 'A value for the principal policy is required.');
  assertIsString(value, 'The value for the principal must be a string');
  if (value === '*') {
    return isSatisfiedByTrueFn;
  } else {
    return (accessRequest:IAccessRequest) => {
      const accessReqUserId = accessRequest?.subject?.userid;
      if (accessReqUserId === undefined) {
        return makeIsSatisfiedByResult(false);
      }
      return (value === accessReqUserId) ? makeIsSatisfiedByResult(true) : makeIsSatisfiedByResult(false);
    };
  }
}

export const defaultPrincipalPolicyMatchers: PolicySchemeMatchDefinition[] = [
  {
    scheme: BuiltInPrincipalParserSchemes.USERID,
    matchFn: matchUserIdPrincipalFn,
  }
];
