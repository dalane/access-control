import {AccessDecisionType} from './access-decision-type';
import {AccessRequest} from './access-request';

export class AccessResponse {
    private _accessRequest: AccessRequest;
    private _decision: AccessDecisionType;
    private _messages: Array<string>;
    private _obligations: Array<any>;
    constructor(accessRequest: AccessRequest, decision: AccessDecisionType, messages: Array<string> = null, obligations: Array<any> = null) {
        this._accessRequest = accessRequest;
        this._decision = decision;
        this._messages = messages;
        this._obligations = obligations;
    }
    get accessRequest(): AccessRequest {
        return this._accessRequest;
    }
    get decision(): AccessDecisionType {
        return this._decision;
    }
    get messages(): Array<string> {
        return this._messages;
    }
    get obligations(): Array<any> {
        return this._obligations;
    }
}
