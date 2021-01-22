import { IAccessRequest } from "../access-request";
import { assertIsString, assert, assertIsDefined, isSatisfiedByTrueFn } from "../helpers";
import { IsPolicyMatchFn, isSatisfiedByResult } from ".";
import { IPolicyFilterDefinitions } from "./parser";

export enum BuiltInActionParserSchemas {
  HTTP_METHOD = 'http',
}

const supportedHttpVerbs = [ 'GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS' ];

export const defaultActionPolicyMatchers: IPolicyFilterDefinitions = {
  [BuiltInActionParserSchemas.HTTP_METHOD]: matchHttpActionFn,
}

export function matchHttpActionFn(value: string): IsPolicyMatchFn {
  assertIsDefined(value, 'A value for the action selector is required.');
  assertIsString(value, 'The value for the action must be a string');
  const trimmed = value.trim();
  assert(trimmed.length !== 0, 'The value for the resource is an empty string');
  if (value === '*') {
    return isSatisfiedByTrueFn;
  } else {
    const policyAction = value.toUpperCase();
    assert(supportedHttpVerbs.includes(policyAction), 'The value for action should be "GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS", or "*"');
    return (accessRequest:IAccessRequest) => {
      const requestedAction = accessRequest?.action?.method;
      if (requestedAction === undefined) {
        return isSatisfiedByResult(false);
      }
      return (policyAction === requestedAction.toUpperCase()) ? isSatisfiedByResult(true) : isSatisfiedByResult(false);
    };
  }
}
