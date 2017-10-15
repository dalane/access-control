"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const access_request_1 = require("access-request/access-request");
class PolicyEnforcementPoint {
    constructor(pdp) {
        this._pdp = pdp;
    }
    validateRequest(request) {
        // take the node http request and build a PDP authorization request message
        // at this point, the request has already been authenticated
        let body = {
            // set the subject parameters...
            subject: {
                'id': request.user.id,
                'email': request.user.email,
                'isAdmin': request.user.isAdmin,
                'token': null,
                'clientId': null,
                'scopes': [],
            },
            // set the resource parameters...
            resource: {
                'application': 'application-id',
                'query': request.query,
                'requestData': request.body,
                'path': request.originalUrl,
                'raw': request.body
            },
            // set the action parameters...
            action: {
                'method': request.method
            },
            // set the environment parameters...
            environment: {
                'userAgent': null,
                'clientIpAddress': null,
                'hostIpAddress': null,
                'requestedAt': null,
                'cookies': [],
                'protocol': 'http',
                'isRequestSecure': request.secure
            }
        };
        // create the access request and set the request parameters...
        let accessRequest = new access_request_1.AccessRequest(immutable_1.fromJS(body));
        let response = this._pdp.authorizeRequestQuery(accessRequest);
        return response;
    }
}
exports.PolicyEnforcementPoint = PolicyEnforcementPoint;
;
