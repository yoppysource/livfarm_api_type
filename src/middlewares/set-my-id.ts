import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';

const setMyId = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('유저를 특정할 수 없습니다', 401));
  req.params.id = req.user.id;

  next();
};

const preventFromUpdatingRole = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && req.body.role && req.body.role === 'admin') return next(new AppError('변경할 수 없는 정보입니다', 403));
  next();
};
export { setMyId, preventFromUpdatingRole };
