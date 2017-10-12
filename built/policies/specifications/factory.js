'use strict';
var specifications = require('./');
module.exports = (function () {
    function class_1() {
    }
    class_1.prototype.create = function (plainObjectRule) {
        // if no rules are specified then we don't need to create rules
        // rules are optional as the combination of effect, action, principal and resource
        // can be sufficient to make a decision
        if (!plainObjectRule) {
            return this.createAnyOfSpec([]);
        }
        if (!Array.isArray(plainObjectRule)) {
            throw new TypeError('Policy rules must be an array containing rules');
        }
        return this.createAnyOfSpec(plainObjectRule);
    };
    class_1.prototype.createAllOfSpec = function (array) {
        var _this = this;
        if (!Array.isArray(array)) {
            throw new TypeError('allOfSpec must be an array');
        }
        return array.reduce(function (allOfSpecification, plainObjectSpecification) {
            allOfSpecification.push(_this._createSpecification(plainObjectSpecification));
            return allOfSpecification;
        }, new specifications.AllOfSpecification());
    };
    class_1.prototype.createAnyOfSpec = function (array) {
        var _this = this;
        if (!Array.isArray(array)) {
            throw new TypeError('anyOfSpec must be an array');
        }
        return array.reduce(function (allOfSpecification, plainObjectSpecification) {
            allOfSpecification.push(_this._createSpecification(plainObjectSpecification));
            return allOfSpecification;
        }, new specifications.AnyOfSpecification());
    };
    class_1.prototype.createIsEqualSpecification = function (attribute, expected, options) {
        return new specifications.IsEqualSpecification(attribute, expected, options);
    };
    class_1.prototype.createIsGreaterThanOrEqualSpecification = function (attribute, expected, options) {
        return new specifications.IsGreaterThanOrEqualSpecification(attribute, expected, options);
    };
    class_1.prototype.createIsGreaterThanSpecification = function (attribute, expected, options) {
        return new specifications.IsGreaterThanSpecification(attribute, expected, options);
    };
    class_1.prototype.createIsIncludedSpecification = function (attribute, expected, options) {
        return new specifications.IsIncludedSpecification(attribute, expected, options);
    };
    class_1.prototype.createIsLessThanOrEqualSpecification = function (attribute, expected, options) {
        return new specifications.IsLessThanOrEqualSpecification(attribute, expected, options);
    };
    class_1.prototype.createIsLessThanSpecification = function (attribute, expected, options) {
        return new specifications.IsLessThanSpecification(attribute, expected, options);
    };
    class_1.prototype.createIsNotEqualSpecification = function (attribute, expected, options) {
        return new specifications.IsNotEqualSpecification(attribute, expected, options);
    };
    class_1.prototype.createIsNotIncludedSpecification = function (attribute, expected, options) {
        return new specifications.IsNotIncludedSpecification(attribute, expected, options);
    };
    class_1.prototype.createIsNotNullSpecification = function (attribute, options) {
        return new specifications.IsNotNullSpecification(attribute, options);
    };
    class_1.prototype.createIsNotPresentSpecification = function (attribute, options) {
        return new specifications.IsNotPresentSpecification(attribute, options);
    };
    class_1.prototype.createIsNotTrueSpecification = function (attribute, options) {
        return new specifications.IsNotTrueSpecification(attribute, options);
    };
    class_1.prototype.createIsNullSpecification = function (attribute, options) {
        return new specifications.IsNullSpecification(attribute, options);
    };
    class_1.prototype.createIsPresentSpecification = function (attribute, options) {
        return new specifications.IsPresentSpecification(attribute, options);
    };
    class_1.prototype.createIsTrueSpecification = function (attribute, options) {
        return new specifications.IsTrueSpecification(attribute, options);
    };
    class_1.prototype._createSpecification = function (plainObjectSpecification) {
        var specProperties = Object.getOwnPropertyNames(plainObjectSpecification);
        if (specProperties.length === 0) {
            throw new Error('No specification found');
        }
        if (specProperties.length > 1) {
            throw new Error('Only one specification can exist in object');
        }
        var type = specProperties[0];
        var properties = plainObjectSpecification[type];
        switch (type) {
            case 'allOf':
                return this.createAllOfSpec(properties);
            case 'anyOf':
                return this.createAnyOfSpec(properties);
            case 'isEqual':
                return this.createIsEqualSpecification(properties.attribute, properties.expected, properties.options);
            case 'isGreaterThanOrEqual':
                return this.createIsGreaterThanOrEqualSpecification(properties.attribute, properties.expected, properties.options);
            case 'isGreaterThan':
                return this.createIsGreaterThanSpecification(properties.attribute, properties.expected, properties.options);
            case 'isIncluded':
                return this.createIsIncludedSpecification(properties.attribute, properties.expected, properties.options);
            case 'isLessThanOrEqual':
                return this.createIsLessThanOrEqualSpecification(properties.attribute, properties.expected, properties.options);
            case 'isLessThan':
                return this.createIsLessThanSpecification(properties.attribute, properties.expected, properties.options);
            case 'isNotEqual':
                return this.createIsNotEqualSpecification(properties.attribute, properties.expected, properties.options);
            case 'isNotIncluded':
                return this.createIsNotIncludedSpecification(properties.attribute, properties.expected, properties.options);
            case 'isNotNull':
                return this.createIsNotNullSpecification(properties.attribute, properties.options);
            case 'isNotPresent':
                return this.createIsNotPresentSpecification(properties.attribute, properties.options);
            case 'isNotTrue':
                return this.createIsNotTrueSpecification(properties.attribute, properties.options);
            case 'isNull':
                return this.createIsNullSpecification(properties.attribute, properties.options);
            case 'isPresent':
                return this.createIsPresentSpecification(properties.attribute, properties.options);
            case 'isTrue':
                return this.createIsTrueSpecification(properties.attribute, properties.options);
            default:
                throw new Error('Specification type is not recognised');
        }
    };
    return class_1;
}());
