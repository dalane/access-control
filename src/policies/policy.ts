import {fromJS} from 'immutable';
import {Rule} from './rule';
import {Resource} from './resource';
import {AccessRequest} from 'access-request/access-request';

export class Policy {
  private _id;
  private _name;
  private _description;
  private _effect;
  private _action;
  private _principal;
  private _resource: Resource;
  private _rule;
  private _obligation;
  private _permittedActions;
  private _permittedEffects;
  constructor(id, name, description, effect, action, principal = null, resource: Resource, rule: Rule = null, obligation = null) {
    this._permittedActions = ['create', 'update', 'delete', 'find', '*'];
    this._permittedEffects = ['allow', 'deny'];
    if (!this._permittedEffects.includes(effect.toLowerCase())) {
      throw new Error('Invalid value for effect, expected "Allow" or "Deny"');
    }
    if (!this._permittedActions.includes(action.toLowerCase())) {
      throw new Error('Invalid option for action');
    }
    this._id = id,
    this._name = name;
    this._description = description,
    this._effect = effect;
    this._action = action;
    this._principal = principal;
    this._resource = resource;
    this._rule = rule;
    this._obligation = obligation;
  }
  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  get description() {
    return this._description;
  }
  get effect() {
    return this._effect;
  }
  get action() {
    return this._action;
  }
  get principal() {
    return this._principal;
  }
  get resource() {
    return this._resource;
  }
  get rule() {
    return this._rule;
  }
  get obligation() {
    return this._obligation;
  }
  /**
   * Compares the access request against the rule specification but first checks 
   * the url for any named or wildcard parameters...
   * e.g the policy resource '/users/:id/* matched against the request uri of 
   * '/users/1234/relationships will append to the access request:
   * 
   * resource: {
   *  pathMatch: {
   *    id: '1234', // for the named parameter
   *    _: 'relationships // for the wildcard
   *  }
   * }
   * 
   * and then pass the new access request to the rule to be validated.
   * 
   * This can then be access as an an attribute 'resource.pathMatch.id' or a 
   * lookup ${resource.pathMatch.id}
   * 
   * @param {AccessRequest} accessRequest 
   */
  isSatisfiedBy(accessRequest: AccessRequest) {
    if (this._rule === null) {
      return true;
    }
    let uri = accessRequest.getIn('resource.uri'.split('.'));
    // rematch the access request resource uri to the resource so that we can
    // get any named or wildcard parameters from the resource uri that might form part of the policy
    // and create a new access request by merging the resource parameters with the access request
    let mergedRequest = accessRequest.merge(fromJS({
      resource: {
        params: this._resource.match(uri)
      }
    }));
    // check if the access request passes the policy rule...
    return this._rule.isSatisfiedBy(mergedRequest);
  }
};
