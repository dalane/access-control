import {RepositoryInterface} from './repository-interface';

export class MemoryRepository implements RepositoryInterface {
  private _cache;
  constructor() {
    this._cache = [];
  }
  get isConnected() {
    return true;
  }
  findAll() {
    // return all records without any limits
    return this._cache;
  }
  find(id) {
    return this._cache.filter(record => {
      return (id === record.id);
    });
  }
  create(record) {
    if (!record.id) record.id = 'xxx';
    return this._cache.push(record);
  }
  update(update) {
    let record = this.find(update.id);
    let index = this._cache.indexOf(record => {
      return (update.id === record.id);
    });
    return this._cache[index] = update;
  }
  delete(id) {
    let record = this.find(id);
    let index = this._cache.indexOf(record => {
      return (id === record.id);
    });
    delete this._cache[index];
  }
}
