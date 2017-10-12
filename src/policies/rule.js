'use strict';

const {AbstractLogicSpecification, AnyOfSpecification, AllOfSpecification} = require('./specifications');
const {List} = require('immutable');

module.exports = class {
  constructor(specification) {
    if (!Array.isArray(specification)) {
    // if (specification === undefined || !specification instanceof AbstractLogicSpecification) {
      throw new TypeError('The parameter specification is required to be an instance of AbstractSpecification');
    }
    this._specification = specification;
    this._attributeList = [];
    this._buildListOfRuleAttributes(specification, this._attributeList);
  }
  get attributes() {
    return this._attributeList;
  }
  get specification() {
    return this._specification;
  }
  isSatisfiedBy(accessRequest) {
    return this._specification.isSatisfiedBy(accessRequest);
  }
  _buildListOfRuleAttributes(specification, attributeList) {
    // build up list of the rule's required attributes in order to determine if
    // the rule is satisfied correctly...
    // some specifications don't require an expected value, i.e. isTrue, isNull, etc
    // so only check expected if it's not null...
    // if (specification instanceof AbstractLogicSpecification) {
    if (Array.isArray(specification)) {
      specification.forEach(specification0 => {
        this._buildListOfRuleAttributes(specification0, attributeList);
      });
    } else {
      this._addSpecificationAttributesToList(specification, attributeList);
    }
  }
  _addSpecificationAttributesToList(specification, attributeList) {
    let attribute = specification.attribute;
    // only add the attribute to the list if it doesn't already exist...
    if (attributeList.indexOf(attribute) === -1) {
      attributeList.push(attribute);
    }
    // some specifications don't have an expected value, i.e. isTrue...
    if (specification.expected === null) {
      return;
    }
    // expectedIsAttribute tells us if the expected value is a lookup instead of a value
    if (specification.expectedIsAttribute) {
      this._addExpectedAttributeToList(specification, attributeList);
    }
  }
  _addExpectedAttributeToList(specification, attributeList) {
    let attribute = specification.expectedAttribute;
    // only add the attribute to the list if it doesn't already exist...
    if (attributeList.indexOf(attribute) === -1) {
      attributeList.push(attribute);
    }
  }
}
