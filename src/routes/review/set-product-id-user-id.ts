import { NextFunction, Response, Request } from 'express';
import { AppError } from '../../errors/app-error';

const setProductIdAndUserId = (req: Request, _: Response, next: NextFunction) => {
  try {
    if (!req.body.product) req.body.product = req.params.productId;
    if (req.user) {
      if (!req.body.user) req.body.user = req.user.id;
    } else {
      return next(new AppError('유저를 식별할 수 없습니다', 403));
    }
    next();
  } catch (error) {
    console.log(error);
    return next(new AppError('오류가 발생했습니다.', 401));
  }
};

export { setProductIdAndUserId };
