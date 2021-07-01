import asyncWrapper from 'async-wrapper-express-ts';
import express from 'express';
import { updatePassword } from '../user/user-controller';
import { login, sendConfirmationEmail, signUp, socialLogin, confirmUser, sendResetPasswordEmail, resetPassword } from './auth-controller';
import { AuthPath } from './auth-routes-path';

const router = express.Router();

router.post(AuthPath.SIGNUP, asyncWrapper(signUp));
router.post(AuthPath.LOGIN, asyncWrapper(login));
router.post(AuthPath.SOCIAL_LOGIN, asyncWrapper(socialLogin));
router.post(AuthPath.CONFIRMATION_EMAIL, asyncWrapper(sendConfirmationEmail));
router.get(AuthPath.CONFIRM_USER, confirmUser);
router.post(AuthPath.PASSWORD_RESET_EMAIL, asyncWrapper(sendResetPasswordEmail));
router.get(AuthPath.PASSWORD_RESET, resetPassword);

export { router as authRouter };
