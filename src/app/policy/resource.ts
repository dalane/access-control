import UrlPattern from 'url-pattern';
import { IAccessRequest } from '../access-request';
import { assert, assertIsString, assertIsDefined, isSatisfiedByTrueFn } from '../helpers';
import { IIsPolicyMatchFn, isSatisfiedByResult } from '.';
import { PolicySchemeMatchDefinition } from './parser';

/*
  BUILT-IN RESOURCE PARSERS
*/

export enum BuiltInResourceParserSchemes {
  PATH = 'path',
}

export function matchUrlPatternResourceFn(value: string): IIsPolicyMatchFn {
  assertIsDefined(value, 'A value for the resource selector is required.');
  assertIsString(value, 'The value for the resource must be a string');
  assert(value.length !== 0, 'The value for the resource is an empty string')
  if (value === '*') {
    return isSatisfiedByTrueFn;
  } else {
    const matchFn = createUrlPatternMatcher(value);
    return (accessRequest:IAccessRequest) => {
      const resourcePath = accessRequest?.resource?.path;
      if (resourcePath === undefined) {
        return isSatisfiedByResult(false);
      }
      const pathMatch = matchFn(resourcePath);
      return (null !== pathMatch) ? isSatisfiedByResult(true, { ...pathMatch }) : isSatisfiedByResult(false);
    };
  }
}

/**
 * A functional wrapper for UrlPattern library
 * @param urlPatternStr {string} The url pattern to match
 * @returns {function} A function that given a url matches it to urlPatternStr
 */
function createUrlPatternMatcher(urlPatternStr: string): (url:string) => any {
  const pattern = new UrlPattern(urlPatternStr);
  return (url: string) => pattern.match(url);
}

export const defaultResourcePolicyMatchers: PolicySchemeMatchDefinition[] = [
  {
    scheme: BuiltInResourceParserSchemes.PATH,
    matchFn: matchUrlPatternResourceFn
  }
];
