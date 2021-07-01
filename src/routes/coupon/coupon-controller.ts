import { NextFunction, Response, Request } from 'express';
import { AppError } from '../../errors/app-error';
import { Coupon } from '../../models/coupon';
import { User, UserCoupon } from '../../models/user';

const registerCoupon = async (req: Request, res: Response, next: NextFunction) => {
  const coupon = await Coupon.findOne({ code: req.params.code, limit: { $ne: 0 }, expireDate: { $gte: Date.now() } });
  if (!coupon) return next(new AppError('요청하신 쿠폰 번호를 찾을 수 없습니다.', 404));
  let userCoupons = req.user.coupons;

  let isExist = false;
  userCoupons.forEach((element: UserCoupon) => {
    if (element.code === req.params.code) {
      isExist = true;
    }
  });

  if (isExist) return next(new AppError('이미 등록되었거나 사용한 쿠폰입니다.', 403));
  let newCoupon = {
    code: coupon.code,
    used: false,
    category: coupon.category,
    amount: coupon.amount,
    expireDate: coupon.expireDate,
    description: coupon.description,
  };

  //register to User
  const data = await User.findByIdAndUpdate(
    req.user.id,
    {
      $push: { coupons: newCoupon },
    },
    { new: true, runValidators: true },
  );

  //If the coupon has field for limit, add -1 the field.
  if (coupon.limit) {
    await Coupon.findByIdAndUpdate(coupon.id, {
      limit: coupon.limit - 1 < 0 ? 0 : coupon.limit - 1,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: newCoupon,
    },
  });
};

export { registerCoupon };
