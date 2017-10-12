"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const specifications = require("./specifications");
class Policy {
    constructor(id, name, description, effect, action, principal, resource, rule, obligation) {
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
    }
    set id(value) {
        this._id = value;
    }
    get id() {
        return this._id;
    }
    set name(value) {
        this._name = value;
    }
    get name() {
        return this._name;
    }
    set description(value) {
        this._description = value;
    }
    get description() {
        return this._description;
    }
    set effect(value) {
        if (!this._permittedEffects.includes(value)) {
            throw new Error('Invalid value for effect, expected "Allow" or "Deny"');
        }
        this._effect = value;
    }
    get effect() {
        return this._effect;
    }
    set action(value) {
        if (!this._permittedActions.includes(value)) {
            throw new Error('Invalid option for action');
        }
        this._action = value;
    }
    get action() {
        return this._action;
    }
    set principal(value) {
        this._principal = value;
    }
    get principal() {
        return this._principal;
    }
    set resource(value) {
        this._resource = value;
    }
    get resource() {
        return this._resource;
    }
    set rule(value) {
        this._rule = value;
    }
    get rule() {
        return this._rule;
    }
    set obligation(value) {
        this._obligation = value;
    }
    get obligation() {
        return this._obligation;
    }
    get permittedActions() {
        return this._permittedActions;
    }
    isSatisfiedBy(accessRequest) {
        let isActionMatch = (this.action = '*' || this.permittedActions.includes(accessRequest.action.method));
        if (isActionMatch) {
            // TODO check for the principal first, don't need rules for a principal
            // rematch the access request resource uri to the resource so that we can
            // get the parameters
            let uriMatch = this._resource.isMatch(accessRequest.resource.uri);
            // if uriMatch is null then the resource uri in the request did not match
            // the resource uri of the policy. This should already have been filtered
            // for but checking again just in case
            if (uriMatch === null)
                return true;
            // make an immutable copy of the access request
            let request = JSON.parse(JSON.stringify(accessRequest));
            // add the uri parameters to the request
            request.resource.params = uriMatch;
            // check if the access request passes the policy rule...
            return this._rule.isSatisfiedBy(accessRequest);
        }
        else {
            return true;
        }
    }
    get attributes() {
        return this._attributes;
    }
    _setAttributes(specification, attributes) {
        if (specification instanceof specifications.AnyOfSpecification || specification instanceof specifications.AllOfSpecification) {
            specification.forEach(specification0 => {
                this._setAttributes(specification0, attributes);
            });
        }
        else {
            // get the path of the attribute that the specification will require an actual value for
            let attribute0 = specification.attribute;
            // if that path is not already in the collection then add it to the attributes collection
            if (!attributes.includes(attribute0))
                attributes.push(attribute0);
            // check the options to see if the expectedValue is to be found on another attribute rather than a pre-set value
            if (specification.options && specification.options.valueIsAttribute) {
                // if the option valueIsAttribute is true then the attribute to check against is specified in as the value
                let valueAttributePath = specification.value;
                if (!attributes.includes(valueAttributePath))
                    attributes.push(valueAttributePath);
            }
        }
    }
}
exports.Policy = Policy;
;
