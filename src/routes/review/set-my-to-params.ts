import { NextFunction, Response, Request } from 'express';
import { AppError } from '../../errors/app-error';

const setMyToParams = (req: Request, _: Response, next: NextFunction) => {
  try {
    if (req.user!.id) {
      req.params.my = req.user!.id;
    }
    next();
  } catch (error) {
    console.log(error);
    return next(new AppError('오류가 발생했습니다.', 401));
  }
};

export { setMyToParams };
