'use strict';
var Policy = require('./policy');
module.exports = (function () {
    function PolicySet() {
        this._policies = [];
    }
    PolicySet.prototype.addPolicy = function (policy, resourceParameters) {
        if (!policy instanceof Policy) {
            throw new TypeError('policy must be of type Policy');
        }
        this._policies.push({
            policy: policy,
            resourceParameters: resourceParameters
        });
    };
    Object.defineProperty(PolicySet.prototype, "policies", {
        get: function () {
            return this._policies;
        },
        enumerable: true,
        configurable: true
    });
    return PolicySet;
}());
