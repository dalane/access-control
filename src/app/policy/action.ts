import { IAccessRequest } from "../access-request";
import { assertIsString, assert } from "../helpers";
import { IIsSatisfiedByFunction, makeIsSatisfiedByResult } from ".";

export interface ICompileAction {
  (value:any):IIsSatisfiedByFunction;
}

export const compileHttpAction:ICompileAction = (value:string) => {
  const supportedActions = ['GET', 'POST', 'PATCH', 'DELETE', "PUT", "OPTIONS"];
  if (undefined === value) {
    return (accessRequest:IAccessRequest) => makeIsSatisfiedByResult(false);
  }
  assertIsString(value, 'The value for the policy action must be a string HTTP verb');
  if (value === '*') {
    return (accessRequest:IAccessRequest) => makeIsSatisfiedByResult(true);
  } else {
    const policyAction = value.toUpperCase();
    assert(supportedActions.includes(policyAction), 'The value for action should be "GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS", or "*"');
    return (accessRequest:IAccessRequest) => {
      const requestedAction = accessRequest?.action?.method;
      if (requestedAction === undefined) {
        return makeIsSatisfiedByResult(false);
      }
      return (policyAction === requestedAction.toUpperCase()) ? makeIsSatisfiedByResult(true) : makeIsSatisfiedByResult(false);
    };
  }
};

/**
 * Takes a policy action value and creates a function that is used to match the
 * policy to an access request using the formats "query:<query-name>", "query:*"
 * "command:<command-name>", "command:*", or "*"
 * @param value The policy action
 */
export const compileCommandQueryAction:ICompileAction = (value:string) => {
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
  return (accessRequest:IAccessRequest) => {
    const requestedAction = accessRequest?.action?.name;
    const parts = requestedAction.split(':');
    if (parts.length !== 2) {
      return makeIsSatisfiedByResult(false);
    }
    const [ requestedType, requestedName ] = parts;
    if (isTypeMatch(requestedType.toLowerCase()) && isNameMatch(requestedName)) {
      return makeIsSatisfiedByResult(true, {
        type: requestedType,
        name: requestedName
      });
    } else {
      return makeIsSatisfiedByResult(false);
    }
  };
};