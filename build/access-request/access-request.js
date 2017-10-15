"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AccessRequest {
    constructor(body = null) {
        this._body = body;
    }
    get body() {
        return this._body;
    }
    /**
     * Returns a new AccessRequest with the body data merged to the existing body data
     * @param {Map<string,any>} data The data to be merged to the existing body data
     * @returns {AccessRequest}
     */
    merge(data) {
        let body = this._body.merge(data);
        return new AccessRequest(body);
    }
    get(key) {
        return this._body.get(key);
    }
    getPath(path) {
        return this._body.getIn(path.split('.'));
    }
    getIn(searchKeyPath) {
        return this._body.getIn(searchKeyPath);
    }
}
exports.AccessRequest = AccessRequest;
