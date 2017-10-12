'use strict';

const UrlPattern = require('url-pattern');

module.exports = class {
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
