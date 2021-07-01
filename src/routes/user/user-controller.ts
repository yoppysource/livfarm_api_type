import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/app-error';
import { User } from '../../models/user';
import { sendToken } from '../auth/auth-controller';

// // This is only for web-site
// exports.logout = (req: Request, res: Response) => {
//   res.cookie('jwt', 'loggedout', {
//     expires: new Date(Date.now() + 10 * 1000),
//     httpOnly: true,
//   });
//   res.status(200).json({ status: 'success' });
// };
const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get user from collection
  const user = await User.findById(req.user!.id).select('+password');
  if (!user) return next(new AppError('등록되지 않은 유저입니다', 401));
  if (!user.password) return next(new AppError('비밀번호 변경 기능을 사용할 수 없습니다', 401));
  // 2) check if POSTed current password is correct
  if (!(await user.comparePassword(req.body.currentPassword, user.password))) return next(new AppError('기존 비밀번호를 잘못 입력하셨습니다', 401));
  // 3) If so, update password
  user.password = req.body.newPassword;
  // 4) Log user in, send JWT
  await user.save();
  sendToken(user, 200, res);
};

export { updatePassword };
