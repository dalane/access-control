import UrlPattern from 'url-pattern';
import { IAccessRequest } from '../access-request';
import { merge, assert, assertIsString } from '../helpers';
import { IIsSatisfiedByFunction, makeIsSatisfiedByResult } from '.';

export interface ICompileResource {
  (value:any):IIsSatisfiedByFunction;
}

export const compileUrlPatternResource:ICompileResource = (value:any) => {
  const matchPathFunction = (pattern:UrlPattern) => (path:string) => pattern.match(path);
  if (undefined === value) {
    return (accessRequest:IAccessRequest) => makeIsSatisfiedByResult(false);
  }
  assertIsString(value, 'The value for the resource must be a string');
  assert(value.length !== 0, 'The value for the resource is an empty string');
  // if the resource identifier is a wildcard * then we will always return true as a match
  // otherwise, we will match to a url pattern...
  if (value === '*') {
    return (accessRequest:IAccessRequest) => makeIsSatisfiedByResult(true);
  } else {
    const match = matchPathFunction(new UrlPattern(value));
    return (accessRequest:IAccessRequest) => {
      const resourcePath = accessRequest?.resource?.path;
      if (resourcePath === undefined) {
        return makeIsSatisfiedByResult(false);
      }
      const pathMatch = match(resourcePath);
      return (null !== pathMatch) ? makeIsSatisfiedByResult(true, merge({}, pathMatch)) : makeIsSatisfiedByResult(false);
    };
  }
};