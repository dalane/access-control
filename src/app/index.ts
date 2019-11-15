import * as accessRequest from './access-request';
import * as accessResponse from './access-response';
import * as files from './load-policies-from-json';
import * as policyDecisionPoint from './policy-decision';
import * as action from './policy/action';
import * as policy from './policy/index';
// import * as obligations from './policy/obligations'; TODO: version 2 policy...
import * as principal from './policy/principal';
import * as resource from './policy/resource';
import * as specification from './policy/specification';

export {
  action,
  accessRequest,
  accessResponse,
  files,
  policy,
  policyDecisionPoint,
  principal,
  resource,
  specification
};