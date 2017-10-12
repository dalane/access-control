'use strict';
var _a = require('immutable'), List = _a.List, Map = _a.Map;
module.exports = (function () {
    function PolicyEnforcementPoint(pdp) {
        this._pdp = pdp;
    }
    PolicyEnforcementPoint.prototype.validateRequest = function (request) {
        // take the node http request and build a PDP authorization request message
        // at this point, the request has already been authenticated
        // set the subject parameters...
        var subject = Map();
        subject.set('id', request.user.id);
        subject.set('email', request.user.email);
        subject.set('isAdmin', request.user.isAdmin);
        subject.set('token', null);
        subject.set('clientId', null);
        subject.set('scopes', List());
        // set the resource parameters...
        var resource = Map();
        resource.set('application', 'application-id');
        resource.set('query', request.query);
        resource.set('requestData', request.body);
        resource.set('path', request.originalUrl);
        resource.set('raw', request.body);
        // set the action parameters...
        var action = Map();
        action.set('method', request.method);
        // set the environment parameters...
        var environment = Map();
        environment.set('userAgent', null);
        environment.set('clientIpAddress', null);
        environment.set('hostIpAddress', null);
        environment.set('requestedAt', null);
        environment.set('cookies', []);
        environment.set('protocol', 'http'); // in a secure system this should be https
        environment.set('isRequestSecure', request.secure);
        // create the access request and set the request parameters...
        var accessRequest = Map();
        accessRequest.set('subject', subject);
        accessRequest.set('resource', resource);
        accessRequest.set('action', action);
        accessRequest.set('environment', environment);
        var response = this._pdp.authorizeRequestQuery(accessRequest);
        return response;
    };
    return PolicyEnforcementPoint;
}());
