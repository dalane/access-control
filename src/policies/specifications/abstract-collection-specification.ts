import {IsSatisfiedByInterface} from '../is-satisfied-by-interface';
import {AbstractSpecification} from './abstract-specification';
import {AccessRequest} from 'access-request/access-request';

export abstract class AbstractCollectionSpecification extends Array implements IsSatisfiedByInterface {
  abstract isSatisfiedBy(accessRequest: AccessRequest);
  get(index) {
    return this[index];
  }
}