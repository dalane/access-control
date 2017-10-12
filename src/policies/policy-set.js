'use strict';

const Policy = require('./policy');

module.exports = class PolicySet {
  constructor() {
    this._policies = [];
  }
  addPolicy(policy, resourceParameters) {
    if (!policy instanceof Policy) {
      throw new TypeError('policy must be of type Policy');
    }
    this._policies.push({
      policy: policy,
      resourceParameters: resourceParameters
    });
  }
  get policies() {
    return this._policies;
  }
};
