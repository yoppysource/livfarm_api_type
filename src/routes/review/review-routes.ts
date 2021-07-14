class ReviewPath {
  static FROM_PRODUCT = '/:productId/reviews';
  static BASE = '/api/v1/reviews';
  static ID = '/:id';
  static REPORT = '/:reviewId/report';
  static ALL = '/';
  static MY = '/my';

  static withBase(reviewPath: string) {
    return this.BASE + reviewPath;
  }
}

export { ReviewPath };
