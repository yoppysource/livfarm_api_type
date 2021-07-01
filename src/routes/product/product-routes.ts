class ProductPath {
  static BASE = '/api/v1/products';
  static ID = '/:id';
  static ALL = '/';

  static withBase(productPath: string) {
    return this.BASE + productPath;
  }
}

export { ProductPath };
