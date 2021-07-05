import { promisify } from 'util';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { User, UserDoc } from '../../models/user';
import { AppError } from '../../errors/app-error';
import { EmailService } from '../../services/email-service';
import { Cart } from '../../models/cart';

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendToken = (user: UserDoc, statusCode: number, res: Response) => {
  const token = signToken(user._id);

  // this Logic is only available for browser
  // const cookieOptions = {
  //   expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
  //   httpOnly: true,
  // };
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  // res.cookie('jwt', token, cookieOptions);
  // Remove password from output

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { data: user },
  });
};

const socialLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { email, snsId, platform } = req.body;

  if (snsId && platform) {
    //이미 회원 가입을 한 경우
    const user = await User.findOne({ snsId, platform });
    if (user) {
      return sendToken(user, 200, res);
    }
    //이메일은 동일한데 다른 소셜로 가입한 경우
    if (email !== null) {
      const existedUser = await User.findOne({ email });
      if (existedUser) {
        return next(new AppError(`${existedUser.platform ? existedUser.platform : '리브팜'}에서 이미 해당 이메일로 가입된 계정이 있습니다`, 400));
      }
    }
    //SignUp for social login
    req.body.role = 'user';
    let newUser = User.build({ snsId, platform, email, isEmailConfirmed: true });
    await newUser.save();
    newUser = await newUser
      .populate({
        path: 'cart',
        model: Cart,
      })
      .execPopulate();
    return sendToken(newUser, 201, res);
  } else {
    return next(new AppError('소셜로그인을 이용할 수 없습니다', 400));
  }
};

const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const existedUser = await User.findOne({ email });

  if (existedUser) return next(new AppError(`${existedUser.platform ? existedUser.platform : '리브팜'}에서 이미 해당 이메일로 가입된 계정이 있습니다`, 400));
  if (!email || !password) {
    return next(new AppError('이메일 또는 비밀번호를 입력해주세요', 400));
  }
  let newUser = User.build({ email, password, isEmailConfirmed: false });
  newUser = await newUser.save();

  newUser = await newUser
    .populate({
      path: 'cart',
    })
    .execPopulate();
  sendToken(newUser, 201, res);
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  //Login With ID & PASSWORD
  // 1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // 2) check if user_exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  console.log(user);
  if (!user) return next(new AppError('존재하지 않는 계정입니다', 401));
  if (!user.password && user.platform) return next(new AppError(`동일한 이메일 주소로 ${user.platform}에서 가입하셨습니다`, 401));
  if (!user.password) return next(new AppError(`알 수 없는 오류가 발생하였습니다`, 401));
  if (!(await user.comparePassword(password, user.password))) return next(new AppError('비밀번호가 일치하지 않습니다', 401));

  sendToken(user, 200, res);
};

const sendConfirmationEmail = async (req: Request, res: Response, next: NextFunction) => {
  //1) get user based on posted Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('유효하지 않은 이메일입니다', 404));
  }
  const confirmationToken = user.createEmailConfirmationToken();
  await user.save({ validateBeforeSave: false });
  //3) Send it to user's email
  const confirmationURL = `${req.protocol}://${req.get('host')}/api/v1/auth/confirmUser/${confirmationToken}`;

  if (process.env.NODE_ENV === 'test') {
    return res.status(200).json({
      status: 'success',
      data: { data: { message: '가입하신 이메일 주소로 이메일 확인 메일을 보냈습니다' } },
    });
  }
  try {
    await new EmailService(user.email, confirmationURL).sendEmailConfirmation();
    res.status(200).json({
      status: 'success',
      data: { data: { message: '가입하신 이메일 주소로 이메일 확인 메일을 보냈습니다' } },
    });
  } catch (error) {
    console.log(error);
    user.emailConfirmationToken = undefined;
    user.emailConfirmationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('이메일 전송 중 오류가 발생했습니다', 500));
  }
};
const confirmUser = async (req: Request, res: Response) => {
  try {
    // 1) get user based on the token
    console.log(req.params.token);
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailConfirmationToken: hashedToken,
      emailConfirmationExpires: { $gt: Date.now() },
    });
    // 2) If token has not expired, and there is user, set the new password
    if (!user)
      return res.status(400).render('web-notification', {
        title: '오류',
        subtitle: '오류가 발생했습니다',
        msg: '유효하지 않은 요청이거나 기한이 만료되었습니다. 다시 로그인하셔서 이메일 인증 절차를 진행해주세요',
      });
    user.emailConfirmationToken = undefined;
    user.emailConfirmationToken = undefined;
    user.isEmailConfirmed = true;
    await user.save();

    res.status(200).render('web-notification', {
      title: '인증완료',
      subtitle: '이메일 인증이 완료되었습니다',
      msg: '로그인하시고, 리브팜에서 가장 신선한 채소를 만나보세요.',
    });
  } catch (error) {
    console.log(error);
    res.status(400).render('web-notification', {
      title: '오류',
      subtitle: '오류가 발생했습니다',
      msg: '유효하지 않은 요청입니다. 다시 로그인하셔서 이메일 인증 절차를 진행해주세요',
    });
  }
};

const sendResetPasswordEmail = async (req: Request, res: Response, next: NextFunction) => {
  //1) get user based on posted Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('유효하지 않은 이메일입니다', 404));
  }
  if (user.snsId && user.platform) {
    return next(new AppError('소셜 이메일로 가입된 계정입니다', 404));
  }
  const passwordResetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) Send it to user's email

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/passwordReset/${passwordResetToken}`;

  if (process.env.NODE_ENV === 'test') {
    return res.status(200).json({
      status: 'success',
      data: { data: { message: '가입하신 이메일 주소로 비밀번호 초기화 메일을 보냈습니다' } },
    });
  }
  try {
    await new EmailService(user.email, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      data: { data: { message: '가입하신 이메일 주소로 비밀번호 초기화 메일을 보냈습니다' } },
    });
  } catch (error) {
    console.log(error);
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('이메일 전송 중 오류가 발생했습니다', 500));
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    // 1) get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    // 2) If token has not expired, and there is user, set the new password
    if (!user)
      return res.status(400).render('web-notification', {
        title: '오류',
        subtitle: '오류가 발생했습니다',
        msg: '유효하지 않은 요청입니다. 다시 절차를 진행해주세요.',
      });

    user.password = process.env.RESET_PASSWORD;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).render('web-notification', {
      title: '비밀번호 초기화',
      subtitle: '비밀번호가 초기화되었습니다.',
      msg: '메일로 보내드린 초기 비밀번호로 로그인 하신 후, 비밀번호를 꼭 변경해주세요',
    });
  } catch (e) {
    console.log(e);
    return res.status(400).render('web-notification', {
      title: '오류',
      subtitle: '오류가 발생했습니다',
      msg: '유효하지 않은 요청입니다. 다시 절차를 진행해주세요.',
    });
  }
};

export { socialLogin, signUp, login, sendConfirmationEmail, confirmUser, sendResetPasswordEmail, resetPassword, sendToken };
