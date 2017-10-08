'use strict';

const specifications = require('../../../src/rules/specifications');
const chai = require('chai');
const expect = chai.expect;

describe('specifications module', () => {
  describe('is-equal specification', () => {
    it('returns true if actual value equal expected value for a string', () => {
      let sut = new specifications.IsEqualSpecification('subject.email', 'example@example.com');
      let accessRequest = {
        subject: {
          email: 'example@example.com'
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value does not equal expected value for a string', () => {
      let sut = new specifications.IsEqualSpecification('subject.email', 'example@example.com');
      let accessRequest = {
        subject: {
          email: 'not-an-example@example.com'
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('is-not-equal specification', () => {
    it('returns false if actual value equal expected value for a string', () => {
      let sut = new specifications.IsNotEqualSpecification('subject.email', 'example@example.com');
      let accessRequest = {
        subject: {
          email: 'example@example.com'
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
    it('returns true if actual value does not equal expected value for a string', () => {
      let sut = new specifications.IsNotEqualSpecification('subject.email', 'example@example.com');
      let accessRequest = {
        subject: {
          email: 'not-an-example@example.com'
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
  });
  describe('is-greater-than-or-equal specification', () => {
    it('returns true if actual value greater than value', () => {
      let sut = new specifications.IsGreaterThanOrEqualSpecification('subject.age', 18);
      let accessRequest = {
        subject: {
          age: 20
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns true if actual value equal to value', () => {
      let sut = new specifications.IsGreaterThanOrEqualSpecification('subject.age', 18);
      let accessRequest = {
        subject: {
          age: 18
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value is not greater than or equal to expected value', () => {
      let sut = new specifications.IsGreaterThanOrEqualSpecification('subject.age', 18);
      let accessRequest = {
        subject: {
          age: 17
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('is-greater-than specification', () => {
    it('returns true if actual value greater than value', () => {
      let sut = new specifications.IsGreaterThanSpecification('subject.age', 18);
      let accessRequest = {
        subject: {
          age: 20
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value is not greater than expected value', () => {
      let sut = new specifications.IsGreaterThanSpecification('subject.age', 18);
      let accessRequest = {
        subject: {
          age: 18
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('is-less-than-or-equal specification', () => {
    it('returns true if actual value less than expected value', () => {
      let sut = new specifications.IsLessThanOrEqualSpecification('subject.age', 18);
      let accessRequest = {
        subject: {
          age: 17
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns true if actual value equal to expected value', () => {
      let sut = new specifications.IsLessThanOrEqualSpecification('subject.age', 18);
      let accessRequest = {
        subject: {
          age: 18
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value is not less than or equal to expected value', () => {
      let sut = new specifications.IsLessThanOrEqualSpecification('subject.age', 18);
      let accessRequest = {
        subject: {
          age: 19
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('is-less-than specification', () => {
    it('returns true if actual value less than expected value', () => {
      let sut = new specifications.IsLessThanSpecification('subject.age', 18);
      let accessRequest = {
        subject: {
          age: 17
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value is not less than expected value', () => {
      let sut = new specifications.IsLessThanSpecification('subject.age', 18);
      let accessRequest = {
        subject: {
          age: 18
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('is-included specification', () => {
    it('returns true if actual value is found in array of expected values', () => {
      let sut = new specifications.IsIncludedSpecification('subject.role', ['owner', 'cook', 'chief-bottlewasher']);
      let accessRequest = {
        subject: {
          role: 'chief-bottlewasher'
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value is not found in an array of expected values', () => {
      let sut = new specifications.IsIncludedSpecification('subject.role', ['owner', 'cook', 'chief-bottlewasher']);
      let accessRequest = {
        subject: {
          role: 'chef'
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('is-not-included specification', () => {
    it('returns true if actual value is not found in array of values', () => {
      let sut = new specifications.IsNotIncludedSpecification('subject.role', ['owner', 'cook', 'chief-bottlewasher']);
      let accessRequest = {
        subject: {
          role: 'chef'
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value is found in array of values', () => {
      let sut = new specifications.IsNotIncludedSpecification('subject.role', ['owner', 'cook', 'chief-bottlewasher']);
      let accessRequest = {
        subject: {
          role: 'chief-bottlewasher'
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('is-null specification', () => {
    it('returns true if actual value is null', () => {
      let sut = new specifications.IsNullSpecification('subject.role');
      let accessRequest = {
        subject: {
          role: null
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value is not null', () => {
      let sut = new specifications.IsNullSpecification('subject.role');
      let accessRequest = {
        subject: {
          role: 'chief-bottlewasher'
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('is-not-null specification', () => {
    it('returns true if actual value is not null', () => {
      let sut = new specifications.IsNotNullSpecification('subject.role');
      let accessRequest = {
        subject: {
          role: 'chief-bottlewasher'
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value is null', () => {
      let sut = new specifications.IsNotNullSpecification('subject.role');
      let accessRequest = {
        subject: {
          role: null
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('is-present specification', () => {
    it('returns true if actual value is present', () => {
      let sut = new specifications.IsPresentSpecification('subject.role');
      let accessRequest = {
        subject: {
          role: 'chief-bottlewasher'
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value is not present', () => {
      let sut = new specifications.IsPresentSpecification('subject.role');
      let accessRequest = {
        subject: {}
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('is-not-present specification', () => {
    it('returns true if actual value is not present', () => {
      let sut = new specifications.IsNotPresentSpecification('subject.role');
      let accessRequest = {
        subject: {
          // role: 'chief-bottlewasher' is not present
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value is present', () => {
      let sut = new specifications.IsNotPresentSpecification('subject.role');
      let accessRequest = {
        subject: {
          role: 'chief-bottlewasher'
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('is-true specification', () => {
    it('returns true if actual value is true', () => {
      let sut = new specifications.IsTrueSpecification('subject.isAdmin');
      let accessRequest = {
        subject: {
          isAdmin: true
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value is not true', () => {
      let sut = new specifications.IsTrueSpecification('subject.isAdmin');
      let accessRequest = {
        subject: {
          isAdmin: false
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('is-not-true specification', () => {
    it('returns true if actual value is not true', () => {
      let sut = new specifications.IsNotTrueSpecification('subject.isAdmin');
      let accessRequest = {
        subject: {
          isAdmin: false
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if actual value is true', () => {
      let sut = new specifications.IsNotTrueSpecification('subject.isAdmin');
      let accessRequest = {
        subject: {
          isAdmin: true
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('all-of specification', () => {
    it('returns true if all specifications in the collection return true', () => {
      let sut = new specifications.AllOfSpecification();
      sut.add(new specifications.IsEqualSpecification('subject.name', 'John Smith'));
      sut.add(new specifications.IsTrueSpecification('subject.isAdmin', true));
      let accessRequest = {
        subject: {
          name: 'John Smith',
          isAdmin: true
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false if at least one specification in the collection returns false', () => {
      let sut = new specifications.AllOfSpecification();
      sut.add(new specifications.IsEqualSpecification('subject.name', 'John Smith'));
      sut.add(new specifications.IsTrueSpecification('subject.isAdmin', true));
      let accessRequest = {
        subject: {
          name: 'John Smith',
          isAdmin: false
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
    });
  });
  describe('any-of specification', () => {
    it('returns true if at least one specification in the collection returns true', () => {
      let sut = new specifications.AnyOfSpecification();
      sut.add(new specifications.IsEqualSpecification('subject.name', 'John Smith'));
      sut.add(new specifications.IsTrueSpecification('subject.isAdmin', true));
      let accessRequest = {
        subject: {
          name: 'John Smith',
          isAdmin: false
        }
      };
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns false only if all specification in the collection returns false', () => {
      let sut = new specifications.AnyOfSpecification();
      sut.add(new specifications.IsEqualSpecification('subject.name', 'John Smith'));
      sut.add(new specifications.IsTrueSpecification('subject.isAdmin', true));
      let accessRequest = {
        subject: {
          name: 'Jill Smith',
          isAdmin: false
        }
      };
      expect(sut.isSatisfiedBy(accessRequest, true)).to.equal(false);
    });
  });
  describe('nested specifications', () => {
    it('returns true if all nested specifications are satisfied', () => {
      let anyOf_sut = new specifications.AnyOfSpecification();
      let allOf_sut = new specifications.AllOfSpecification();
      let isEqual_sut = new specifications.IsEqualSpecification('subject.name', 'John Smith');
      let isTrue_sut = new specifications.IsTrueSpecification('subject.isAdmin', true);
      let isGreaterThanOrEqual_sut = new specifications.IsGreaterThanOrEqualSpecification('subject.age', 18);
      // isTrue and isGreaterThanOrEqual are to return true, therefore allOf
      // should return true
      allOf_sut.add(isTrue_sut);
      allOf_sut.add(isGreaterThanOrEqual_sut);
      // allOf should return true but isEqual we will set to fail however as
      // the specification isAny it should still be satisfied
      anyOf_sut.add(allOf_sut);
      anyOf_sut.add(isEqual_sut);
      let request = {
        subject: {
          name: 'Jane Smith',
          age: 20,
          isAdmin: true
        }
      }
      expect(isEqual_sut.isSatisfiedBy(request)).to.equal(false);
      expect(isTrue_sut.isSatisfiedBy(request)).to.equal(true);
      expect(isGreaterThanOrEqual_sut.isSatisfiedBy(request)).to.equal(true);
      expect(allOf_sut.isSatisfiedBy(request)).to.equal(true);
      expect(anyOf_sut.isSatisfiedBy(request)).to.equal(true);
    });
    it('returns false if not all nested specifications are satisfied', () => {
      let anyOf_sut = new specifications.AnyOfSpecification();
      let allOf_sut = new specifications.AllOfSpecification();
      let isEqual_sut = new specifications.IsEqualSpecification('subject.name', 'John Smith');
      let isTrue_sut = new specifications.IsTrueSpecification('subject.isAdmin', true);
      let isGreaterThanOrEqual_sut = new specifications.IsGreaterThanOrEqualSpecification('subject.age', 18);
      // isTrue and isGreaterThanOrEqual are to return true, therefore allOf
      // should return true
      allOf_sut.add(isTrue_sut);
      allOf_sut.add(isGreaterThanOrEqual_sut);
      // allOf should return true but isEqual we will set to fail however as
      // the specification isAny it should still be satisfied
      anyOf_sut.add(allOf_sut);
      anyOf_sut.add(isEqual_sut);
      let request = {
        subject: {
          name: 'Jill Smith',
          age: 17,
          isAdmin: true
        }
      }
      expect(isEqual_sut.isSatisfiedBy(request)).to.equal(false);
      expect(isTrue_sut.isSatisfiedBy(request)).to.equal(true);
      expect(isGreaterThanOrEqual_sut.isSatisfiedBy(request)).to.equal(false);
      expect(allOf_sut.isSatisfiedBy(request)).to.equal(false);
      expect(anyOf_sut.isSatisfiedBy(request)).to.equal(false);
    });
  });
});
