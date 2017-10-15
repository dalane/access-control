"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Decision;
(function (Decision) {
    Decision[Decision["Allow"] = 0] = "Allow";
    Decision[Decision["Deny"] = 1] = "Deny";
})(Decision || (Decision = {}));
;
class AuthorizationDecision {
    constructor(decision, messages, obligations) {
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
exports.AuthorizationDecision = AuthorizationDecision;
