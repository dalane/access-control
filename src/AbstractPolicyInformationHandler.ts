import {CallableInterface} from './callable-interface';
import {AccessRequest} from 'access-request/access-request';

export abstract class AbstractPolicyInformationHandler implements CallableInterface {
  abstract async call(accessRequest: AccessRequest, attribute: string, dataType: string, issuer: string): Promise<any>
}
