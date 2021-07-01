import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) return res.status(err.statusCode).send(err.toObject());

  let unknownError = Object.create(err);
  console.log(unknownError.stack);
  switch (unknownError) {
    case unknownError.name === 'CastError':
      unknownError = new AppError('유효하지 않은 요청입니다', 400);
      break;
    case unknownError.code === 11000:
      const value = unknownError.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
      unknownError = new AppError(`중복된 값입니다: ${value}. 다른 값을 넣어주세요`, 400);
      break;
    case unknownError.name === 'ValidationError':
      unknownError = new AppError(`유효하지 않은 값입니다.`, 400);
      break;
    case unknownError.name === 'JsonWebTokenError':
      unknownError = new AppError(`인증에 실패하였습니다. 다시 로그인 해주세요.`, 401);
      break;
    case unknownError.name === 'TokenExpiredError':
      unknownError = new AppError(`로그인이 만료되었습니다. 다시 로그인 해주세요.`, 401);
      break;
    default:
      unknownError = new AppError('오류가 발생했습니다', 400);
      break;
  }
  res.status(unknownError.statusCode).send(unknownError.toObject());
};
