'use strict';

const {Rule} = require('../../../build/policies/rule');
const {AnyOfSpecification, IsEqualSpecification, IsTrueSpecification} = require('../../../build/policies/specifications');
const {expect} = require('chai');
const td = require('testdouble');
const {AccessRequestMock} = require('../helpers');
const {fromJS} = require('immutable');

describe('rule object', () => {
  it('requires an anyOf or allOf specification in the constructor', () => {
    let result;
    try {
      let sut = new Rule.default();
    } catch (error) {
      result = error.name;
    }
    expect(result).to.equal('TypeError');
  });
  it('creates a rule without errors', () => {
    let didFail = false;
    let anyOfSpecification = new AnyOfSpecification();
    try {
      let sut = new Rule(anyOfSpecification);
    } catch (error) {
      didFail = true;
    }
    expect(didFail).to.equal(false);
  });
  it('populates a list of attributes required for the specifications to work', () => {
    let anyOfSpecification = new AnyOfSpecification();
    anyOfSpecification.push(new IsEqualSpecification('test.value', 'test-expect'));
    anyOfSpecification.push(new IsEqualSpecification('test.text', '${expect.lookup}'));
    anyOfSpecification.push(new IsTrueSpecification('test.isAdmin'));
    let didFail = false;
    let sut;
    try {
      sut = new Rule(anyOfSpecification);
    } catch (error) {
      didFail = true;
    }
    if (!didFail) {
      expect(sut.attributes.length).to.equal(4);
      expect(sut.attributes.indexOf('test.value')).not.to.equal(-1);
      expect(sut.attributes.indexOf('test.text')).not.to.equal(-1);
      expect(sut.attributes.indexOf('expect.lookup')).not.to.equal(-1);
      expect(sut.attributes.indexOf('test.isAdmin')).not.to.equal(-1);
    } else {
      expect(didFail).to.equal(false);
    }
  });
  it('Returns an isSatisfied true response', () => {
    let anyOfSpecification = new AnyOfSpecification();
    anyOfSpecification.push(new IsEqualSpecification('test.value', 'test-expect'));
    let sut = new Rule(anyOfSpecification);
    let accessRequest = new AccessRequestMock(fromJS({
      test: {
        value: 'test-expect'
      }
    }));
    expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
  });
  it('Returns an isSatisfied false response', () => {
    let anyOfSpecification = new AnyOfSpecification();
    anyOfSpecification.push(new IsEqualSpecification('test.value', 'test-expect'));
    let sut = new Rule(anyOfSpecification);
    let accessRequest = new AccessRequestMock(fromJS({
      test: {
        value: 'no-match'
      }
    }));
    expect(sut.isSatisfiedBy(accessRequest)).to.equal(false);
  });
});
