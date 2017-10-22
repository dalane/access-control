import {PolicyFactory} from './policies/policy-factory';
import {PolicySet} from './policies/policy-set';
import {Policy} from 'policies/policy';
import {RepositoryInterface} from './repository/RepositoryInterface';

export class PolicyRetrievalPoint {
  private _repository;
  private _policyFactory: PolicyFactory;
  private _cache;
  private _useCache;
  constructor(repository: RepositoryInterface, policyFactory: PolicyFactory, useCache: Boolean = true) {
    this._repository = repository;
    this._policyFactory = policyFactory;
    this._cache = [];
    this._useCache = useCache;
  }
  /**
   * Returns a PolicySet containing policies that match the query
   * @param  {Object} query [description]
   * @return {PolicySet}       [description]
   */
  async find(query): Promise<PolicySet> {
    let records;
    if (this._useCache) {
      records = this._cache;
    } else {
      records = await this._findAll();
    }
    let policySet = new PolicySet();
    // iterate through policies and filter for policies that match the query...
    records.forEach(policy => {
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
  /**
   * Clears the cache and recaches all policies from the repository
   * @return {Promise} A promise that resolves when completed
   */
  async refresh(): Promise<void> {
    this._cache = await this._findAll();
    return;
    // return this._repository.findAll().then(payload => {
    //   // create the policy object for each record and reset the cache
    //   this._cache = payload.map(record => {
    //     return this._policyFactory.create(record);
    //   });
    //   return true;
    // });
  }
  private _findAll(): Promise<Array<object>> {
    return this._repository.findAll().then(payload => {
      return payload.map(record => this._policyFactory.create(record));
    });
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
