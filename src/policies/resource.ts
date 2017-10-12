import * as UrlPattern from 'url-pattern';

export class Resource {
  private _pattern;
  private _uri;
  /**
   * [constructor description]
   * @param  {String} uri The resource uri
   */
  constructor(uri) {
    this.uri = uri;
    this._pattern = new UrlPattern(this.uri);
  }
  set uri(value) {
    this._uri = value;
  }
  get uri() {
    return this._uri;
  }
  isMatch(uri) {
    return this._pattern.isMatch(uri);
  }
}
