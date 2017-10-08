'use strict';

const RuleFactory = require('../../../src/rules/factory');
const specifications = require('../../../src/rules/specifications');
const chai = require('chai');
const expect = chai.expect;

let policyJSON = `{
  "id": "1",
  "effect": "Deny",
  "action": "*",
  "principal": "user-id-one",
  "resource": "api/users/:userId/relationships/:relationship",
  "rules": [
    {
      "isTrue": {
        "attribute": "subject.isAdmin"
      }
    },
    {
      "allOf": [
        {
          "isEqual": {
            "attribute": "subject.email",
            "value": "example@example.com"
          }
        },
        {
          "isGreaterThanOrEqual": {
            "attribute": "subject.age",
            "value": 18
          }
        }
      ]
    }
  ],
  "obligations": []
}`;

describe('rules factory', () => {
  it('creates nested rules from plain object of rules in the correct format', () => {
    let sut = new RuleFactory();
    let plainObjectPolicy = JSON.parse(policyJSON);
    let rules = sut.create(plainObjectPolicy.rules);
    expect(rules instanceof specifications.AnyOfSpecification).to.equal(true);
    let isFirstSuccessfulRequest = {
      subject: {
        isAdmin: true, // will pass in the anyOf
        age: 18, // will pass in the allOf
        email: 'example@example.com' // will pass in the allOf
      }
    }
    expect(rules.isSatisfiedBy(isFirstSuccessfulRequest)).to.equal(true);
    let isSecondSuccessfulRequest = {
      subject: {
        isAdmin: false, // will fail in the anyOf
        age: 18, // will pass in the allOf
        email: 'example@example.com' // will pass in the allOf
      }
    }
    expect(rules.isSatisfiedBy(isSecondSuccessfulRequest)).to.equal(true);
    let isNotSuccessfulRequest = {
      subject: {
        isAdmin: false, // will fail in the anyOf
        age: 17, // will fail in the allOff which will also fail in the anyOf
        email: 'example@example.com'
      }
    }
    expect(rules.isSatisfiedBy(isNotSuccessfulRequest)).to.equal(false);
  });
  xit('creates isEqual rule');
  xit('creates isGreaterThanOrEqual rule');
  xit('creates isGreaterThan rule');
  xit('creates isIncluded rule');
  xit('creates isLessThanOrEqual rule');
  xit('creates isLessThan rule');
  xit('creates isNotEqual than rule');
  xit('creates isNotIncluded than rule');
  xit('creates isNotPresent rule');
  xit('creates isNotTrue rule');
  xit('creates isNull rule');
  xit('creates isPresent rule');
  xit('creates isTrue rule');
  xit('creates anyOf rule');
  xit('creates allOf rule');
  xit('throws a TypeError if the allOf property is not an array');
  xit('throws a TypeError if the anyOf property is not an array');
  xit('returns a null rule if not rules property is undefined');
  xit('returns a null rule if the rules property is an empty array');
  xit('throw a TypeError if the rules property is not null, not an array and is not an empty array');
});
