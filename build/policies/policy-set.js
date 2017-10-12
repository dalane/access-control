"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PolicySet extends Array {
    add(policy, resourceParameters) {
        this.push({
            policy: policy,
            resourceParameters: resourceParameters
        });
    }
}
exports.PolicySet = PolicySet;
;
