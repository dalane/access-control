import { assert } from 'chai';
import { IAccessRequest } from '../app/access-request';
import { allOf, anyOf, DEFAULT_ASSERTIONS, DEFAULT_ARRAY_ASSERTIONS, CompileArrayAssertionsFn, makeCompileAssertions, makeCompileArrayAssertions } from '../app/policy/assertion';
import { CompileSpecificationsFn, ISpecification, makeCompileSpecification } from '../app/policy/specification';
import { EmptyAccessRequest } from "./fixtures/test-data";

describe("Compiling a specification", () => {
  describe('assertion functions', () => {
    describe('#isEqual assertion', () => {
      const attribute = {
        boolean: false,
        string: "hello",
        number: 10,
        object: {
          x: "is x"
        }
      };
      const notExpected = {
        boolean: true,
        string: "world",
        number: 5,
        object: {
          x: "is y"
        }
      };
      it("returns true when actual and expected are equal and both are boolean", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isEqual(attribute.boolean, attribute.boolean), "expected boolean false to equal false");
      });
      it("returns true when actual and expected are equal and are both strings", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isEqual(attribute.string, attribute.string), "expected string 'hello' to equal 'hello'");
      });
      it("returns true when actual and expected are equal and are both numbers", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isEqual(attribute.number, attribute.number), "expected number 10 to equal 10");
      });
      it("returns true when actual and expected are both objects and refer to the same object", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isEqual(attribute.object, attribute.object), "expected object to equal object with same reference");
      });
      it("returns false when actual and expected are not equal and both are boolean", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isEqual(attribute.boolean, notExpected.boolean), "expected false not to equal true");
      });
      it("returns false when actual and expected are not equal and both are strings", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isEqual(attribute.string, notExpected.string), "expected 'hello' not to equal 'world'");
      });
      it("returns false when actual and expected are not equal and both are numbers", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isEqual(attribute.number, notExpected.number), "expected number 10 not to equal 5");
      });
      it("returns false when actual and expected are both objects and do not have the same reference", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isEqual(attribute.object, notExpected.object), "expected object not to equal object with differnt reference");
      });
      it("returns false when actual and expected are equal but one is a boolean and the other is a string of the same value", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isEqual(attribute.boolean, String(attribute.boolean)), "expected false not to equal string 'false'");
      });
      it("returns false when actual and expected are equal but one is a number and the other is a string of the same value", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isEqual(attribute.number, String(attribute.number)), "attribute as number should not equal string of same number");
      });
    });
    describe('#isNotEqual assertion', () => {
      it("returns true when actual and expected do not equal and both are boolean", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotEqual(false, true), "expected false not to equal true");
      });
      it("returns true when actual and expected do not equal and both are strings", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotEqual("hello", "world"), "expected 'hello' not to equal 'world'");
      });
      it("returns true when actual and expected do not equal and both are numbers", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotEqual(10, 5), "expected number 10 not to equal 5");
      });
      it("returns true when actual and expected are both objects but do not refer to the same object", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotEqual({}, {}), "expected object not to equal object with differnt reference");
      });
      it("returns true when actual and expected are equal but one is boolean and the other is string with boolean value", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotEqual(true, String(true)), "expected false not to equal string 'false'");
      });
      it("returns true when actual and expected do equal but one is a number and the other is string with number value", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotEqual(10, String(10)), "expected number 10 not to string '10'");
      });
      it("returns false when actual and expected equal and both are boolean", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isNotEqual(true, true), "expected boolean false equal to false to return false");
      });
      it("returns false when actual and expected equal and both are strings", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isNotEqual("hello", "hello"), "expected string 'hello' equal to 'hello' to return false");
      });
      it("returns false when actual and expected equal and both are numbers", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isNotEqual(10, 10), "expected number 10 equal 10 to return false");
      });
      it("returns false when actual and expected are both objects referring to the same reference ", () => {
        const object = {};
        assert.isFalse(DEFAULT_ASSERTIONS.isNotEqual(object, object), "expected object to equal object with same reference to return false");
      });
    });
    describe('#isGreaterThanOrEqual assertions' , () => {
      it("#isGreaterThanOrEqual returns true when actual is greater than or equal to expected and both are numbers", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isGreaterThanOrEqual(15, 10), "expected 15 to be greater than or equal to 10");
      });
      it("#isGreaterThanOrEqual returns true when actual is equal to expected and both are numbers", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isGreaterThanOrEqual(10, 10), "expected 10 to be greater than or equal to 10");
      });
      it("#isGreaterThanOrEqual returns false when actual is less than expected when both are numbers", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isGreaterThanOrEqual(5, 10), "expected that 5 for actual and expected 10 will return false");
      });
      it("#isGreaterThanOrEqual returns false when actual is greater than or equal to expected but they are not of the same type", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isGreaterThanOrEqual("15", 10), "expected that string actual '15' will return false");
      });
    });
    describe('#isGreaterThan assertion', () => {
      it("#isGreaterThan returns true when actual is greater than expected", () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isGreaterThan(15, 10), "expected 15 to be greater than or equal to 10");
      });
      it("#isGreaterThan returns false when actual is equal to expected", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isGreaterThan(10, 10), "expected 10 to be greater than or equal to 10");
      });
      it("#isGreaterThan returns false when actual is less than expected", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isGreaterThan(5, 10), "expected that 5 for actual and expected 10 will return false");
      });
      it("#isGreaterThan returns false when actual is greater than expected but one is not a number", () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isGreaterThan("15", 10), "expected that string actual '15' will return false");
      });
    });
    describe('isLessThanOrEqual', () => {
      it('returns true if actual is less than to expected', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isLessThanOrEqual(10, 15));
      });
      it('returns true if actual is equal to expected', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isLessThanOrEqual(15, 15));
      });
      it('returns false if actual is greater than expected', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isLessThanOrEqual(20, 15));
      });
    });
    describe('isLessThan', () => {
      it('returns true if actual is less than to expected', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isLessThan(10, 15));
      });
      it('returns false if actual is equal to expected', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isLessThan(15, 15));
      });
      it('returns false if actual is greater than expected', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isLessThan(20, 15));
      });
    });
    describe('isIncluded checks for an actual value is an array or comma separated list of expected values', () => {
      it('returns true if actual is included in an array of expected values', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isIncluded('test', ['this', 'is', 'a', 'test']));
      });
      it('returns false if expected is not an array', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isIncluded('test', 'this, is, a, test'));
      });
      it('returns false if actual is not in an array of expected values', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isIncluded('testing', ['this', 'is', 'a', 'test']));
      });
    });
    describe('isNotIncluded checks that an actual value is not in an array or comma separated list of expected values', () => {
      it('returns false if actual is included in an array of expected values', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isNotIncluded('test', ['this', 'is', 'a', 'test']));
      });
      it('returns true if expected is not an array', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotIncluded('test', 'this, is, a, test'));
      });
      it('returns true if actual is not in an array of expected values', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotIncluded('testing', ['this', 'is', 'a', 'test']));
      });
    });
    describe('isNull checks if a value is null', () => {
      it('returns true if actual is null', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNull(null)); // tslint:disable-line
      });
      it('returns false if actual is not null', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isNull('null'));
      });
    });
    describe('isNotNull checks if a value is not null', () => {
      it('returns false if actual is null', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isNotNull(null)); // tslint:disable-line
      });
      it('returns true if actual is not null', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotNull('null'));
      });
    });
    describe('isTrue checks if a value is true', () => {
      it('returns true if actual is null', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isTrue(true));
      });
      it('returns false if actual is not null', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isTrue('true'));
      });
    });
    describe('isNotTrue checks if a value is false', () => {
      it('returns false if actual is null', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isNotTrue(true));
      });
      it('returns true if actual is not null', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotTrue('true'));
      });
    });
    describe('isPresent checks if a value exists, i.e. not undefined', () => {
      it('returns true if actual is null', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isPresent('undefined'));
      });
      it('returns false if actual is not null', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isPresent(undefined));
      });
    });
    describe('isNot present checks if a value does not exist, i.e. undefined', () => {
      it('returns false if actual is null', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isNotPresent('undefined'));
      });
      it('returns true if actual is not null', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotPresent(undefined));
      });
    });
    describe('isMatch checks actual against an expected regular expression', () => {
      it('returns true if actual matches the expected regex pattern', () => {
        // this regex matches hexadecimal numbers...
        assert.isTrue(DEFAULT_ASSERTIONS.isMatch('a4b', '^[a-fA-F0-9]+$'));
      });
      it('returns false if actual does not match the expected regex pattern', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isMatch('z4a', '^[a-fA-F0-9]+$'));
      });
    });
    describe('isNotMatch check actual does not match a regular expression', () => {
      it('returns true if actual matches the expected regex pattern', () => {
        // this regex matches hexadecimal numbers...
        assert.isFalse(DEFAULT_ASSERTIONS.isNotMatch('a4b', '^[a-fA-F0-9]+$'));
      });
      it('returns false if actual does not match the expected regex pattern', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotMatch('z4a', '^[a-fA-F0-9]+$'));
      });
    });
    describe('isEquivalent checks if two objects are equal (by properties, not reference)', () => {
      it('returns true if actual and expected objects have the same properties and values', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isEquivalent({ test: 'hello', world: '!'}, { test: 'hello', world: '!'}));
      });
      it('returns false if actual and expected objects have the same properties and values', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isEquivalent({ test: 'world', hello: '!'}, { test: 'hello', world: '!'}));
      });
    });
    describe('isNotEquivalent checks if two objects are not equal (by properties, not reference)', () => {
      it('returns false if actual and expected objects have the same properties and values', () => {
        assert.isFalse(DEFAULT_ASSERTIONS.isNotEquivalent({ test: 'hello', world: '!'}, { test: 'hello', world: '!'}));
      });
      it('returns true if actual and expected objects have the same properties and values', () => {
        assert.isTrue(DEFAULT_ASSERTIONS.isNotEquivalent({ test: 'world', hello: '!'}, { test: 'hello', world: '!'}));
      });
    });
  });

  describe('array assertions', () => {
    const fixture = {
      action: {},
      subject: {
        age: 25
      },
      resource: {},
      environment: {
        temperature: 20,
        raining: true
      }
    };
    describe('anyOf returns true if more or more assertions in the array return true', () => {
      it('anyOf returns true if all assertions return true', () => {
        const sut = anyOf([
          () => true,
          () => true
        ]);
        const mockAccessRequest = {} as unknown as IAccessRequest;
        assert.isTrue(sut(mockAccessRequest));
      });
      it('anyOf returns true if one assertion returns true', () => {
        const sut = anyOf([
          () => true,
          () => false
        ]);
        const mockAccessRequest = {} as unknown as IAccessRequest;
        assert.isTrue(sut(mockAccessRequest));
      });
      it('anyOf returns false if all assertions return false', () => {
        const sut = anyOf([
          () => false,
          () => false
        ]);
        const mockAccessRequest = {} as unknown as IAccessRequest;
        assert.isFalse(sut(mockAccessRequest));
      });
      it("returns true if there are no rules in anyOf array rule", () => {
        assert.isTrue(DEFAULT_ARRAY_ASSERTIONS.anyOf([])(EmptyAccessRequest), "expected true when no rules are provided");
      });
      it("returns true if any rules in array anyOf rule return true", () => {
        const ageIsEqualTo25 = () => true;
        const tempIsGreaterThanOrEqual18 = () => false;
        const anyOf = DEFAULT_ARRAY_ASSERTIONS.anyOf([ ageIsEqualTo25, tempIsGreaterThanOrEqual18 ]);
        assert.isTrue(anyOf(fixture), "both rules return true results in true");
      });
      it("returns true if both rules in array anyOf rule return true", () => {
        const ageIsEqualTo25 = () => true;
        const tempIsGreaterThanOrEqual18 = () => true;
        const anyOf = DEFAULT_ARRAY_ASSERTIONS.anyOf([ ageIsEqualTo25, tempIsGreaterThanOrEqual18 ]);
        assert.isTrue(anyOf(fixture), "both rules return true results in true");
      });
      it("returns false if all rules in array anyOf rule return false", () => {
        const ageIsEqualTo25 = () => false;
        const tempIsGreaterThanOrEqual18 = () => false;
        const anyOf = DEFAULT_ARRAY_ASSERTIONS.anyOf([ ageIsEqualTo25, tempIsGreaterThanOrEqual18 ]);
        assert.isFalse(anyOf(fixture), "both rules return true results in true");
      });
    });
    describe('allOf returns true if all assertions in the array return true', () => {
      it('allOf returns true if all assertions return true', () => {
        const sut = allOf([
          () => true,
          () => true
        ]);
        const mockAccessRequest = {} as unknown as IAccessRequest;
        assert.isTrue(sut(mockAccessRequest));
      });
      it('allOf returns false if one assertion returns false', () => {
        const sut = allOf([
          () => true,
          () => false
        ]);
        const mockAccessRequest = {} as unknown as IAccessRequest;
        assert.isFalse(sut(mockAccessRequest));
      });
      it('allOf returns false if all assertions return false', () => {
        const sut = allOf([
          () => false,
          () => false
        ]);
        const mockAccessRequest = {} as unknown as IAccessRequest;
        assert.isFalse(sut(mockAccessRequest));
      });
      it("returns true if there are no rules in allOf array rule", () => {
        assert.isTrue(DEFAULT_ARRAY_ASSERTIONS.allOf([])(EmptyAccessRequest), "expected true when no rules are provided");
      });
      it("returns true if all rules in array allOf rule return true", () => {
        const ageIsEqualTo25 = () => true;
        const tempIsGreaterThanOrEqual18 = () => true;
        const allOf = DEFAULT_ARRAY_ASSERTIONS.allOf([ ageIsEqualTo25, tempIsGreaterThanOrEqual18 ]);
        assert.isTrue(allOf(fixture), "both rules return true results in true");
      });
      it("returns false if any one rule in array allOf rule returns false", () => {
        const ageIsEqualTo25 = () => true;
        const tempIsGreaterThanOrEqual18 = () => false;
        const allOf = DEFAULT_ARRAY_ASSERTIONS.allOf([ ageIsEqualTo25, tempIsGreaterThanOrEqual18 ]);
        assert.isFalse(allOf(fixture), "both rules return true results in true");
      });
      it("returns false if all rules in array allOf rule returns false", () => {
        const ageIsEqualTo25 = () => false;
        const tempIsGreaterThanOrEqual18 = () => false;
        const allOf = DEFAULT_ARRAY_ASSERTIONS.allOf([ ageIsEqualTo25, tempIsGreaterThanOrEqual18 ]);
        assert.isFalse(allOf(fixture), "both rules return true results in true");
      });
    });
  });
  describe("Compiling assertions", () => {
    const fixture = {
      action: {},
      subject: {
        age: 25
      },
      resource: {},
      environment: {
        temperature: 20,
        raining: true
      }
    };
    it('throws an assertion error if the specification is empty', () => {
      const assertions = {
        testAssertionFnName: (actual, expected) => true
      };
      const specification = {} as unknown as ISpecification;
      const itThrows = () => makeCompileAssertions(assertions)(specification);
      assert.throws(itThrows, 'An assertion name is required in a specification');
    });
    it('throws an assertion error if the specification is missing the property "attribute"', () => {
      const assertions = {
        testAssertionFnName: (actual, expected) => true
      };
      const specification = {
        testAssertionFnName: {
          expected: 'test'
        }
      } as unknown as ISpecification;
      const itThrows = () => makeCompileAssertions(assertions)(specification);
      assert.throws(itThrows, 'The specification is missing an "attribute" property');
    });
    it('throws an assertion error if the specification is missing an expected property when the assertion function requires an expected value', () => {
      const assertions = {
        testAssertionFnName: (actual, expected) => true
      };
      const specification = {
        testAssertionFnName: {
          attribute: 'test'
        }
      };
      const itThrows = () => makeCompileAssertions(assertions)(specification);
      assert.throws(itThrows, 'The assertion "testAssertionFnName" requires an expected property');
    });
    it('returns undefined if an assertion function is not found', () => {
      const assertions = {
        testAssertionFnName: (actual, expected) => true
      };
      const specification = {
        anotherTestAssertionFnName: {
          attribute: 'attribute',
          expected: 'expected'
        }
      };
      const sut = makeCompileAssertions(assertions)(specification);
      assert.isUndefined(sut);
    });
    it("compiles a single rule and returns true when assertion returns true", () => {
      const assertions = {
        testAssertionFnName: (actual, expected) => true
      };
      const specification = {
        testAssertionFnName: {
          attribute: 'attribute',
          expected: 'expected'
        }
      };
      const sut = makeCompileAssertions(assertions)(specification);
      assert.isTrue(sut(fixture));
    });
    it("compiles a single rule and returns false when assertion returns false", () => {
      const assertions = {
        testAssertionFnName: (actual, expected) => false
      };
      const specification = {
        testAssertionFnName: {
          attribute: 'attribute',
          expected: 'expected'
        }
      };
      const sut = makeCompileAssertions(assertions)(specification);
      assert.isFalse(sut(fixture));
    });
    it('passes to the assertion the value in a specification for expected using a template literal', () => {
      // spy on the expected variable to make sure it equals the value obtained from
      // the data
      const sut = () => {
        let spy;
        const assertions = {
          testAssertionFnName: (actual, expected) => {
            spy = expected;
            return true;
          }
        };
        const specification = {
          testAssertionFnName: {
            attribute: 'subject.age',
            expected: '${subject.age}' // tslint:disable-line
          }
        };
        const data = {
          action: {},
          subject: {
            age: 20
          },
          resource: {},
          environment: {}
        };
        makeCompileAssertions(assertions)(specification)(data);
        return spy;
      };
      assert.isTrue(sut() === 20, 'expected that the value provided to the assertion would be 20');
    });
  });
  describe('Compiling array assertions', () => {
    const mockCompileSpecification: CompileSpecificationsFn = <CompileSpecificationsFn><unknown>(() => {});
    it('throws an assertion error if there is no assertion in the specification', () => {
      const arrays = {};
      const specification = {};
      const itThrows = () => makeCompileArrayAssertions(arrays)(mockCompileSpecification)(specification);
      assert.throws(itThrows, 'An assertion name is required for a array assertion');
    });
    it('throws an assertion error if the array assertion value is not an array', () => {
      const arrays = {
        testArrayFn: (compiledAssertions) => (accessRequest:IAccessRequest) => true
      };
      const specification = {
        testArrayFn: {}
      } as unknown as ISpecification;
      const itThrows = () => makeCompileArrayAssertions(arrays)(mockCompileSpecification)(specification);
      assert.throws(itThrows, 'Array assertions must be an array');
    });
    it('returns undefined if a array assertion function was not found', () => {
      const arrays = {
        testArrayFn: (compiledAssertions) => (accessRequest:IAccessRequest) => true
      };
      const specification = {
        anotherTestFn: [] // this proprty "anotherTestFn" doesn't exist in the arrays functions above...
      };
      const sut = makeCompileArrayAssertions(arrays)(mockCompileSpecification)(specification);
      assert.isUndefined(sut, 'Expected the compiler to return undefined');
    });
    it('returns a compiled array assertion', () => {
      const arrays = {
        testArrayFn: (compiledAssertions) => (accessRequest:IAccessRequest) => true
      };
      const mockCompileSpecification = (specification) => {
        return (accessRequest:IAccessRequest) => true;
      };
      const specification = {
        testArrayFn: [] // this proprty "anotherTestFn" doesn't exist in the arrays functions above...
      };
      const mockAccessRequest = {} as unknown as IAccessRequest;
      const sut = makeCompileArrayAssertions(arrays)(mockCompileSpecification)(specification);
      assert.isTrue(sut(mockAccessRequest), 'Expected the compiled array function to return true');
    });
  });
  describe("Compiling a specification combining compiling assertions and arrays", () => {
    it('returns a compiled specification that always returns true if the specification in a policy is not defined', () => {
      const mockCompileArray = () => {};
      const mockCompileAssertion = () => {};
      const specification = undefined as unknown as ISpecification;
      const mockAccessRequest = {} as unknown as IAccessRequest;
      const sut = makeCompileSpecification(mockCompileArray as unknown as CompileArrayAssertionsFn, mockCompileAssertion as unknown as CompileSpecificationsFn)(specification);
      assert.isFunction(sut, 'expected a function to be returned');
      assert.isTrue(sut(mockAccessRequest), 'expected an undefined specification to return true');
    });
    it('returns a compiled specification that always returns true if the specification in a policy is an empty object', () => {
      const mockCompileArray = () => {};
      const mockCompileAssertion = () => {};
      const specification = {} as unknown as ISpecification;
      const mockAccessRequest = {} as unknown as IAccessRequest;
      const sut = makeCompileSpecification(mockCompileArray as unknown as CompileArrayAssertionsFn, mockCompileAssertion as unknown as CompileSpecificationsFn)(specification);
      assert.isFunction(sut, 'expected a function to be returned');
      assert.isTrue(sut(mockAccessRequest), 'expected an empty specification to return true');
    });
    it('throws an error if a specification is provided but is not an object', () => {
      const mockCompileArray = (compileSpecification:CompileSpecificationsFn) => () => {};
      const mockCompileAssertion = () => {};
      const specification = [] as unknown as ISpecification;
      const mockAccessRequest = {} as unknown as IAccessRequest;
      const itThrows = () => makeCompileSpecification(mockCompileArray as unknown as CompileArrayAssertionsFn, mockCompileAssertion as unknown as CompileSpecificationsFn)(specification);
      assert.throws(itThrows, 'Specification must be an object');
    });
    it('throws an error if an assertion name is not recognised', () => {
      // if both teh compile array and compile assertion functions return
      // undefined then compile specificaiton will throw an assertion error...
      const mockCompileArray = (compileSpecification:CompileSpecificationsFn) => (specification:ISpecification) => undefined;
      const mockCompileAssertion = (specification:ISpecification) => undefined;
      const specification = {
        test: {} // specify an assertion name to avoid triggering an empty spec error
      } as unknown as ISpecification;
      const mockAccessRequest = {} as unknown as IAccessRequest;
      const itThrows = () => makeCompileSpecification(mockCompileArray as unknown as CompileArrayAssertionsFn, mockCompileAssertion as unknown as CompileSpecificationsFn)(specification);
      assert.throws(itThrows, 'The assertion "test" does not exist');
    });
    it('throws an error if more than one assertion in a specification object', () => {
            // if both teh compile array and compile assertion functions return
      // undefined then compile specificaiton will throw an assertion error...
      const mockCompileArray = (compileSpecification:CompileSpecificationsFn) => (specification:ISpecification) => undefined;
      const mockCompileAssertion = (specification:ISpecification) => undefined;
      const specification = {
        isEqual: {
          attribute: 'test'
        },
        isNotEqual: {
          attribute: 'test'
        }
      } as unknown as ISpecification;
      const mockAccessRequest = {} as unknown as IAccessRequest;
      const itThrows = () => makeCompileSpecification(mockCompileArray as unknown as CompileArrayAssertionsFn, mockCompileAssertion as unknown as CompileSpecificationsFn)(specification);
      assert.throws(itThrows, 'Only one assertion per specification is allowed');
    });
    it('a complex compiled specification returns true as expected', () => {
      const specification = {
        allOf: [
          {
            isEqual: {
              attribute: 'subject.name',
              expected: 'John'
            }
          },
          {
            anyOf: [
              {
                isGreaterThan: {
                  attribute: "environment.temperature",
                  expected: 22
                }
              },
              {
                isTrue: {
                  attribute: "environment.isRaining"
                }
              }
            ]
          }
        ]
      };
      const sut = makeCompileSpecification(makeCompileArrayAssertions(DEFAULT_ARRAY_ASSERTIONS), makeCompileAssertions(DEFAULT_ASSERTIONS))(specification);
      assert.isTrue(sut({
        action: {},
        subject: {
          name: 'John' // will return true
        },
        resource: {},
        environment: {
          temperature: 18, // will return false
          isRaining: true // will return true
        }
      }));
    });
    it('a complex nested specification returns false as expected', () => {
      const specification = {
        allOf: [
          {
            isEqual: {
              attribute: 'subject.name',
              expected: 'John'
            }
          },
          {
            anyOf: [
              {
                isGreaterThan: {
                  attribute: "environment.temperature",
                  expected: 22
                }
              },
              {
                isTrue: {
                  attribute: "environment.isRaining"
                }
              }
            ]
          }
        ]
      };
      const sut = makeCompileSpecification(makeCompileArrayAssertions(DEFAULT_ARRAY_ASSERTIONS), makeCompileAssertions(DEFAULT_ASSERTIONS))(specification);
      assert.isFalse(sut({
        action: {},
        subject: {
          name: 'John' // will return true
        },
        resource: {},
        environment: {
          temperature: 18, // will return false
          isRaining: false // will return true
        }
      }));
    });
  });
});
