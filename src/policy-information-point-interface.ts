import {AccessRequest} from 'access-request/access-request';

export interface PolicyInformationPointInterface {
    findValue(accessRequest: AccessRequest, attribute: string, dataType: string, issuer: string): any 
}