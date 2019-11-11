import UrlPattern from 'url-pattern';
import { IAccessRequest } from '../access-request';
import { merge, assert, assertIsString, assertIsDefined } from '../helpers';

export interface ICompilePolicyResourceFunc {
  (value:any):IResourceMatchFunc;
}

export interface IResourceMatchResult {
  result:boolean;
  params?: {
    [key:string]:any
  };
}

export interface IResourceMatchFunc {
  (accessRequest:IAccessRequest):IResourceMatchResult;
}

const makeMatchResult = (result:boolean, params?:any):IResourceMatchResult => ({
  result: result,
  params: (params !== undefined) ? merge({}, params) : {}
});

export const compileUrlPatternResource:ICompilePolicyResourceFunc = (value:any):IResourceMatchFunc => {
  const matchPathFunction = (pattern:UrlPattern) => (path:string) => pattern.match(path);
  // "<path-to-resource>" or "*"
  // assert(value !== undefined && value !== null, 'The value for the resource is missing');
  assertIsDefined(value, 'The value for the resource is missing');
  assertIsString(value, 'The value for the resource must be a string');
  assert(value.length !== 0, 'The value for the resource is an empty string');
  // if the resource identifier is a wildcard * then we will always return true as a match
  // otherwise, we will match to a url pattern...
  if (value === '*') {
    return (accessRequest:IAccessRequest):IResourceMatchResult => makeMatchResult(true);
  } else {
    const match = matchPathFunction(new UrlPattern(value));
    return (accessRequest:IAccessRequest):IResourceMatchResult => {
      const resourcePath = accessRequest?.resource?.path;
      if (resourcePath === undefined) {
        return makeMatchResult(false);
      }
      const pathMatch = match(resourcePath);
      return (null !== pathMatch) ? makeMatchResult(true, merge({}, pathMatch)) : makeMatchResult(false);
    };
  }
};