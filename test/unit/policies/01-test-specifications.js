'use strict';

const SpecificationFactory = require('../../../built/policies/specifications/factory');
const specifications = require('../../../built/policies/specifications');
const {expect} = require('chai');
const {Map} = require('immutable');

describe('specifications', () => {
  describe('modules', () => {
    describe('is-equal specification', () => {
      it('returns true if actual value equal expected value for a string', () => {
        let sut = new specifications.IsEqualSpecification('subject.email', 'example@example.com');
        let accessRequest = Map({
          subject: Map({
            email: 'example@example.com'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
        expect(sut.expected).to.equal('example@example.com');
        expect(sut.expectedIsAttribute).to.equal(false);
        expect(sut.expectedAttribute).to.equal(null);
        expect(sut.expectedValue).to.equal(sut.expected);
      });
      it('returns false if actual value does not equal expected value for a string', () => {
        let sut = new specifications.IsEqualSpecification('subject.email', 'example@example.com');
        let accessRequest = Map({
          subject: Map({
            email: 'not-an-example@example.com'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('is-not-equal specification', () => {
      it('returns false if actual value equal expected value for a string', () => {
        let sut = new specifications.IsNotEqualSpecification('subject.email', 'example@example.com');
        let accessRequest = Map({
          subject: Map({
            email: 'example@example.com'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
      it('returns true if actual value does not equal expected value for a string', () => {
        let sut = new specifications.IsNotEqualSpecification('subject.email', 'example@example.com');
        let accessRequest = Map({
          subject: Map({
            email: 'not-an-example@example.com'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
    });
    describe('is-greater-than-or-equal specification', () => {
      it('returns true if actual value greater than value', () => {
        let sut = new specifications.IsGreaterThanOrEqualSpecification('subject.age', 18);
        let accessRequest = Map({
          subject: Map({
            age: 20
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns true if actual value equal to value', () => {
        let sut = new specifications.IsGreaterThanOrEqualSpecification('subject.age', 18);
        let accessRequest = Map({
          subject: Map({
            age: 18
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if actual value is not greater than or equal to expected value', () => {
        let sut = new specifications.IsGreaterThanOrEqualSpecification('subject.age', 18);
        let accessRequest = Map({
          subject: Map({
            age: 17
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('is-greater-than specification', () => {
      it('returns true if actual value greater than value', () => {
        let sut = new specifications.IsGreaterThanSpecification('subject.age', 18);
        let accessRequest = Map({
          subject: Map({
            age: 20
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if actual value is not greater than expected value', () => {
        let sut = new specifications.IsGreaterThanSpecification('subject.age', 18);
        let accessRequest = Map({
          subject: Map({
            age: 18
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('is-less-than-or-equal specification', () => {
      it('returns true if actual value less than expected value', () => {
        let sut = new specifications.IsLessThanOrEqualSpecification('subject.age', 18);
        let accessRequest = Map({
          subject: Map({
            age: 17
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns true if actual value equal to expected value', () => {
        let sut = new specifications.IsLessThanOrEqualSpecification('subject.age', 18);
        let accessRequest = Map({
          subject: Map({
            age: 18
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if actual value is not less than or equal to expected value', () => {
        let sut = new specifications.IsLessThanOrEqualSpecification('subject.age', 18);
        let accessRequest = Map({
          subject: Map({
            age: 19
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('is-less-than specification', () => {
      it('returns true if actual value less than expected value', () => {
        let sut = new specifications.IsLessThanSpecification('subject.age', 18);
        let accessRequest = Map({
          subject: Map({
            age: 17
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if actual value is not less than expected value', () => {
        let sut = new specifications.IsLessThanSpecification('subject.age', 18);
        let accessRequest = Map({
          subject: Map({
            age: 18
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('is-included specification', () => {
      it('returns true if actual value is found in array of expected values', () => {
        let sut = new specifications.IsIncludedSpecification('subject.role', ['owner', 'cook', 'chief-bottlewasher']);
        let accessRequest = Map({
          subject: Map({
            role: 'chief-bottlewasher'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if actual value is not found in an array of expected values', () => {
        let sut = new specifications.IsIncludedSpecification('subject.role', ['owner', 'cook', 'chief-bottlewasher']);
        let accessRequest = Map({
          subject: Map({
            role: 'chef'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('is-not-included specification', () => {
      it('returns true if actual value is not found in array of values', () => {
        let sut = new specifications.IsNotIncludedSpecification('subject.role', ['owner', 'cook', 'chief-bottlewasher']);
        let accessRequest = Map({
          subject: Map({
            role: 'chef'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if actual value is found in array of values', () => {
        let sut = new specifications.IsNotIncludedSpecification('subject.role', ['owner', 'cook', 'chief-bottlewasher']);
        let accessRequest = Map({
          subject: Map({
            role: 'chief-bottlewasher'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('is-null specification', () => {
      it('returns true if actual value is null', () => {
        let sut = new specifications.IsNullSpecification('subject.role');
        let accessRequest = Map({
          subject: Map({
            role: null
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if actual value is not null', () => {
        let sut = new specifications.IsNullSpecification('subject.role');
        let accessRequest = Map({
          subject: Map({
            role: 'chief-bottlewasher'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('is-not-null specification', () => {
      it('returns true if actual value is not null', () => {
        let sut = new specifications.IsNotNullSpecification('subject.role');
        let accessRequest = Map({
          subject: Map({
            role: 'chief-bottlewasher'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if actual value is null', () => {
        let sut = new specifications.IsNotNullSpecification('subject.role');
        let accessRequest = Map({
          subject: Map({
            role: null
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('is-present specification', () => {
      it('returns true if actual value is present', () => {
        let sut = new specifications.IsPresentSpecification('subject.role');
        let accessRequest = Map({
          subject: Map({
            role: 'chief-bottlewasher'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if actual value is not present', () => {
        let sut = new specifications.IsPresentSpecification('subject.role');
        let accessRequest = Map({
          subject: Map({})
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('is-not-present specification', () => {
      it('returns true if actual value is not present', () => {
        let sut = new specifications.IsNotPresentSpecification('subject.role');
        let accessRequest = Map({
          subject: Map({
            // role: 'chief-bottlewasher' is not present
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if actual value is present', () => {
        let sut = new specifications.IsNotPresentSpecification('subject.role');
        let accessRequest = Map({
          subject: Map({
            role: 'chief-bottlewasher'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('is-true specification', () => {
      it('returns true if actual value is true', () => {
        let sut = new specifications.IsTrueSpecification('subject.isAdmin');
        let accessRequest = Map({
          subject: Map({
            isAdmin: true
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if actual value is not true', () => {
        let sut = new specifications.IsTrueSpecification('subject.isAdmin');
        let accessRequest = Map({
          subject: Map({
            isAdmin: false
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('is-not-true specification', () => {
      it('returns true if actual value is not true', () => {
        let sut = new specifications.IsNotTrueSpecification('subject.isAdmin');
        let accessRequest = Map({
          subject: Map({
            isAdmin: false
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if actual value is true', () => {
        let sut = new specifications.IsNotTrueSpecification('subject.isAdmin');
        let accessRequest = Map({
          subject: Map({
            isAdmin: true
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('all-of specification', () => {
      it('returns true if all specifications in the collection return true', () => {
        let sut = new specifications.AllOfSpecification();
        sut.push(new specifications.IsEqualSpecification('subject.name', 'John Smith'));
        sut.push(new specifications.IsTrueSpecification('subject.isAdmin', true));
        let accessRequest = Map({
          subject: Map({
            name: 'John Smith',
            isAdmin: true
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false if at least one specification in the collection returns false', () => {
        let sut = new specifications.AllOfSpecification();
        sut.push(new specifications.IsEqualSpecification('subject.name', 'John Smith'));
        sut.push(new specifications.IsTrueSpecification('subject.isAdmin', true));
        let accessRequest = Map({
          subject: Map({
            name: 'John Smith',
            isAdmin: false
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
    describe('any-of specification', () => {
      it('returns true if at least one specification in the collection returns true', () => {
        let sut = new specifications.AnyOfSpecification();
        sut.push(new specifications.IsEqualSpecification('subject.name', 'John Smith'));
        sut.push(new specifications.IsTrueSpecification('subject.isAdmin', true));
        let accessRequest = Map({
          subject: Map({
            name: 'John Smith',
            isAdmin: false
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
      });
      it('returns false only if all specification in the collection returns false', () => {
        let sut = new specifications.AnyOfSpecification();
        sut.push(new specifications.IsEqualSpecification('subject.name', 'John Smith'));
        sut.push(new specifications.IsTrueSpecification('subject.isAdmin', true));
        let accessRequest = Map({
          subject: Map({
            name: 'Jill Smith',
            isAdmin: false
          })
        });
        expect(sut.isSatisfiedBy(accessRequest, true)).to.equal(false);
      });
    });
    describe('compounded specifications', () => {
      it('returns true if all compounded specifications are satisfied', () => {
        let anyOf_sut = new specifications.AnyOfSpecification();
        let allOf_sut = new specifications.AllOfSpecification();
        let isEqual_sut = new specifications.IsEqualSpecification('subject.name', 'John Smith');
        let isTrue_sut = new specifications.IsTrueSpecification('subject.isAdmin', true);
        let isGreaterThanOrEqual_sut = new specifications.IsGreaterThanOrEqualSpecification('subject.age', 18);
        // isTrue and isGreaterThanOrEqual are to return true, therefore allOf
        // should return true
        allOf_sut.push(isTrue_sut);
        allOf_sut.push(isGreaterThanOrEqual_sut);
        // allOf should return true but isEqual we will set to fail however as
        // the specification isAny it should still be satisfied
        anyOf_sut.push(allOf_sut);
        anyOf_sut.push(isEqual_sut);
        let request = Map({
          subject: Map({
            name: 'Jane Smith',
            age: 20,
            isAdmin: true
          })
        });
        expect(isEqual_sut.isSatisfiedBy(request)).to.equal(false);
        expect(isTrue_sut.isSatisfiedBy(request)).to.equal(true);
        expect(isGreaterThanOrEqual_sut.isSatisfiedBy(request)).to.equal(true);
        expect(allOf_sut.isSatisfiedBy(request)).to.equal(true);
        expect(anyOf_sut.isSatisfiedBy(request)).to.equal(true);
      });
      it('returns false if not all compounded specifications are satisfied', () => {
        let anyOf_sut = new specifications.AnyOfSpecification();
        let allOf_sut = new specifications.AllOfSpecification();
        let isEqual_sut = new specifications.IsEqualSpecification('subject.name', 'John Smith');
        let isTrue_sut = new specifications.IsTrueSpecification('subject.isAdmin', true);
        let isGreaterThanOrEqual_sut = new specifications.IsGreaterThanOrEqualSpecification('subject.age', 18);
        // isTrue and isGreaterThanOrEqual are to return true, therefore allOf
        // should return true
        allOf_sut.push(isTrue_sut);
        allOf_sut.push(isGreaterThanOrEqual_sut);
        // allOf should return true but isEqual we will set to fail however as
        // the specification isAny it should still be satisfied
        anyOf_sut.push(allOf_sut);
        anyOf_sut.push(isEqual_sut);
        let request = Map({
          subject: Map({
            name: 'Jill Smith',
            age: 17,
            isAdmin: true
          })
        });
        expect(isEqual_sut.isSatisfiedBy(request)).to.equal(false);
        expect(isTrue_sut.isSatisfiedBy(request)).to.equal(true);
        expect(isGreaterThanOrEqual_sut.isSatisfiedBy(request)).to.equal(false);
        expect(allOf_sut.isSatisfiedBy(request)).to.equal(false);
        expect(anyOf_sut.isSatisfiedBy(request)).to.equal(false);
      });
    });
    describe('Expected value can be obtained from an access request attribute', () => {
      it('returns true if actual value equal expected value', () => {
        let sut = new specifications.IsEqualSpecification('subject.email', '${resource.owner}');
        let accessRequest = Map({
          subject: Map({
            email: 'example@example.com'
          }),
          resource: Map({
            owner: 'example@example.com'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
        expect(sut.expected).to.equal('${resource.owner}');
        expect(sut.expectedIsAttribute).to.equal(true);
        expect(sut.expectedAttribute).to.equal('resource.owner');
        expect(sut.expectedValue).to.equal(null);
      });
      it('returns false if actual value does not equal expected value', () => {
        let sut = new specifications.IsEqualSpecification('subject.email', '${resource.owner}');
        let accessRequest = Map({
          subject: Map({
            email: 'not-an-example@example.com'
          }),
          resource: Map({
            owner: 'example@example.com'
          })
        });
        expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
      });
    });
  });
  describe('factory', () => {
    it('creates compound specification from plain object in the correct format', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [{
          isTrue: {
            attribute: 'subject.isAdmin'
          }
        },
        {
          allOf: [{
              isEqual: {
                attribute: 'subject.email',
                expected: 'example@example.com',
              }
            },
            {
              isGreaterThanOrEqual: {
                attribute: 'subject.age',
                expected: 18
              }
            }
          ]
        }
      ];
      let specification = sut.create(plainObjectSpecification);
      expect(specification instanceof specifications.AnyOfSpecification).to.equal(true);
      let isFirstSuccessfulRequest = Map({
        subject: Map({
          isAdmin: true, // will pass in the anyOf
          age: 18, // will pass in the allOf
          email: 'example@example.com' // will pass in the allOf
        })
      });
      expect(specification.isSatisfiedBy(isFirstSuccessfulRequest)).to.equal(true);
      let isSecondSuccessfulRequest = Map({
        subject: Map({
          isAdmin: false, // will fail in the anyOf
          age: 18, // will pass in the allOf
          email: 'example@example.com' // will pass in the allOf
        })
      });
      expect(specification.isSatisfiedBy(isSecondSuccessfulRequest)).to.equal(true);
      let isNotSuccessfulRequest = Map({
        subject: Map({
          isAdmin: false, // will fail in the anyOf
          age: 17, // will fail in the allOff which will also fail in the anyOf
          email: 'example@example.com'
        })
      });
      expect(specification.isSatisfiedBy(isNotSuccessfulRequest)).to.equal(false);
    });
    it('creates compound specification with isEqual specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isEqual: {
            attribute: 'subject.email',
            expected: 'example@example.com',
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsEqualSpecification).to.equal(true);
    });
    it('creates compound specification with isNotEqual than specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isNotEqual: {
            attribute: 'subject.age',
            expected: 18,
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsNotEqualSpecification).to.equal(true);
    });
    it('creates compound specification with isGreaterThanOrEqual specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isGreaterThanOrEqual: {
            attribute: 'subject.age',
            expected: 18,
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsGreaterThanOrEqualSpecification).to.equal(true);
    });
    it('creates compound specification with isGreaterThan specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isGreaterThan: {
            attribute: 'subject.age',
            expected: 18,
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsGreaterThanSpecification).to.equal(true);
    });
    it('creates compound specification with isLessThanOrEqual specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isLessThanOrEqual: {
            attribute: 'subject.age',
            expected: 18,
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsLessThanOrEqualSpecification).to.equal(true);
    });
    it('creates compound specification with isLessThan specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isLessThan: {
            attribute: 'subject.age',
            expected: 18,
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsLessThanSpecification).to.equal(true);
    });
    it('creates compound specification with isIncluded specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isIncluded: {
            attribute: 'subject.role',
            expected: ['owner', 'chef', 'chief-bottlewasher']
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsIncludedSpecification).to.equal(true);
    });
    it('creates compound specification with isNotIncluded than specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isNotIncluded: {
            attribute: 'subject.role',
            expected: ['owner', 'chef', 'chief-bottlewasher']
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsNotIncludedSpecification).to.equal(true);
    });
    it('creates compound specification with isPresent specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isPresent: {
            attribute: 'subject.role'
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsPresentSpecification).to.equal(true);
    });
    it('creates compound specification with isNotPresent specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isNotPresent: {
            attribute: 'subject.role'
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsNotPresentSpecification).to.equal(true);
    });
    it('creates compound specification with isTrue specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isTrue: {
            attribute: 'subject.role'
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsTrueSpecification).to.equal(true);
    });
    it('creates compound specification with isNotTrue specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isNotTrue: {
            attribute: 'subject.role'
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsNotTrueSpecification).to.equal(true);
    });
    it('creates compound specification with isNull specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isNull: {
            attribute: 'subject.role'
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsNullSpecification).to.equal(true);
    });
    it('creates compound specification with isNotNull specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isNotNull: {
            attribute: 'subject.role'
          }
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.IsNotNullSpecification).to.equal(true);
    });
    it('creates compound specification with anyOf specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          anyOf: [
            {
              isPresent: {
                attribute: 'subject.role'
              }
            },
            {
              isTrue: {
                attribute: 'subject.isAdmin'
              }
            }
          ]
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.AnyOfSpecification).to.equal(true);
      expect(compoundSpecification[0][0] instanceof specifications.IsPresentSpecification).to.equal(true);
      expect(compoundSpecification[0][1] instanceof specifications.IsTrueSpecification).to.equal(true);
    });
    it('creates compound specification with allOf specification', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          allOf: [
            {
              isPresent: {
                attribute: 'subject.role'
              }
            },
            {
              isTrue: {
                attribute: 'subject.isAdmin'
              }
            }
          ]
        }
      ];
      let compoundSpecification = sut.create(plainObjectSpecification);
      expect(compoundSpecification[0] instanceof specifications.AllOfSpecification).to.equal(true);
      expect(compoundSpecification[0][0] instanceof specifications.IsPresentSpecification).to.equal(true);
      expect(compoundSpecification[0][1] instanceof specifications.IsTrueSpecification).to.equal(true);
    });
    it('throws a TypeError if the allOf property is not an array', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          allOf: {
            isPresent: {
              attribute: 'subject.role'
            }
          }
        }
      ];
      let isTypeError = false;
      try {
        let compoundSpecification = sut.create(plainObjectSpecification);
      } catch (error) {
        isTypeError = (error instanceof TypeError);
      }
      expect(isTypeError).to.equal(true);
    });
    it('throws a TypeError if the anyOf property is not an array', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          anyOf: {
            isPresent: {
              attribute: 'subject.role'
            }
          }
        }
      ];
      let isTypeError = false;
      try {
        let compoundSpecification = sut.create(plainObjectSpecification);
      } catch (error) {
        isTypeError = (error instanceof TypeError);
      }
      expect(isTypeError).to.equal(true);
    });
    it('throw an Error if the specification name is not recognised', () => {
      let sut = new SpecificationFactory();
      let plainObjectSpecification = [
        {
          isMadeUpSpecType: {
            attribute: 'subject.role'
          }
        }
      ];
      let isError = false;
      try {
        let compoundSpecification = sut.create(plainObjectSpecification);
      } catch (error) {
        isError = (error instanceof Error);
      }
      expect(isError).to.equal(true);
    });
  });
});
