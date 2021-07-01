class OrderPath {
  static BASE = '/api/v1/orders';
  static ID = '/:id';
  static ALL = '/';
  static MY = '/my';
  static WEBHOOK = '/webhook';

  static withBase(orderPath: string) {
    return this.BASE + orderPath;
  }
}

export { OrderPath };
