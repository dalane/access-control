import {RepositoryInterface} from './repository-interface';

export class FortuneRepository implements RepositoryInterface {
  private _store;
  constructor(store) {
    this._store = store;
  }
  get isConnected() {
    return (this._store.connectionStatus === 1);
  }
  findAll() {
    // return all records without any limits
    return this._store.find('policy', null, {limit: 0});
  }
  find(id) {
    return this._store.find('policy', [id]);
  }
  create(record) {
    return this._store.create('policy', [record]);
  }
  update(update) {
    return this._store.update('policy', [update]);
  }
  delete(id) {
    return this._store.delete('policy', [id]);
  }
}
