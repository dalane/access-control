export interface RepositoryInterface {
  readonly isConnected;
  findAll();
  find(id);
  create(record);
  update(update);
  delete(id);
}
