import { IAccessRequest } from "../access-request";
import { assert } from "../helpers";
import { IIsSatisfiedByFunction, makeIsSatisfiedByResult } from "./index";

export type CompilePrincipalFunc = (value:any) => IIsSatisfiedByFunction;

export const compileUserIdPrincipal:CompilePrincipalFunc = (value:string):IIsSatisfiedByFunction => {
  if (undefined === value) {
    return (accessRequest:IAccessRequest) => makeIsSatisfiedByResult(false);
  }
  assert('string' === typeof value, 'The value of the policy principal must be a string');
  if (value === '*') {
    return (accessRequest:IAccessRequest) => makeIsSatisfiedByResult(true);
  } else {
    return (accessRequest:IAccessRequest) => {
      const requestedUserId = accessRequest?.subject?.['user-id'];
      if (requestedUserId === undefined) {
        return makeIsSatisfiedByResult(false);
      }
      return (value === requestedUserId) ? makeIsSatisfiedByResult(true) : makeIsSatisfiedByResult(false);
    };
  }
};