import {Map} from 'immutable';

export class AccessRequest {
  private _body: Map<string,any>; 
  constructor(body: Map<string,any> = null) {
    this._body = body;
  }
  /**
   * Returns a new AccessRequest with the body data merged to the existing body data
   * @param {Map<string,any>} data The data to be merged to the existing body data
   * @returns {AccessRequest}
   */
  merge(data: Map<string,any>): AccessRequest {
    let body = this._body.mergeDeep(data);
    return new AccessRequest(body);
  }
  get(key) {
    return this._body.get(key);
  }
  getIn(searchKeyPath: Array<string>) {
    return this._body.getIn(searchKeyPath);
  }
  hasIn(searchKeyPath: Array<string>) {
    return this._body.hasIn(searchKeyPath);
  }
}
