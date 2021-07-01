class CouponPath {
  static BASE = '/api/v1/coupons';
  static ID = '/:id';
  static ALL = '/';
  static REGISTER_COUPON = '/registerCoupon/:code';

  static withBase(couponPath: string) {
    return this.BASE + couponPath;
  }
}

export { CouponPath };
