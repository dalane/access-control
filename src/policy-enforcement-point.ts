import {fromJS} from 'immutable';
import {AccessRequest} from './access-request/access-request';

export class PolicyEnforcementPoint {
  private _pdp;
  constructor(pdp) {
    this._pdp = pdp;
  }
  async validateRequest(request) {
    // create the access request and set the request parameters...
    let accessRequest = new AccessRequest(fromJS(request));
    return await this._pdp.authorizeRequestQuery(accessRequest);
  }
};
