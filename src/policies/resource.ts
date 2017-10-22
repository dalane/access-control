import * as UrlPattern from 'url-pattern';

export class Resource {
  private _pattern;
  private _uri;
  /**
   * [constructor description]
   * @param  {String} uri The resource uri
   */
  constructor(uri) {
    this._uri = uri;
    this._pattern = new UrlPattern(this.uri);
  }
  get uri() {
    return this._uri;
  }
  match(uri) {
    return this._pattern.match(uri);
  }
}
