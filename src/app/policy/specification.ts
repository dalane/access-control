import { assert, assertIsObject, throwAssertionError } from '../helpers';
import { IAccessRequest } from '../access-request';
import { CompileCompositeAssertionsFn } from './assertion';

export interface ISpecification {
  [key: string]: ISpecificationProperties | ISpecification[];
}

export interface ICompileSpecificationsFn {
  (specification: ISpecification | ISpecification[]): ISpecificationMatchFn;
}

export interface ISpecificationProperties {
  attribute: string;
  expected?: any;
}

export interface ISpecificationMatchFn {
  (accessRequest: IAccessRequest): boolean;
}

const alwaysReturnTrueCompiledSpecification: ISpecificationMatchFn = (accessRequest: IAccessRequest) => true;


export function getAssertionName(specification: ISpecification):string {
  const assertionNames:string[] = Object.getOwnPropertyNames(specification);
  if (assertionNames.length === 0) {
    return undefined;
  }
  assert(assertionNames.length === 1, 'Only one assertion per specification is allowed');
  // the name of the assertion from the specification will be the first value
  // as there is only one value...
  return assertionNames[0];
}


export function makeCompileSpecification (compileCompositeAssertionFn: CompileCompositeAssertionsFn, compileAssertionFn: ICompileSpecificationsFn): ICompileSpecificationsFn {
  function compileSpecification(specification: ISpecification): ISpecificationMatchFn {
    // if no specification is provided then we will return the default composite
    // rule...
    if (specification === undefined || specification === null) {
      return alwaysReturnTrueCompiledSpecification;
    }
    assertIsObject(specification, 'Specification must be an object');
    const assertionName = getAssertionName(specification);
    if (undefined === assertionName) {
      return alwaysReturnTrueCompiledSpecification;
    }
    // pass the specification to compile a composite assertion and if it doesn't
    // find a matching function it will return undefined. Compilation of composites
    // is recursive so we need to pass this containing function so that nested
    // composite and single assertions can be parsed
    const compiledCompositeAssertion = compileCompositeAssertionFn(compileSpecification)(specification);
    if (undefined !== compiledCompositeAssertion) {
      return compiledCompositeAssertion;
    }
    // pass the specification to compile an assertion and if it doesn't find a
    // matching function it will return undefined...
    const compiledAssertion = compileAssertionFn(specification);
    if (undefined !== compiledAssertion) {
      return compiledAssertion;
    }
    throwAssertionError(`The assertion "${assertionName}" does not exist`);
  }
  return (specification: ISpecification) => compileSpecification(specification);
}
