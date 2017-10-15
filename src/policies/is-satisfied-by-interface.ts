import {AccessRequest} from 'access-request/access-request';

export interface IsSatisfiedByInterface {
  isSatisfiedBy(accessRequest: AccessRequest): boolean;
}