import {Resource} from './resource';

export class ResourceFactory {
  create(uri) {
    return new Resource(uri);
  }
}