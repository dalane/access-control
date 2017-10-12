import {PolicyFactory} from './policies/policy-factory';
import {PolicySet} from './policies/policy-set';

export default class PolicyRetrievalPoint {
  private _repository;
  private _policyFactory;
  private _cache;
  constructor(repository, policyFactory) {
    this._repository = repository;
    this._policyFactory = policyFactory;
    this._cache = [];
  }
  /**
   * Returns a PolicySet containing policies that match the query
   * @param  {Object} query [description]
   * @return {PolicySet}       [description]
   */
  retrievePolicySet(query) {
    let policySet = new PolicySet();
    // iterate through policies and filter for policies that match the query...
    this._cache.forEach(policy => {
      // - does the query.action.method match?
      // - does the query.resource.path match?
      let match = this.isMatch(policy, query.action, query.resource, query.principal);
      // push any matching policies into the policySet
      if (match !== null) policySet.add(policy, match);
    });
    // return the policy set
    return policySet;
  }
  /**
   * Clears the cache and recaches all policies from the repository
   * @return {Promise} A promise that resolves when completed
   */
  refresh() {
    if (!this._repository.isConnected) {
      throw new Error('Repository is not connected');
    }
    return this._repository.findAll().then(payload => {
      // create the policy object for each record and reset the cache
      this._cache = payload.map(record => {
        return this._policyFactory.createFromRepository(record);
      });
      return true;
    });
  }
  isMatch(policy, queryAction, queryResource, queryPrincipal) {
    let isActionMatch = (policy.action = '*' || policy.permittedActions.includes(queryAction));
    if (isActionMatch) {
      return (policy.resource.isMatch(queryResource) !== null);
    } else {
      return false;
    }
  }
}
