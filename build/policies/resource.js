"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UrlPattern = require("url-pattern");
class Resource {
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
exports.Resource = Resource;
