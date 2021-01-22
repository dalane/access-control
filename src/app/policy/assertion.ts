import { getDeepValue, isEqualObject, assertIsArray, assertIsDefined } from '../helpers';
import { IAccessRequest } from '../access-request';
import { CompileSpecificationsFn, ISpecification, SpecificationMatchFn, ISpecificationProperties, getAssertionName } from './specification';

export type ArrayAssertionFn = (specificationMatchFns: SpecificationMatchFn[]) => SpecificationMatchFn;

export interface IArrayAssertions {
  [key:string]: ArrayAssertionFn;
}

/*
 * anyOf and allOf are array assertiong rules taking an array of compiled rules.
 */

/**
 * Creates an array rule that returns an isSatisfiedBy result if all specifications
 * in the array pass.
 * @param specificationMatchFns ICompiledAssertions[]
 */
export const allOf: ArrayAssertionFn = (specificationMatchFns: SpecificationMatchFn[]):SpecificationMatchFn => {
  assertIsArray(specificationMatchFns, '#allOf requires an array of compiled specifications');
  return (accessRequest: IAccessRequest) => {
    // if there are no rules then we return true by default...
    if (specificationMatchFns.length === 0) {
      return true;
    }
    // iterate until we find a fail condition and then stop. no need to continue
    // checking all assertions if at least one fails as all need to pass...
    for (const isSatisfiedBy of specificationMatchFns) {
      if (isSatisfiedBy(accessRequest) === false) {
        return false;
      }
    }
    return true;
  };
};

/**
 * Creates a specification that returns an isSatisfiedBy result if at lease
 * one specification in the array passes.
 * @param specificationMatchFns ISpecification[]
 */
export const anyOf: ArrayAssertionFn = (specificationMatchFns: SpecificationMatchFn[]):SpecificationMatchFn => {
  assertIsArray(specificationMatchFns, '#anyOf requires an array of compiled specifications');
  return (accessRequest: IAccessRequest) => {
    // if there are no rules then we return true by default...
    if (specificationMatchFns.length === 0) {
      return true;
    }
    // iterate until we find a pass condition and then stop. no need to continue
    // checking all assertions if at least one passes as only one needs to pass...
    for (const isSatisfiedBy of specificationMatchFns) {
      if (isSatisfiedBy(accessRequest) === true) {
        return true;
      }
    }
    return false;
  };
};

export const DEFAULT_ARRAY_ASSERTIONS: IArrayAssertions = {
  anyOf,
  allOf
};

export type CompileArrayAssertionsFn = (compileSpecification: CompileSpecificationsFn) => CompileSpecificationsFn;

export const makeCompileArrayAssertions = (arrayAssertions: IArrayAssertions): CompileArrayAssertionsFn => (compileSpecification: CompileSpecificationsFn): CompileSpecificationsFn => (specification: ISpecification) => {
  const assertionName = getAssertionName(specification);
  assertIsDefined(assertionName, 'An assertion name is required for a array assertion');
  const assertionFn = arrayAssertions[assertionName];
  if (assertionFn === undefined) {
    // we're going to return undefined if there is no array function as we
    // will leave it to the specification compiler to decide what to do...
    return undefined;
  }
  // specify the type as ISpecification[] as the property type as the interface also
  // indicates this could be just ISpecification...
  const specifications = specification[assertionName] as ISpecification[];
  assertIsArray(specifications, 'Array assertions must be an array');
  const compiledAssertions = specifications.reduce((compiledAssertions, specification) => {
    // recursively call the compile function as this will compile any assertions
    // and any deeper nested array functions in the specification...
    compiledAssertions.push(compileSpecification(specification));
    return compiledAssertions;
  }, []);
  // take all of the compiled assertions and create a composition assertion function
  // that will return true/false depending on the rules contained within that function
  // eg. anyOf will return true if only one of the assertions returns true...
  return assertionFn(compiledAssertions);
};


// ****************************************************************************
//   ASSERTIONS
// ****************************************************************************

export type AssertionFunction = (actual:any, expected?:any) => boolean;

const countNumberOfFunctionArguments = (fn: Function):number => {
  const MATCH_PARENTHESIS = /\(([^)]+)\)/;
  const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  const fnText = fn.toString().replace(STRIP_COMMENTS, '');
  let argsString;
  if (fnText.includes('=>')) {
    argsString = fnText.split('=>')[0].trim();
    argsString = (MATCH_PARENTHESIS.test(argsString)) ? MATCH_PARENTHESIS.exec(argsString)[1] : argsString;
  } else {
    argsString = (MATCH_PARENTHESIS.test(fnText)) ? MATCH_PARENTHESIS.exec(fnText)[1] : '';
  }
  argsString = argsString.trim();
  if (argsString === '' || argsString === '()') {
    // return [];
    return 0;
  }
  // return argsString.split(',').map(param => param.trim());
  return argsString.split(',').length;
};

export const makeCompileAssertions = (assertions: IAssertions):CompileSpecificationsFn => (specification:ISpecification):SpecificationMatchFn => {
  const assertionName = getAssertionName(specification);
  assertIsDefined(assertionName, 'An assertion name is required in a specification');
  const assertionFn = assertions[assertionName];
  if (undefined === assertionFn) {
    // we're going to return undefined if there is no array function as we
    // will leave it to the specification compiler to decide what to do...
    return undefined;
  }
  const specificationProperties = specification[assertionName] as ISpecificationProperties;
  assertIsDefined(specificationProperties.attribute, 'The specification is missing an "attribute" property');
  const attributeNameParts = specificationProperties.attribute.split('.');
  const assertionRequiresExpectedValue = countNumberOfFunctionArguments(assertionFn) > 1;
  if (true === assertionRequiresExpectedValue) {
    assertIsDefined(specificationProperties.expected, `The assertion "${assertionName}" requires an expected property`);
    // this regular expression will match a template literal string "${...}"
    const templateLiteralRegExp = /\$\{([^}]+)\}/;
    // if the expected property is a string, we will test it to see if it's a
    // template literal...
    const expectedIsAVariable = ('string' === typeof specificationProperties.expected && templateLiteralRegExp.test(specificationProperties.expected));
    if (true === expectedIsAVariable) {
      const result = templateLiteralRegExp.exec(specificationProperties.expected);
      const expectedAttributeNameParts = result[1].split('.');
      return (accessRequest: IAccessRequest):boolean => assertionFn(getDeepValue(accessRequest, attributeNameParts), getDeepValue(accessRequest, expectedAttributeNameParts));
    } else {
      return (accessRequest: IAccessRequest):boolean => assertionFn(getDeepValue(accessRequest, attributeNameParts), specificationProperties.expected);
    }
  }
  return (accessRequest: IAccessRequest):boolean =>  assertionFn(getDeepValue(accessRequest, attributeNameParts));
};

export const isEqual: AssertionFunction = (actual:any, expected:any) => {
  if (typeof actual !== typeof expected) {
    return false;
  }
  return (actual === expected);
};
export const isNotEqual: AssertionFunction = (actual:any, expected:any) => not(isEqual)(actual, expected);
export const isGreaterThanOrEqual: AssertionFunction = (actual:any, expected:any) => {
  if (typeof actual !== 'number' || typeof expected !== 'number') {
    return false;
  }
  return (actual >= expected);
};
export const isGreaterThan: AssertionFunction = (actual:any, expected:any) => {
  if (typeof actual !== 'number' || typeof expected !== 'number') {
    return false;
  }
  return (actual > expected);
};
export const isLessThanOrEqual: AssertionFunction = (actual:any, expected:any) => (actual <= expected);
export const isLessThan: AssertionFunction = (actual:any, expected:any) => (actual < expected);
export const isIncluded: AssertionFunction = (actual:any, expected:any|any[]) => (Array.isArray(expected)) ? expected.includes(actual) : false;
export const isNotIncluded: AssertionFunction = (actual:any, expected:any[]) => not(isIncluded)(actual, expected);
export const isNull: AssertionFunction = (actual:any) => (actual === null);
export const isNotNull: AssertionFunction = (actual:any) => not(isNull)(actual);
export const isTrue: AssertionFunction = (actual:any) => (actual === true);
export const isNotTrue: AssertionFunction = (actual:any) => not(isTrue)(actual);
export const isPresent: AssertionFunction = (actual:any) => (actual !== undefined && actual !== null);
export const isNotPresent: AssertionFunction = (actual:any) => not(isPresent)(actual);
export const isMatch: AssertionFunction = (actual:any, expected:any) => (new RegExp(expected)).test(actual);
export const isNotMatch: AssertionFunction = (actual:any, expected:any) => not(isMatch)(actual, expected);
export const isEquivalent: AssertionFunction = (actual:object, expected:object) => (typeof actual === typeof expected && typeof actual === "object") ? isEqualObject(actual, expected) : false;
export const isNotEquivalent: AssertionFunction = (actual:object, expected:object) => not(isEquivalent)(actual, expected);

const not = (func:(...args:any[]) => boolean) => (...args:any[]) => !func(...args);

export interface IAssertions {
  [key: string]: AssertionFunction;
}

export const DEFAULT_ASSERTIONS: IAssertions = {
  isEqual,
  isNotEqual,
  isGreaterThanOrEqual,
  isGreaterThan,
  isLessThanOrEqual,
  isLessThan,
  isIncluded,
  isNotIncluded,
  isNull,
  isNotNull,
  isTrue,
  isNotTrue,
  isPresent,
  isNotPresent,
  isMatch,
  isNotMatch,
  isEquivalent,
  isNotEquivalent
};
