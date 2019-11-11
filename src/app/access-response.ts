import { IPolicy } from "./policy/policy";

export enum ACCESS_DECISION {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  NOT_APPLICABLE = 'not-applicable'
}

export interface IAccessResponse {
  decision:ACCESS_DECISION;
  messages:string[];
  obligations:any[];
  failedPolicies?:IPolicy[];
}
