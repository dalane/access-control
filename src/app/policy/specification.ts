import { assert, assertIsObject, throwAssertionError } from '../helpers';
import { IAccessRequest } from '../access-request';
import { CompileArrayAssertionsFn } from './assertion';

export interface ISpecification {
  [key: string]: ISpecificationProperties | ISpecification[];
}

export type CompileSpecificationsFn = (specification: ISpecification | ISpecification[]) => SpecificationMatchFn;

export interface ISpecificationProperties {
  attribute: string;
  expected?: any;
}

export type SpecificationMatchFn = (accessRequest: IAccessRequest) => boolean;

const alwaysReturnTrueCompiledSpecification: SpecificationMatchFn = (accessRequest: IAccessRequest) => true;


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


export function makeCompileSpecification (compileArrayAssertionFn: CompileArrayAssertionsFn, compileAssertionFn: CompileSpecificationsFn): CompileSpecificationsFn {
  function compileSpecification(specification: ISpecification): SpecificationMatchFn {
    // if no specification is provided then we will return the default array
    // rule...
    if (specification === undefined || specification === null) {
      return alwaysReturnTrueCompiledSpecification;
    }
    assertIsObject(specification, 'Specification must be an object');
    const assertionName = getAssertionName(specification);
    if (undefined === assertionName) {
      return alwaysReturnTrueCompiledSpecification;
    }
    // pass the specification to compile a array assertion and if it doesn't
    // find a matching function it will return undefined. Compilation of arrays
    // is recursive so we need to pass this containing function so that nested
    // array and single assertions can be parsed
    const compiledArrayAssertion = compileArrayAssertionFn(compileSpecification)(specification);
    if (undefined !== compiledArrayAssertion) {
      return compiledArrayAssertion;
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
