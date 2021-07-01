import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { User, UserDoc, UserPopulatedDoc } from '../models/user';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      data?: any;
    }
  }
}
interface JWTPayload {
  id: string;
  iat: number;
  exp: number;
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('로그인을 먼저 해주세요', 401));
    }

    // 2) verification token

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('더 이상 존재하지 않는 유저입니다', 401));
    }
    // 4) check if user changed password after the token was issued
    if (currentUser.isPasswordChangedAfterTokenIssued(decoded.iat)) {
      return next(new AppError('최근에 비밀번호가 변경되었습니다. 다시 로그인 해주세요', 401));
    }
    //grant access to protected route
    req.user = currentUser;

    next();
  } catch (error) {
    console.log(error);
    return next(new AppError('유효하지 않은 토큰입니다', 401));
  }
};

export { verifyToken };
