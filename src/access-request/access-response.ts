import {AccessDecisionType} from './access-decision-type';

export class AccessResponse {
    private _decision: AccessDecisionType;
    private _messages: Array<string>;
    private _obligations: Array<any>;
    constructor(decision: AccessDecisionType, messages: Array<string> = null, obligations: Array<any> = null) {
        this._decision = decision;
        this._messages = messages;
        this._obligations = obligations;
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