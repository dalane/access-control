import {Policy} from './policy';

export class PolicySet extends Array<Policy> {
  add(policy) {
    this.push(policy);
  }
};
