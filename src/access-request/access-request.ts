import {Map} from 'immutable';

export class AccessRequest {
  private _body: Map<string,any>; 
  constructor(body: Map<string,any> = null) {
    this._body = body;
  }
  get body(): Map<string,any> {
    return this._body;
  }
  /**
   * Returns a new AccessRequest with the body data merged to the existing body data
   * @param {Map<string,any>} data The data to be merged to the existing body data
   * @returns {AccessRequest}
   */
  merge(data: Map<string,any>): AccessRequest {
    let body = this._body.merge(data);
    return new AccessRequest(body);
  }
  get(key) {
    return this._body.get(key);
  }
  getPath(path: String): any {
    return this._body.getIn(path.split('.'));
  }
  getIn(searchKeyPath) {
    return this._body.getIn(searchKeyPath);
  }
}