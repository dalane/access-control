'use strict';

const {List, Map} = require('immutable');

module.exports = class PolicyEnforcementPoint {
  constructor(pdp) {
    this._pdp = pdp;
  }
  validateRequest(request) {
    // take the node http request and build a PDP authorization request message
    // at this point, the request has already been authenticated
    // set the subject parameters...
    let subject = Map();
    subject.set('id', request.user.id);
    subject.set('email', request.user.email);
    subject.set('isAdmin', request.user.isAdmin);
    subject.set('token', null);
    subject.set('clientId', null);
    subject.set('scopes', List());
    // set the resource parameters...
    let resource = Map();
    resource.set('application', 'application-id');
    resource.set('query', request.query);
    resource.set('requestData', request.body);
    resource.set('path', request.originalUrl);
    resource.set('raw', request.body);
    // set the action parameters...
    let action = Map();
    action.set('method', request.method);
    // set the environment parameters...
    let environment = Map();
    environment.set('userAgent', null);
    environment.set('clientIpAddress', null);
    environment.set('hostIpAddress', null);
    environment.set('requestedAt', null);
    environment.set('cookies', []);
    environment.set('protocol', 'http'); // in a secure system this should be https
    environment.set('isRequestSecure', request.secure);
    // create the access request and set the request parameters...
    let accessRequest = Map();
    accessRequest.set('subject', subject);
    accessRequest.set('resource', resource);
    accessRequest.set('action', action);
    accessRequest.set('environment', environment);
    let response = this._pdp.authorizeRequestQuery(accessRequest);
    return response;
  }
};
