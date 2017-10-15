import {fromJS} from 'immutable';
import {AccessRequest} from 'access-request/access-request';

export class PolicyEnforcementPoint {
  private _pdp;
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
        'protocol': 'http', // in a secure system this should be https
        'isRequestSecure': request.secure
      }
    }
    // create the access request and set the request parameters...
    let accessRequest = new AccessRequest(fromJS(body));
    let response = this._pdp.authorizeRequestQuery(accessRequest);
    return response;
  }
};
