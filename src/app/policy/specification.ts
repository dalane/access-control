import { getDeepValue, isEqualObject, assert, assertIsArray, assertIsDefined, assertIsObject } from '../helpers';
import { IAccessRequest } from '../access-request';

export interface ISpecificationProperties {
  attribute:string;
  expected?:any;
}

export interface IAssertionFunction {
  (actual:any, expected?:any):boolean;
}

export interface ISpecificationMatchFunc {
  (data:IAccessRequest):boolean;
}

export interface ICompileAssertion {
  (assertionFn:IAssertionFunction):{
    (assertionName:string): {
      (attributes:ISpecificationProperties):ISpecificationMatchFunc;
    };
  };
}

const countNumberOfFunctionArguments = (fn:Function):number => {
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

export const compileAssertion:ICompileAssertion = (assertionFn:IAssertionFunction) => (assertionName:string) => (specificationProperties:ISpecificationProperties):ISpecificationMatchFunc => {
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
      return (accessRequest:IAccessRequest):boolean => assertionFn(getDeepValue(accessRequest)(attributeNameParts), getDeepValue(accessRequest)(expectedAttributeNameParts));
    } else {
      return (accessRequest:IAccessRequest):boolean => assertionFn(getDeepValue(accessRequest)(attributeNameParts), specificationProperties.expected);
    }
  }
  return (accessRequest:IAccessRequest):boolean =>  assertionFn(getDeepValue(accessRequest)(attributeNameParts));
};

/*
 * anyOf and allOf are composite rules taking an array of compiled rules.
 */

/**
 * Creates a composite rule that returns an isSatisfiedBy result if all specifications
 * in the array pass.
 * @param compiledAssertions ICompiledAssertions[]
 */
export const allOf = (compiledAssertions:ISpecificationMatchFunc[]):ISpecificationMatchFunc => {
  assertIsArray(compiledAssertions, '#allOf requires an array of compiled specifications');
  return (data:IAccessRequest) => {
    // if there are no rules then we return true by default...
    if (compiledAssertions.length === 0) {
      return true;
    }
    // iterate until we find a fail condition and then stop. no need to continue
    // checking all assertions if at least one fails as all need to pass...
    for (const isSatisfiedBy of compiledAssertions) {
      if (isSatisfiedBy(data) === false) {
        return false;
      }
    }
    return true;
  };
};

/**
 * Creates a specification that returns an isSatisfiedBy result if at lease
 * one specification in the array passes.
 * @param compiledAssertion ISpecification[]
 */
export const anyOf:ICompositeAssertion = (compiledAssertion:ISpecificationMatchFunc[]):ISpecificationMatchFunc => {
  assertIsArray(compiledAssertion, '#anyOf requires an array of compiled specifications');
  return (data:IAccessRequest) => {
    // if there are no rules then we return true by default...
    if (compiledAssertion.length === 0) {
      return true;
    }
    // iterate until we find a pass condition and then stop. no need to continue
    // checking all assertions if at least one passes as only one needs to pass...
    for (const isSatisfiedBy of compiledAssertion) {
      if (isSatisfiedBy(data) === true) {
        return true;
      }
    }
    return false;
  };
};

export interface ICompileCompositeAssertion {
  (compileSpecification):{
    (compositeFunc:ICompositeAssertion): {
      (specifications:ICompositeAssertions[]):any
    };
  };
}

const COMPOSITE_ASSERTIONS = {
  allOf: allOf,
  anyOf: anyOf
};

export const compileCompositeAssertion:ICompileCompositeAssertion = (compileSpecification) => (compositeFunc:ICompositeAssertion) => (specifications:ICompositeAssertions[]) => {
  assertIsArray(specifications, 'Composite assertions must be an array');
  const compiledAssertions = specifications.reduce((compiledAssertions, specification) => {
    // recursively call the compile function as there may be further composite
    // functions in the nested specification...
    compiledAssertions.push(compileSpecification(specification));
    return compiledAssertions;
  }, []);
  return compositeFunc(compiledAssertions);
};

export interface ICompositeAssertion {
  (rules:ISpecificationMatchFunc[]):ISpecificationMatchFunc;
}

export interface ICompositeAssertions {
  [key:string]:ICompositeAssertion;
}

export const COMPOSITES:ICompositeAssertions = {
  anyOf,
  allOf
};

export const isEqual:IAssertionFunction = (actual:any, expected:any) => {
  if (typeof actual !== typeof expected) {
    return false;
  }
  return (actual === expected);
};
export const isNotEqual:IAssertionFunction = (actual:any, expected:any) => not(isEqual)(actual, expected);
export const isGreaterThanOrEqual:IAssertionFunction = (actual:any, expected:any) => {
  if (typeof actual !== 'number' || typeof expected !== 'number') {
    return false;
  }
  return (actual >= expected);
};
export const isGreaterThan:IAssertionFunction = (actual:any, expected:any) => {
  if (typeof actual !== 'number' || typeof expected !== 'number') {
    return false;
  }
  return (actual > expected);
};
export const isLessThanOrEqual:IAssertionFunction = (actual:any, expected:any) => (actual <= expected);
export const isLessThan:IAssertionFunction = (actual:any, expected:any) => (actual < expected);
export const isIncluded:IAssertionFunction = (actual:any, expected:any|any[]) => (Array.isArray(expected)) ? expected.includes(actual) : false;
export const isNotIncluded:IAssertionFunction = (actual:any, expected:any[]) => not(isIncluded)(actual, expected);
export const isNull:IAssertionFunction = (actual:any) => (actual === null);
export const isNotNull:IAssertionFunction = (actual:any) => not(isNull)(actual);
export const isTrue:IAssertionFunction = (actual:any) => (actual === true);
export const isNotTrue:IAssertionFunction = (actual:any) => not(isTrue)(actual);
export const isPresent:IAssertionFunction = (actual:any) => (actual !== undefined && actual !== null);
export const isNotPresent:IAssertionFunction = (actual:any) => not(isPresent)(actual);
export const isMatch:IAssertionFunction = (actual:any, expected:any) => (new RegExp(expected)).test(actual);
export const isNotMatch:IAssertionFunction = (actual:any, expected:any) => not(isMatch)(actual, expected);
export const isEquivalent:IAssertionFunction = (actual:object, expected:object) => (typeof actual === typeof expected && typeof actual === "object") ? isEqualObject(actual, expected) : false;
export const isNotEquivalent:IAssertionFunction = (actual:object, expected:object) => not(isEquivalent)(actual, expected);

const not = (func:(...args:any[]) => boolean) => (...args:any[]) => !func(...args);

export interface IAssertions {
  [key:string]:IAssertionFunction;
}

export const ASSERTIONS:IAssertions = {
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

export interface IAssertionProperties {
  attribute:string;
  expected?:any;
}

export interface ISpecification {
  [key:string]:IAssertionProperties|ISpecification[];
}

export interface ICompileSpecifications {
  (compileAssertion:ICompileAssertion):IApplyAssertionCollections;
}

export interface IApplyAssertionCollections {
  (composites:ICompositeAssertions, assertions:IAssertions):ICompileSpecification;
}

export interface ICompileSpecification {
  (specification?:ISpecification|ISpecification[]):ISpecificationMatchFunc;
}

const defaultCompiledSpecification:ISpecificationMatchFunc = (data:IAccessRequest) => true;

export const compileSpecification = (compileCompositeAssertion:ICompileCompositeAssertion) =>
  (compileAssertion:ICompileAssertion) =>
    (composites:ICompositeAssertions) =>
      (assertions:IAssertions) =>
        (specification?:ISpecification|ISpecification[]):ISpecificationMatchFunc => {
  // if no specification is provided then we will return the default composite
  // rule...
  if (specification === undefined || specification === null) {
    return defaultCompiledSpecification;
  }
  assertIsObject(specification, 'Specification must be an object');
  const assertionNames:string[] = Object.getOwnPropertyNames(specification);
  if (assertionNames.length === 0) {
    return defaultCompiledSpecification;
  }
  assert(assertionNames.length === 1, 'Only one assertion per assertion object');
  // the name of the assertion from the specification will be the first value
  // as there is only one value...
  const assertionName = assertionNames[0];
  const foundCompositeFunc = composites[assertionName];
  // if we don't find a composite function then we will continue on to assertions...
  if (foundCompositeFunc) {
    // compileCompositeAssertion is a recursive function as composite assertions
    // could be nested so we have to pass a curried compileSpecification function
    // to compileCompositeAssertions
    return compileCompositeAssertion(compileSpecification(compileCompositeAssertion)(compileAssertion)(composites)(assertions))(foundCompositeFunc)(specification[assertionName]);
  }
  // no composite assertions matched so try matching to assertions
  const foundAssertionFunc = assertions[assertionName];
  assert(foundAssertionFunc !== undefined, 'The assertion function "' + assertionName + '" does not exist');
  return compileAssertion(foundAssertionFunc)(assertionName)(specification[assertionName]);
};
