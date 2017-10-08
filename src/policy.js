'use strict';

module.exports = class {
  constructor(id, effect, action, resource, rule) {
    this._id = id,
    this._effect = effect;
    this._action = action;
    this._resource = resource;
    this._rule = rule;
  }
  get id() {
    return this._id;
  }
  get effect() {
    return this._effect;
  }
  get action() {
    return this._action;
  }
  get resource() {
    return this._resource;
  }
  get rule() {
    return this._rule;
  }
};
