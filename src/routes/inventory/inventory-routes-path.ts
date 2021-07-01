class InventoryPath {
  static BASE = '/api/v1/inventories';
  static STORE_ID = '/store/:storeId';
  static ID = '/:id';
  static ALL = '/';

  static withBase(inventoryPath: string) {
    return this.BASE + inventoryPath;
  }
}

export { InventoryPath };
