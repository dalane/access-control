import { IAccessRequest } from "@app/access-request";
import { assert } from "@app/helpers";

export interface ICompilePrincipal {
  (value:any):IPrincipalMatchFunc;
}

export interface IPrincipalMatchResult {
  result:boolean;
  params?:{
    [key:string]:any
  };
}

export interface IPrincipalMatchFunc {
  (accessRequest:IAccessRequest):IPrincipalMatchResult;
}

const makeMatchResult = (result:boolean, params:object = {}):IPrincipalMatchResult => ({
  result: result,
  params: params
});

export const compileUserIdPrincipal:ICompilePrincipal = (value:string):IPrincipalMatchFunc => {
  assert(undefined !== value, 'The policy principal is missing');
  assert('string' === typeof value, 'The value of the policy principal must be a string');
  if (value === '*') {
    return (accessRequest:IAccessRequest) => makeMatchResult(true);
  } else {
    return (accessRequest:IAccessRequest):IPrincipalMatchResult => {
      const requestedUserId = accessRequest?.subject?.['user-id'];
      if (requestedUserId === undefined) {
        return makeMatchResult(false);
      }
      return (value === requestedUserId) ? makeMatchResult(true) : makeMatchResult(false);
    };
  }
};