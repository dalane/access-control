import {AccessRequest} from 'access-request/access-request';

export interface Callable {
    call(accessRequest: AccessRequest, attribute: string, dataType: string, issuer: string): any 
}
