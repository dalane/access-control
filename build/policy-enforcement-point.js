"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
class PolicyEnforcementPoint {
    constructor(pdp) {
        this._pdp = pdp;
    }
    validateRequest(request) {
        // take the node http request and build a PDP authorization request message
        // at this point, the request has already been authenticated
        // set the subject parameters...
        let subject = immutable_1.Map();
        subject.set('id', request.user.id);
        subject.set('email', request.user.email);
        subject.set('isAdmin', request.user.isAdmin);
        subject.set('token', null);
        subject.set('clientId', null);
        subject.set('scopes', immutable_1.List());
        // set the resource parameters...
        let resource = immutable_1.Map();
        resource.set('application', 'application-id');
        resource.set('query', request.query);
        resource.set('requestData', request.body);
        resource.set('path', request.originalUrl);
        resource.set('raw', request.body);
        // set the action parameters...
        let action = immutable_1.Map();
        action.set('method', request.method);
        // set the environment parameters...
        let environment = immutable_1.Map();
        environment.set('userAgent', null);
        environment.set('clientIpAddress', null);
        environment.set('hostIpAddress', null);
        environment.set('requestedAt', null);
        environment.set('cookies', []);
        environment.set('protocol', 'http'); // in a secure system this should be https
        environment.set('isRequestSecure', request.secure);
        // create the access request and set the request parameters...
        let accessRequest = immutable_1.Map();
        accessRequest.set('subject', subject);
        accessRequest.set('resource', resource);
        accessRequest.set('action', action);
        accessRequest.set('environment', environment);
        let response = this._pdp.authorizeRequestQuery(accessRequest);
        return response;
    }
}
exports.PolicyEnforcementPoint = PolicyEnforcementPoint;
;
