import {AccessRequest} from 'access-request/access-request';

export interface CallableInterface {
    call(accessRequest: AccessRequest, attribute: string, dataType: string, issuer: string): Promise<any> 
}
