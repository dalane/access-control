import { ASSERTIONS, compileAssertion, COMPOSITES, compileSpecification, compileCompositeAssertion, ISpecification, anyOf, allOf, isIncluded } from "../app/policy/specification";
import { assert } from 'chai';
import { EmptyAccessRequest } from "./fixtures/test-data";
import { merge } from "../app/helpers";
import { IAccessRequest } from "../app/access-request";

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
        assert.isTrue(ASSERTIONS.isEqual(attribute.boolean, attribute.boolean), "expected boolean false to equal false");
      });
      it("returns true when actual and expected are equal and are both strings", () => {
        assert.isTrue(ASSERTIONS.isEqual(attribute.string, attribute.string), "expected string 'hello' to equal 'hello'");
      });
      it("returns true when actual and expected are equal and are both numbers", () => {
        assert.isTrue(ASSERTIONS.isEqual(attribute.number, attribute.number), "expected number 10 to equal 10");
      });
      it("returns true when actual and expected are both objects and refer to the same object", () => {
        assert.isTrue(ASSERTIONS.isEqual(attribute.object, attribute.object), "expected object to equal object with same reference");
      });
      it("returns false when actual and expected are not equal and both are boolean", () => {
        assert.isFalse(ASSERTIONS.isEqual(attribute.boolean, notExpected.boolean), "expected false not to equal true");
      });
      it("returns false when actual and expected are not equal and both are strings", () => {
        assert.isFalse(ASSERTIONS.isEqual(attribute.string, notExpected.string), "expected 'hello' not to equal 'world'");
      });
      it("returns false when actual and expected are not equal and both are numbers", () => {
        assert.isFalse(ASSERTIONS.isEqual(attribute.number, notExpected.number), "expected number 10 not to equal 5");
      });
      it("returns false when actual and expected are both objects and do not have the same reference", () => {
        assert.isFalse(ASSERTIONS.isEqual(attribute.object, notExpected.object), "expected object not to equal object with differnt reference");
      });
      it("returns false when actual and expected are equal but one is a boolean and the other is a string of the same value", () => {
        assert.isFalse(ASSERTIONS.isEqual(attribute.boolean, String(attribute.boolean)), "expected false not to equal string 'false'");
      });
      it("returns false when actual and expected are equal but one is a number and the other is a string of the same value", () => {
        assert.isFalse(ASSERTIONS.isEqual(attribute.number, String(attribute.number)), "attribute as number should not equal string of same number");
      });
    });
    describe('#isNotEqual assertion', () => {
      it("returns true when actual and expected do not equal and both are boolean", () => {
        assert.isTrue(ASSERTIONS.isNotEqual(false, true), "expected false not to equal true");
      });
      it("returns true when actual and expected do not equal and both are strings", () => {
        assert.isTrue(ASSERTIONS.isNotEqual("hello", "world"), "expected 'hello' not to equal 'world'");
      });
      it("returns true when actual and expected do not equal and both are numbers", () => {
        assert.isTrue(ASSERTIONS.isNotEqual(10, 5), "expected number 10 not to equal 5");
      });
      it("returns true when actual and expected are both objects but do not refer to the same object", () => {
        assert.isTrue(ASSERTIONS.isNotEqual({}, {}), "expected object not to equal object with differnt reference");
      });
      it("returns true when actual and expected are equal but one is boolean and the other is string with boolean value", () => {
        assert.isTrue(ASSERTIONS.isNotEqual(true, String(true)), "expected false not to equal string 'false'");
      });
      it("returns true when actual and expected do equal but one is a number and the other is string with number value", () => {
        assert.isTrue(ASSERTIONS.isNotEqual(10, String(10)), "expected number 10 not to string '10'");
      });
      it("returns false when actual and expected equal and both are boolean", () => {
        assert.isFalse(ASSERTIONS.isNotEqual(true, true), "expected boolean false equal to false to return false");
      });
      it("returns false when actual and expected equal and both are strings", () => {
        assert.isFalse(ASSERTIONS.isNotEqual("hello", "hello"), "expected string 'hello' equal to 'hello' to return false");
      });
      it("returns false when actual and expected equal and both are numbers", () => {
        assert.isFalse(ASSERTIONS.isNotEqual(10, 10), "expected number 10 equal 10 to return false");
      });
      it("returns false when actual and expected are both objects referring to the same reference ", () => {
        const object = {};
        assert.isFalse(ASSERTIONS.isNotEqual(object, object), "expected object to equal object with same reference to return false");
      });
    });
    describe('#isGreaterThanOrEqual assertions' , () => {
      it("#isGreaterThanOrEqual returns true when actual is greater than or equal to expected and both are numbers", () => {
        assert.isTrue(ASSERTIONS.isGreaterThanOrEqual(15, 10), "expected 15 to be greater than or equal to 10");
      });
      it("#isGreaterThanOrEqual returns true when actual is equal to expected and both are numbers", () => {
        assert.isTrue(ASSERTIONS.isGreaterThanOrEqual(10, 10), "expected 10 to be greater than or equal to 10");
      });
      it("#isGreaterThanOrEqual returns false when actual is less than expected when both are numbers", () => {
        assert.isFalse(ASSERTIONS.isGreaterThanOrEqual(5, 10), "expected that 5 for actual and expected 10 will return false");
      });
      it("#isGreaterThanOrEqual returns false when actual is greater than or equal to expected but they are not of the same type", () => {
        assert.isFalse(ASSERTIONS.isGreaterThanOrEqual("15", 10), "expected that string actual '15' will return false");
      });
    });
    describe('#isGreaterThan assertion', () => {
      it("#isGreaterThan returns true when actual is greater than expected", () => {
        assert.isTrue(ASSERTIONS.isGreaterThan(15, 10), "expected 15 to be greater than or equal to 10");
      });
      it("#isGreaterThan returns false when actual is equal to expected", () => {
        assert.isFalse(ASSERTIONS.isGreaterThan(10, 10), "expected 10 to be greater than or equal to 10");
      });
      it("#isGreaterThan returns false when actual is less than expected", () => {
        assert.isFalse(ASSERTIONS.isGreaterThan(5, 10), "expected that 5 for actual and expected 10 will return false");
      });
      it("#isGreaterThan returns false when actual is greater than expected but one is not a number", () => {
        assert.isFalse(ASSERTIONS.isGreaterThan("15", 10), "expected that string actual '15' will return false");
      });
    });
    describe('isLessThanOrEqual', () => {
      it('returns true if actual is less than to expected', () => {
        assert.isTrue(ASSERTIONS.isLessThanOrEqual(10, 15));
      });
      it('returns true if actual is equal to expected', () => {
        assert.isTrue(ASSERTIONS.isLessThanOrEqual(15, 15));
      });
      it('returns false if actual is greater than expected', () => {
        assert.isFalse(ASSERTIONS.isLessThanOrEqual(20, 15));
      });
    });
    describe('isLessThan', () => {
      it('returns true if actual is less than to expected', () => {
        assert.isTrue(ASSERTIONS.isLessThan(10, 15));
      });
      it('returns false if actual is equal to expected', () => {
        assert.isFalse(ASSERTIONS.isLessThan(15, 15));
      });
      it('returns false if actual is greater than expected', () => {
        assert.isFalse(ASSERTIONS.isLessThan(20, 15));
      });
    });
    describe('isIncluded checks for an actual value is an array or comma separated list of expected values', () => {
      it('returns true if actual is included in an array of expected values', () => {
        assert.isTrue(ASSERTIONS.isIncluded('test', ['this', 'is', 'a', 'test']));
      });
      it('returns false if expected is not an array', () => {
        assert.isFalse(ASSERTIONS.isIncluded('test', 'this, is, a, test'));
      });
      it('returns false if actual is not in an array of expected values', () => {
        assert.isFalse(ASSERTIONS.isIncluded('testing', ['this', 'is', 'a', 'test']));
      });
    });
    describe('isNotIncluded checks that an actual value is not in an array or comma separated list of expected values', () => {
      it('returns false if actual is included in an array of expected values', () => {
        assert.isFalse(ASSERTIONS.isNotIncluded('test', ['this', 'is', 'a', 'test']));
      });
      it('returns true if expected is not an array', () => {
        assert.isTrue(ASSERTIONS.isNotIncluded('test', 'this, is, a, test'));
      });
      it('returns true if actual is not in an array of expected values', () => {
        assert.isTrue(ASSERTIONS.isNotIncluded('testing', ['this', 'is', 'a', 'test']));
      });
    });
    describe('isNull checks if a value is null', () => {
      it('returns true if actual is null', () => {
        assert.isTrue(ASSERTIONS.isNull(null)); // tslint:disable-line
      });
      it('returns false if actual is not null', () => {
        assert.isFalse(ASSERTIONS.isNull('null'));
      });
    });
    describe('isNotNull checks if a value is not null', () => {
      it('returns false if actual is null', () => {
        assert.isFalse(ASSERTIONS.isNotNull(null)); // tslint:disable-line
      });
      it('returns true if actual is not null', () => {
        assert.isTrue(ASSERTIONS.isNotNull('null'));
      });
    });
    describe('isTrue checks if a value is true', () => {
      it('returns true if actual is null', () => {
        assert.isTrue(ASSERTIONS.isTrue(true));
      });
      it('returns false if actual is not null', () => {
        assert.isFalse(ASSERTIONS.isTrue('true'));
      });
    });
    describe('isNotTrue checks if a value is false', () => {
      it('returns false if actual is null', () => {
        assert.isFalse(ASSERTIONS.isNotTrue(true));
      });
      it('returns true if actual is not null', () => {
        assert.isTrue(ASSERTIONS.isNotTrue('true'));
      });
    });
    describe('isPresent checks if a value exists, i.e. not undefined', () => {
      it('returns true if actual is null', () => {
        assert.isTrue(ASSERTIONS.isPresent('undefined'));
      });
      it('returns false if actual is not null', () => {
        assert.isFalse(ASSERTIONS.isPresent(undefined));
      });
    });
    describe('isNot present checks if a value does not exist, i.e. undefined', () => {
      it('returns false if actual is null', () => {
        assert.isFalse(ASSERTIONS.isNotPresent('undefined'));
      });
      it('returns true if actual is not null', () => {
        assert.isTrue(ASSERTIONS.isNotPresent(undefined));
      });
    });
    describe('isMatch checks actual against an expected regular expression', () => {
      it('returns true if actual matches the expected regex pattern', () => {
        // this regex matches hexadecimal numbers...
        assert.isTrue(ASSERTIONS.isMatch('a4b', '^[a-fA-F0-9]+$'));
      });
      it('returns false if actual does not match the expected regex pattern', () => {
        assert.isFalse(ASSERTIONS.isMatch('z4a', '^[a-fA-F0-9]+$'));
      });
    });
    describe('isNotMatch check actual does not match a regular expression', () => {
      it('returns true if actual matches the expected regex pattern', () => {
        // this regex matches hexadecimal numbers...
        assert.isFalse(ASSERTIONS.isNotMatch('a4b', '^[a-fA-F0-9]+$'));
      });
      it('returns false if actual does not match the expected regex pattern', () => {
        assert.isTrue(ASSERTIONS.isNotMatch('z4a', '^[a-fA-F0-9]+$'));
      });
    });
    describe('isEquivalent checks if two objects are equal (by properties, not reference)', () => {
      it('returns true if actual and expected objects have the same properties and values', () => {
        assert.isTrue(ASSERTIONS.isEquivalent({ test: 'hello', world: '!'}, { test: 'hello', world: '!'}));
      });
      it('returns false if actual and expected objects have the same properties and values', () => {
        assert.isFalse(ASSERTIONS.isEquivalent({ test: 'world', hello: '!'}, { test: 'hello', world: '!'}));
      });
    });
    describe('isNotEquivalent checks if two objects are not equal (by properties, not reference)', () => {
      it('returns false if actual and expected objects have the same properties and values', () => {
        assert.isFalse(ASSERTIONS.isNotEquivalent({ test: 'hello', world: '!'}, { test: 'hello', world: '!'}));
      });
      it('returns true if actual and expected objects have the same properties and values', () => {
        assert.isTrue(ASSERTIONS.isNotEquivalent({ test: 'world', hello: '!'}, { test: 'hello', world: '!'}));
      });
    });
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
    it('throws an assertion error if the specification is missing an expected property when the assertion function requires an expected value', () => {
      const itThrows = () => compileAssertion((actual, expected) => true)('testAssertionFnName')({ attribute: 'test' });
      assert.throws(itThrows, 'The assertion "testAssertionFnName" requires an expected property');
    });
    it("compiles a single rule and returns true when assertion returns true", () => {
      const sut = compileAssertion((actual, expected) => true)('testAssertFnName')({ attribute: 'test', expected: 'expected' });
      assert.isTrue(sut(fixture));
    });
    it("compiles a single rule and returns false when assertion returns false", () => {
      const sut = compileAssertion((actual, expected) => false)('testAssertFnName')({ attribute: 'test', expected: 'expected' });
      assert.isFalse(sut(fixture));
    });
    it('passes to the assertion the value in a specification for expected using a template literal', () => {
      // spy on the expected variable to make sure it equals the value obtained from
      // the data
      const sut = () => {
        const specification = {
          attribute: 'subject.age',
          expected: '${subject.age}' // tslint:disable-line
        };
        const data = {
          action: {},
          subject: {
            age: 20
          },
          resource: {},
          environment: {}
        };
        let expectedSpy;
        compileAssertion((actual, expected) => {
          expectedSpy = expected;
          return (actual === expected);
        })('testFnName')(specification)(data);
        return expectedSpy;
      };
      assert.isTrue(sut() === 20, 'expected that the value provided to the assertion would be 20');
    });
    it("returns true if there are no rules in anyOf composite rule", () => {
      assert.isTrue(COMPOSITES.anyOf([])(EmptyAccessRequest), "expected true when no rules are provided");
    });
    it("returns true if there are no rules in allOf composite rule", () => {
      assert.isTrue(COMPOSITES.allOf([])(EmptyAccessRequest), "expected true when no rules are provided");
    });
    it("returns true if any rules in composite anyOf rule return true", () => {
      const ageIsEqualTo25 = compileAssertion((actual, expected) => (actual === expected))('testAssertionFnName')({
        attribute: 'subject.age',
        expected: 25
      });
      const tempIsGreaterThanOrEqual18 = compileAssertion(ASSERTIONS.isGreaterThanOrEqual)('testAssertionFnName')({
        attribute: 'environment.temperature',
        expected: 18
      });
      const anyOf = COMPOSITES.anyOf([ ageIsEqualTo25, tempIsGreaterThanOrEqual18 ]);
      assert.isTrue(anyOf(fixture), "both rules return true results in true");
      assert.isTrue(anyOf(merge({}, fixture, { subject: {age: 30 }})), "age is not equal to 25 so rule should returns false but overall result is true");
      assert.isFalse(anyOf(merge({}, fixture, { subject: {age: 30 }, environment: { temperature: 15 }})), "age is not equal and temperature is not greater than or equal so both rules should return false with anyOf return false");
    });
    it("returns true if all rules in composite allOf rule return true", () => {
      const ageIsEqualTo25 = compileAssertion((actual, expected) => (actual === expected))('testAssertionFnName')({
        attribute: 'subject.age',
        expected: 25
      });
      const tempIsGreaterThanOrEqual18 = compileAssertion(ASSERTIONS.isGreaterThanOrEqual)('testAssertionFnName')({
        attribute: 'environment.temperature',
        expected: 18
      });
      const allOf = COMPOSITES.allOf([ ageIsEqualTo25, tempIsGreaterThanOrEqual18 ]);
      assert.isTrue(allOf(fixture), "both rules return true results in true");
      assert.isFalse(allOf(merge({}, fixture, { subject: {age: 30 }})), "age is not equal to 25 so rule should returns false but expected allOf to return false");
      assert.isFalse(allOf(merge({}, fixture, { subject: {age: 30 }, environment: { temperature: 15 }})), "age is not equal and temperature is not greater than or equal so both rules should return false with anyOf return false");
    });
  });
  describe("Compiling a specification", () => {
    it('throws an error if an assertion name is not recognised', () => {
      const itThrowsATypeError = () => {
        const specification = <ISpecification><unknown>{
          test: {}
        };
        // a collection of assertions supported by the compiler
        const assertions = {
          isEqual: (actual, expected) => true
        };
        compileSpecification(compileCompositeAssertion)(compileAssertion)({})(assertions)(specification);
      };
      assert.throws(itThrowsATypeError, 'The assertion function "test" does not exist');
    });
    it('throws an error if a specification is not an object', () => {
      const itThrowsATypeError = () => {
        const specification = <ISpecification><unknown>'';
        // a collection of assertions supported by the compiler
        const assertions = {
          isEqual: (actual, expected) => true
        };
        compileSpecification(compileCompositeAssertion)(compileAssertion)({})(assertions)(specification);
      };
      assert.throws(itThrowsATypeError, 'Specification must be an object');
    });
    it('throws an error if more than one assertion in a specification object', () => {
      const itThrowsATypeError = () => {
        const specification = <ISpecification> {
          isEqual: {
            attribute: 'test'
          },
          isNotEqual: {
            attribute: 'test'
          }
        };
        // a collection of assertions supported by the compiler
        const assertions = {
          isEqual: (actual, expected) => true
        };
        compileSpecification(compileCompositeAssertion)(compileAssertion)({})(assertions)(specification);
      };
      assert.throws(itThrowsATypeError, 'Only one assertion per assertion object');
    });
    it("returns a function that always returns true if the specification is undefined", () => {
      const specification = undefined;
      const sut = compileSpecification(compileCompositeAssertion)(compileAssertion)(COMPOSITES)(ASSERTIONS)(specification);
      assert.isTrue(sut({
        action: {},
        subject: {
          name: "John Smith"
        },
        resource: {},
        environment: {}
      }));
    });
    it('returns a function that always returns true if the specification is an empty object', () => {
        const specification = {};
        // a collection of assertions supported by the compiler
        const assertions = {
          isEqual: (actual, expected) => true
        };
        const sut = compileSpecification(compileCompositeAssertion)(compileAssertion)({})(assertions)(specification);
        assert.isFunction(sut, 'Expected a function to be returned');
        const mockAccessRequest = {} as unknown as IAccessRequest;
      assert.isTrue(sut(mockAccessRequest), 'Expected the function to return true');
    });
    it('compiles a nested specification without errors', () => {
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
      const doesNotThrow = () => {
        const sut = compileSpecification(compileCompositeAssertion)(compileAssertion)(COMPOSITES)(ASSERTIONS)(specification);
      };
      assert.doesNotThrow(doesNotThrow, 'expected no errors to be thrown');
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
      const sut = compileSpecification(compileCompositeAssertion)(compileAssertion)(COMPOSITES)(ASSERTIONS)(specification);
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
      const sut = compileSpecification(compileCompositeAssertion)(compileAssertion)(COMPOSITES)(ASSERTIONS)(specification);
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
