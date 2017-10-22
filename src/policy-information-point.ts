import {AccessRequest} from './access-request/access-request';
import {Callable} from './callable-interface';

export class PolicyInformationPoint {
  private _store;
  private _findHandlers;
  constructor(findHandlers = null) {
    this._findHandlers = (findHandlers !== null) ? findHandlers : new Map();
  }
  get findHandlers(): Map<string, Callable> {
    return this._findHandlers;
  }
  findValue(accessRequest: AccessRequest, attribute: string, dataType: string, issuer: string): any {
    if (!this._findHandlers.has(attribute)) return null;
    return this._findHandlers.get(attribute).call(accessRequest, attribute, dataType, issuer);
  }
};
