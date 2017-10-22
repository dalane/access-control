import {Policy} from './policies/policy';
import {PolicySet} from './policies/policy-set';

export class PolicyCache {
  private _cache: Array<Policy>;
  constructor() {
    this._cache = [];
  }
  update(policies: Array<Policy>) {
    this._cache = policies;
  }
  add(policy: Policy) {
    this._cache.push(policy);
  }
  find(query) {
    let policySet = new PolicySet();
    // iterate through policies and filter for policies that match the query...
    this._cache.forEach(policy => {
      // - does the query.action match?
      // - does the query.resource match?
      // - does the query.principal match?
      let match = this._isMatch(policy, query.action, query.resource, query.principal);
      // push any matching policies into the policySet
      if (match !== null) policySet.add(policy);
    });
    // return the policy set
    return policySet;
  }
  private _isMatch(policy:Policy, queryAction:string, queryResource:string, queryPrincipal:string) {
    return this._isActionMatch(policy, queryAction) && this._isPrincipalMatch(policy, queryPrincipal) && this._isResourceMatch(policy, queryResource);
  }
  /**
   * Returns true if the queried action matchs the policy's action
   * @param {Policy} policy 
   * @param {String} queryAction 
   * @return {Boolean}
   */
  private _isActionMatch(policy: Policy, queryAction): Boolean {
    // return true if the policy has an action of '*' or the policy's action 
    // equals the query action
    return (policy.action === '*' || policy.action === queryAction);
  }
  /**
   * Returns true if the queried principal matchs the policy's principal
   * @param {Policy} policy 
   * @param {String} queryResource 
   * @return {Boolean}
   */
  private _isPrincipalMatch(policy, queryPrincipal): Boolean {
    // is the principal null, apply to everyone '*' or the request subject?
    return (policy.principal === null || policy.principal === '*' || policy.principal === queryPrincipal);
  }
  /**
   * Returns true if the queried resource matchs the policy's resource
   * @param {Policy} policy 
   * @param {String} queryResource 
   * @return {Boolean}
   */
  private _isResourceMatch(policy: Policy, queryResource): Boolean {
    return (policy.resource.match(queryResource) !== null);
  }
}