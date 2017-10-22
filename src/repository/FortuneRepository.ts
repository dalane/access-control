import {RepositoryInterface} from './RepositoryInterface';

export class FortuneRepository implements RepositoryInterface {
  private _store;
  constructor(store) {
    this._store = store;
  }
  get isConnected() {
    return (this._store.connectionStatus === 1);
  }
  findAll(): Promise<Array<object>> {
    // return all records without any limits
    return this._store.find('policy', null, {limit: 0}).then(results => {
      return results.payload.records;
    });
  }
  find(id) {
    return this._store.find('policy', [id]).then(results => {
      if (results.count) {
        return results.payload.records[0];
      }
    });
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
