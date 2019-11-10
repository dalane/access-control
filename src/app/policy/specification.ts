import { getDeepValue, isEqualObject, throwAssertionError, assert, assertIsArray } from '@app/helpers';
import { IAccessRequest } from '@app/access-request';

export interface ISpecificationProperties {
  attribute:string;
  expected?:any;
  options?:any;
}

export interface IAssertionFunction {
  (actual:any, expected?:any):boolean;
}

export interface IAssertionAttributes {
  attribute:string;
  expected:any;
  options?:any;
}

export interface ISpecificationMatchFunc {
  (data:IAccessRequest):boolean;
}

export interface ICompileAssertion {
  (assert:IAssertionFunction):ICompileAssertionAttributes;
}

export interface ICompileAssertionAttributes {
  (attributes:IAssertionAttributes):ISpecificationMatchFunc;
}

export const compileAssertion:ICompileAssertion = (assert:IAssertionFunction) => (specificationProperties:ISpecificationProperties):ISpecificationMatchFunc => {
  assert(specificationProperties.attribute !== undefined && specificationProperties.attribute !== null, 'The specification is missing an "attribute" property');
  const attributeNameParts = specificationProperties.attribute.split('.');
  let expectedIsAnAttributeOfAccessRequest = false;
  let expectedAttributeNameParts;
  let expectedValue;
  // determine if the expected is a template literal or a value...
  if (specificationProperties.expected !== null) {
    // this regular expression will match a template literal string "${...}"
    const templateLiteralRegExp = /\$\{([^}]+)\}/;
    // if the expected property is a string we will check it to see if it's a
    // template literal. If the result is null then it's just a string...
    const result = (typeof specificationProperties.expected === "string") ? templateLiteralRegExp.exec(specificationProperties.expected) : null;
    if (result !== null) {
      expectedIsAnAttributeOfAccessRequest = true;
      expectedAttributeNameParts = result[1].split('.');
      expectedValue = null;
    } else {
      expectedIsAnAttributeOfAccessRequest = false;
      expectedAttributeNameParts = null;
      expectedValue = specificationProperties.expected;
    }
  }
  return (accessRequest:IAccessRequest):boolean => {
    const attribute = getDeepValue(accessRequest)(attributeNameParts);
    const expected = (expectedIsAnAttributeOfAccessRequest) ? getDeepValue(accessRequest)(expectedAttributeNameParts) : expectedValue;
    return assert(attribute, expected);
  };
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
  anyOf: anyOf,
  allOf: allOf
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
export const isIncluded:IAssertionFunction = (actual:any, expected:any|any[]) => {
  if ('string' === typeof expected) {
    // split into an array on a comma and trim off any whitespace that might
    // exist on each value...
    expected = expected.split(',').map(s => s.trim());
  }
  return expected.includes(actual);
};
export const isNotIncluded:IAssertionFunction = (actual:any, expected:any[]) => not(isIncluded)(actual, expected);
export const isNull:IAssertionFunction = (actual:any) => (actual === null);
export const isNotNull:IAssertionFunction = (actual:any) => not(isNull)(actual);
export const isTrue:IAssertionFunction = (actual:any) => (actual === true);
export const isNotTrue:IAssertionFunction = (actual:any) => not(isTrue)(actual);
export const isPresent:IAssertionFunction = (actual:any) => (actual !== undefined && actual !== null);
export const isNotPresent:IAssertionFunction = (actual:any) => not(isPresent)(actual);
export const isMatch:IAssertionFunction = (actual:any, expected:any) => {
  const regExp = new RegExp(expected);
  return regExp.test(actual);
};
export const isNotMatch:IAssertionFunction = (actual:any, expected:any) => not(isMatch)(actual, expected);
export const isEquivalent:IAssertionFunction = (actual:object, expected:object) => {
  if (typeof actual !== typeof expected && typeof actual !== "object") {
    return false;
  }
  return isEqualObject(actual, expected);
};

export const isNotEquivalent:IAssertionFunction = (actual:object, expected:object) => not(isEquivalent)(actual, expected);

const not = (func:Function) => (...args:any[]) => !func(...args);

export interface IAssertions {
  [key:string]:IAssertionFunction;
}

export const ASSERTIONS:IAssertions = {
  isEqual: isEqual,
  isNotEqual: isNotEqual,
  isGreaterThanOrEqual: isGreaterThanOrEqual,
  isGreaterThan: isGreaterThan,
  isLessThanOrEqual: isLessThanOrEqual,
  isLessThan: isLessThan,
  isIncluded: isIncluded,
  isNotIncluded: isNotIncluded,
  isNull: isNull,
  isNotNull: isNotNull,
  isTrue: isTrue,
  isNotTrue: isNotTrue,
  isPresent: isPresent,
  isNotPresent: isNotPresent,
  isMatch: isMatch,
  isNotMatch: isNotMatch,
  isEquivalent: isEquivalent,
  isNotEquivalent: isNotEquivalent
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
  assert(typeof specification === 'object', 'Specification must be an object');
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
  return compileAssertion(foundAssertionFunc)(specification[assertionName]);
};
