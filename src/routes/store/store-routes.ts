class StorePath {
  static BASE = '/api/v1/stores';
  static ID = '/:id';
  static ALL = '/';
  static FROM_LOCATION = '/fromLocation';
  static COORDINATES = '/coordinates';
  static INSTORE = '/inStore/:storeId';

  static withBase(storePath: string) {
    return this.BASE + storePath;
  }
}

export { StorePath };
