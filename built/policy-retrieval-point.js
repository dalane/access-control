'use strict';
var PolicyFactory = require('./policies/factory');
module.exports = (function () {
    function PolicyRetrievalPoint(repository, policyFactory) {
        this._repository = repository;
        this._policyFactory = policyFactory;
        this._cache = [];
    }
    /**
     * Returns a PolicySet containing policies that match the query
     * @param  {Object} query [description]
     * @return {PolicySet}       [description]
     */
    PolicyRetrievalPoint.prototype.retrievePolicySet = function (query) {
        var _this = this;
        var policySet = new PolicySet();
        // iterate through policies and filter for policies that match the query...
        this._cache.forEach(function (policy) {
            // - does the query.action.method match?
            // - does the query.resource.path match?
            var match = _this.isMatch(policy, query.action, query.resource, query.principal);
            // push any matching policies into the policySet
            if (match !== null)
                policySet.add(policy, match);
        });
        // return the policy set
        return policySet;
    };
    /**
     * Clears the cache and recaches all policies from the repository
     * @return {Promise} A promise that resolves when completed
     */
    PolicyRetrievalPoint.prototype.refresh = function () {
        var _this = this;
        if (!this._repository.isConnected) {
            throw new Error('Repository is not connected');
        }
        //
        return Promise.resolve().then(function () {
            // retrieve all policy records from the repository
            return _this._repository.findAll();
        }).then(function (payload) {
            // create the policy object for each record and reset the cache
            _this._cache = payload.map(function (record) {
                return _this._policyFactory.createFromRepository(record);
            });
            return Promise.resolve();
        });
    };
    PolicyRetrievalPoint.prototype.isMatch = function (policy, queryAction, queryResource) {
        var isActionMatch = (policy.action = '*' || policy.permittedActions.includes(queryAction));
        if (isActionMatch) {
            return (policy.resource.isMatch(queryResource) !== null);
        }
        else {
            return false;
        }
    };
    return PolicyRetrievalPoint;
}());
