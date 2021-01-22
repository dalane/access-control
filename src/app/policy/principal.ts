import { IAccessRequest } from "../access-request";
import { assertIsDefined, assertIsString, isSatisfiedByTrueFn, } from "../helpers";
import { IsPolicyMatchFn, isSatisfiedByResult } from "./index";
import { IPolicyFilterDefinitions } from "./parser";

/*
  BUILT-IN PRINCIPAL PARSERS
*/

export enum BuiltInPrincipalParserSchemes {
  USERID = 'userid',
}

export function matchUserIdPrincipalFn(value: string): IsPolicyMatchFn {
  assertIsDefined(value, 'A value for the principal policy is required.');
  assertIsString(value, 'The value for the principal must be a string');
  if (value === '*') {
    return isSatisfiedByTrueFn;
  } else {
    return (accessRequest: IAccessRequest) => {
      const accessReqUserId = accessRequest?.subject?.userid;
      if (accessReqUserId === undefined) {
        return isSatisfiedByResult(false);
      }
      return (value === accessReqUserId) ? isSatisfiedByResult(true) : isSatisfiedByResult(false);
    };
  }
}

export const defaultPrincipalPolicyMatchers: IPolicyFilterDefinitions = {
  [BuiltInPrincipalParserSchemes.USERID]: matchUserIdPrincipalFn,
};
