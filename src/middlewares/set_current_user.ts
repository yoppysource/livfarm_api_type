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

const setCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      const currentUser = await User.findById(decoded.id);
      if (currentUser) {
        req.user = currentUser;
      }
    }
    next();
  } catch (error) {
    console.log(error);
    next();
  }
};

export { setCurrentUser };
