import {AccessRequest} from './access-request/access-request';
import {CallableInterface} from './callable-interface';

export class PolicyInformationPoint {
  private _store;
  private _findHandlers;
  constructor(findHandlers = null) {
    this._findHandlers = (findHandlers !== null) ? findHandlers : new Map();
  }
  get findHandlers(): Map<string, CallableInterface> {
    return this._findHandlers;
  }
  findValue(accessRequest: AccessRequest, attribute: string, dataType: string = null, issuer: string = null): Promise<any> {
    if (!this._findHandlers.has(attribute)) return null;
    return this._findHandlers.get(attribute).call(accessRequest, attribute, dataType, issuer);
  }
};
