class CartPath {
  static BASE = '/api/v1/carts';
  static MY = '/my';
  static Item = '/item';
  static DELETE = '/delete';

  static withBase(eventPath: string) {
    return this.BASE + eventPath;
  }
}

export { CartPath };
