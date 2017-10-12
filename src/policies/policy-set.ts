import {Policy} from './policy';

export class PolicySet extends Array {
  add(policy, resourceParameters) {
    this.push({
      policy: policy,
      resourceParameters: resourceParameters
    });
  }
};
