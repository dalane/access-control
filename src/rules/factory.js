'use strict';

const specifications = require('./specifications');

module.exports = class {
  create(plainObjectRules) {
    // if no rules are specified then we don't need to create rules
    // rules are optional as the combination of effect, action, principal and resource
    // can be sufficient to make a decision
    if (!plainObjectRules) {
      return new specifications.NullSpecification();
    }
    if (!Array.isArray(plainObjectRules)) {
      throw new TypeError('Policy rules must be an array containing rules');
    }
    if (plainObjectRules.length === 0) {
      return new specifications.NullSpecification();
    }
    return this._createAnyOfSpec(plainObjectRules);
    // the base array of rules is anyOf specification
    return plainObjectRules.reduce((anyOfSpecification, rule) => {
      anyOfSpecification.add(this._createSpecification(rule));
      return anyOfSpecification;
    }, new specifications.AnyOfSpecification());
  }
  _createSpecification(plainObjectRule) {
    let specProperties = Object.getOwnPropertyNames(plainObjectRule);
    if (specProperties.length === 0) {
      throw new Error('No specification found');
    }
    if (specProperties.length > 1) {
      throw new Error('Only one specification can exist in object');
    }
    let type = specProperties[0];
    switch (type) {
      case 'allOf':
        return this._createAllOfSpec(plainObjectRule[type]);
      case 'anyOf':
        return this._createAnyOfSpec(plainObjectRule[type]);
      case 'isEqual':
        return new specifications.IsEqualSpecification(plainObjectRule[type].attribute, plainObjectRule[type].value);
      case 'isGreaterThanOrEqual':
        return new specifications.IsGreaterThanOrEqualSpecification(plainObjectRule[type].attribute, plainObjectRule[type].value);
      case 'isGreaterThan':
        return new specifications.IsGreaterThanSpecification(plainObjectRule[type].attribute, plainObjectRule[type].value);
      case 'isIncluded':
        return new specifications.IsIncludedSpecification(plainObjectRule[type].attribute, plainObjectRule[type].value);
      case 'isLessThanOrEqual':
        return new specifications.IsLessThanOrEqualSpecification(plainObjectRule[type].attribute, plainObjectRule[type].value);
      case 'isLessThan':
        return new specifications.IsLessThanSpecification(plainObjectRule[type].attribute, plainObjectRule[type].value);
      case 'isNotEqual':
        return new specifications.IsNotEqualSpecification(plainObjectRule[type].attribute, plainObjectRule[type].value);
      case 'isNotIncluded':
        return new specifications.IsNotIncludedSpecification(plainObjectRule[type].attribute, plainObjectRule[type].value);
      case 'isNotNull':
        return new specifications.IsNotNullSpecification(plainObjectRule[type].attribute);
      case 'isNotPresent':
        return new specifications.IsNotPresentSpecification(plainObjectRule[type].attribute);
      case 'isNotTrue':
        return new specifications.IsNotTrueSpecification(plainObjectRule[type].attribute);
      case 'isNull':
        return new specifications.IsNullSpecification(plainObjectRule[type].attribute);
      case 'isPresent':
        return new specifications.IsPresentSpecification(plainObjectRule[type].attribute);
      case 'isTrue':
        return new specifications.IsTrueSpecification(plainObjectRule[type].attribute);
      default:
        throw new Error('Specification type is not recognised');
    }
  }
  _createAllOfSpec(array) {
    if (!Array.isArray(array)) {
      throw new TypeError('allOfSpec must be an array');
    }
    return array.reduce((allOfSpecification, plainObjectRule) => {
      allOfSpecification.add(this._createSpecification(plainObjectRule));
      return allOfSpecification;
    }, new specifications.AllOfSpecification());
  }
  _createAnyOfSpec(array) {
    if (!Array.isArray(array)) {
      throw new TypeError('anyOfSpec must be an array');
    }
    return array.reduce((allOfSpecification, plainObjectRule) => {
      allOfSpecification.add(this._createSpecification(plainObjectRule));
      return allOfSpecification;
    }, new specifications.AnyOfSpecification());
  }
}
