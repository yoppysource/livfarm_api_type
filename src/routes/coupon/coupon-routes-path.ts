class CouponPath {
  static BASE = '/api/v1/coupons';
  static ID = '/:id';
  static ALL = '/';
  //TODO: 나중에 고치기 register로
  static REGISTER_COUPON = '/registerCoupon/:code';

  static withBase(couponPath: string) {
    return this.BASE + couponPath;
  }
}

export { CouponPath };
