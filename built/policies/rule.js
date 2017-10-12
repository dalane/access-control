'use strict';
var _a = require('./specifications'), AbstractLogicSpecification = _a.AbstractLogicSpecification, AnyOfSpecification = _a.AnyOfSpecification, AllOfSpecification = _a.AllOfSpecification;
var List = require('immutable').List;
module.exports = (function () {
    function class_1(specification) {
        if (!Array.isArray(specification)) {
            // if (specification === undefined || !specification instanceof AbstractLogicSpecification) {
            throw new TypeError('The parameter specification is required to be an instance of AbstractSpecification');
        }
        this._specification = specification;
        this._attributeList = [];
        this._buildListOfRuleAttributes(specification, this._attributeList);
    }
    Object.defineProperty(class_1.prototype, "attributes", {
        get: function () {
            return this._attributeList;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_1.prototype, "specification", {
        get: function () {
            return this._specification;
        },
        enumerable: true,
        configurable: true
    });
    class_1.prototype.isSatisfiedBy = function (accessRequest) {
        return this._specification.isSatisfiedBy(accessRequest);
    };
    class_1.prototype._buildListOfRuleAttributes = function (specification, attributeList) {
        var _this = this;
        // build up list of the rule's required attributes in order to determine if
        // the rule is satisfied correctly...
        // some specifications don't require an expected value, i.e. isTrue, isNull, etc
        // so only check expected if it's not null...
        // if (specification instanceof AbstractLogicSpecification) {
        if (Array.isArray(specification)) {
            specification.forEach(function (specification0) {
                _this._buildListOfRuleAttributes(specification0, attributeList);
            });
        }
        else {
            this._addSpecificationAttributesToList(specification, attributeList);
        }
    };
    class_1.prototype._addSpecificationAttributesToList = function (specification, attributeList) {
        var attribute = specification.attribute;
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
    };
    class_1.prototype._addExpectedAttributeToList = function (specification, attributeList) {
        var attribute = specification.expectedAttribute;
        // only add the attribute to the list if it doesn't already exist...
        if (attributeList.indexOf(attribute) === -1) {
            attributeList.push(attribute);
        }
    };
    return class_1;
}());
