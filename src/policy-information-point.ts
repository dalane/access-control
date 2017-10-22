import {PolicyInformationPointInterface} from 'policy-information-point-interface';
import {AccessRequest} from './access-request/access-request';

export class PolicyInformationPoint implements PolicyInformationPointInterface {
  private _store;
  constructor(store) {
    this._store = store;
  }
  findValue(accessRequest: AccessRequest, attribute: string, dataType: string, issuer: string): any {
    return null;
  }
};
