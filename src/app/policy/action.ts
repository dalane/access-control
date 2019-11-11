import { IAccessRequest } from "../access-request";
import { assertIsString, assert } from "../helpers";

export interface ICompileAction {
  (value:any):IActionMatchFunc;
}

export interface IActionMatchResult {
  result:boolean;
  params?:{
    [key:string]:any
  };
}

export interface IActionMatchFunc {
  (accessRequest:IAccessRequest):IActionMatchResult;
}

const makeMatchResult = (result:boolean, params:object = {}):IActionMatchResult => ({
  result: result,
  params: params
});

export const compileHttpAction:ICompileAction = (value:string):IActionMatchFunc => {
  const supportedActions = ['GET', 'POST', 'PATCH', 'DELETE', "PUT", "OPTIONS"];
  assertIsString(value, 'The value for the policy action must be a string HTTP verb');
  if (value === '*') {
    return (accessRequest:IAccessRequest) => makeMatchResult(true);
  } else {
    const policyAction = value.toUpperCase();
    assert(supportedActions.includes(policyAction), 'The value for action should be "GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS", or "*"');
    return (accessRequest:IAccessRequest):IActionMatchResult => {
      const requestedAction = accessRequest?.action?.method;
      if (requestedAction === undefined) {
        return makeMatchResult(false);
      }
      return (policyAction === requestedAction.toUpperCase()) ? makeMatchResult(true) : makeMatchResult(false);
    };
  }
};

/**
 * Takes a policy action value and creates a function that is used to match the
 * policy to an access request using the formats "query:<query-name>", "query:*"
 * "command:<command-name>", "command:*", or "*"
 * @param value The policy action
 */
export const compileCommandQueryAction:ICompileAction = (value:string):IActionMatchFunc => {
  let isTypeMatch;
  let isNameMatch;
  if (value === '*') {
    isTypeMatch = () => true;
    isNameMatch = () => true;
  } else {
    const supportedActions = [ 'query', 'command'];
    const parts = value.split(':');
    assert(parts.length === 2, 'The value for the action should be "query:<name-of-query>" or "command:<name-of-command>"');
    const [ policyActionType, policyActionName ] = parts.map(v => v.toLowerCase());
    assert(supportedActions.includes(policyActionType) === true, 'The value for the action should be "query:<name-of-query>" or "command:<name-of-command>"');
    isTypeMatch = (requestedAction:string) => (policyActionType.toLowerCase() === requestedAction.toLowerCase());
    isNameMatch = (requestedAction:string) => (policyActionName === '*') ? true : (policyActionName === requestedAction);
  }
  return (accessRequest:IAccessRequest):IActionMatchResult => {
    const requestedAction = accessRequest?.action?.name;
    const parts = requestedAction.split(':');
    if (parts.length !== 2) {
      return {
        result: false
      };
    }
    const [ requestedType, requestedName ] = parts;
    if (isTypeMatch(requestedType.toLowerCase()) && isNameMatch(requestedName)) {
      return {
        result: true,
        params: {
          type: requestedType,
          name: requestedName
        }
      };
    } else {
      return {
        result: false
      };
    }
  };
};