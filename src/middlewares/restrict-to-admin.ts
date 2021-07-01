import { NextFunction, Response, Request } from 'express';
import { AppError } from '../errors/app-error';

const restrictToAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('접근 권한이 없습니다', 403));

  if (!(req.user.role === 'admin')) {
    return next(new AppError('접근 권한이 없습니다', 403));
  }
  next();
};
export { restrictToAdmin };
