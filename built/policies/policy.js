'use strict';
var List = require('immutable').List;
module.exports = (function () {
    function class_1(id, name, description, effect, action, principal, resource, rule, obligation) {
        _super.call(this);
        this.id = id,
            this.name = name;
        this.description = description,
            this.effect = effect;
        this.action = action;
        this.principal = principal;
        this.resource = resource;
        this.rule = rule;
        this.obligation = obligation;
        this._permittedActions = ['Create', 'Update', 'Delete', 'Find', '*'];
        this._permittedEffects = ['Allow', 'Deny'];
        this._attributes = List();
        this._setAttributes(specification, this._attributes);
    }
    Object.defineProperty(class_1.prototype, "id", {
        get: function () {
            return this._id;
        },
        set: function (value) {
            this._id = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_1.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_1.prototype, "description", {
        get: function () {
            return this._description;
        },
        set: function (value) {
            this._description = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_1.prototype, "effect", {
        get: function () {
            return this._effect;
        },
        set: function (value) {
            if (!this._permittedEffects.includes(value)) {
                throw new Error('Invalid value for effect, expected "Allow" or "Deny"');
            }
            this._effect = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_1.prototype, "action", {
        get: function () {
            return this._action;
        },
        set: function (value) {
            if (!this._permittedActions.includes(value)) {
                throw new Error('Invalid option for action');
            }
            this._action = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_1.prototype, "principal", {
        get: function () {
            return this._principal;
        },
        set: function (value) {
            this._principal = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_1.prototype, "resource", {
        get: function () {
            return this._resource;
        },
        set: function (value) {
            if (!value instanceof Resource) {
                throw new TypeError('a resource must be an instance of Resource');
            }
            this._resource = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_1.prototype, "rule", {
        get: function () {
            return this._rule;
        },
        set: function (value) {
            if (!value instanceof Rule) {
                throw new Typerror('a rule must be an instance of Rule');
            }
            this._rule = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_1.prototype, "obligation", {
        get: function () {
            return this._obligation;
        },
        set: function (value) {
            this._obligation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_1.prototype, "permittedActions", {
        get: function () {
            return this._permittedActions;
        },
        enumerable: true,
        configurable: true
    });
    class_1.prototype.isSatisfiedBy = function (accessRequest) {
        var isActionMatch = (this.action = '*' || this.permittedActions.includes(queryAction));
        if (isActionMatch) {
            // TODO check for the principal first, don't need rules for a principal
            // rematch the access request resource uri to the resource so that we can
            // get the parameters
            var uriMatch = this._resource.isMatch(accessRequest.resource.uri);
            // if uriMatch is null then the resource uri in the request did not match
            // the resource uri of the policy. This should already have been filtered
            // for but checking again just in case
            if (uriMatch === null)
                return true;
            // make an immutable copy of the access request
            var request = JSON.parse(JSON.stringify(accessRequest));
            // add the uri parameters to the request
            request.resource.params = uriMatch;
            // check if the access request passes the policy rule...
            return this._rule.isSatisfiedBy(accessRequest);
        }
        else {
            return true;
        }
    };
    Object.defineProperty(class_1.prototype, "attributes", {
        get: function () {
            return this._attributes;
        },
        enumerable: true,
        configurable: true
    });
    class_1.prototype._setAttributes = function (specification, attributes) {
        var _this = this;
        if (specification instanceof specifications.AnyOfSpecification || specification instanceof specifications.AllOfSpecification) {
            specification.specifications.forEach(function (specification0) {
                _this._setAttributes(specification0, attributes);
            });
        }
        else {
            // get the path of the attribute that the specification will require an actual value for
            var attribute0 = specification.attribute;
            // if that path is not already in the collection then add it to the attributes collection
            if (!attributes.includes(attribute0))
                attributes.push(attribute0);
            // check the options to see if the expectedValue is to be found on another attribute rather than a pre-set value
            if (specification.options && specification.options.valueIsAttribute) {
                // if the option valueIsAttribute is true then the attribute to check against is specified in as the value
                var valueAttributePath = specification.value;
                if (!attributes.includes(valueAttributePath))
                    attributes.push(valueAttributePath);
            }
        }
    };
    return class_1;
}());
