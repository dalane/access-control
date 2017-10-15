"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AccessResponse {
    constructor(decision, messages = null, obligations = null) {
        this._decision = decision;
        this._messages = messages;
        this._obligations = obligations;
    }
    get decision() {
        return this._decision;
    }
    get messages() {
        return this._messages;
    }
    get obligations() {
        return this._obligations;
    }
}
exports.AccessResponse = AccessResponse;
