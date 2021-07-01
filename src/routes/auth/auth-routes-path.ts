class AuthPath {
  static BASE = '/api/v1/auth';
  static SIGNUP = '/signup';
  static LOGIN = '/login';
  static SOCIAL_LOGIN = '/socialLogin';
  static CONFIRMATION_EMAIL = '/confirmationEmail';
  static CONFIRM_USER = '/confirmUser/:token';
  static PASSWORD_RESET_EMAIL = '/passwordResetEmail';
  static PASSWORD_RESET = '/passwordReset/:token';

  static withBase(authPath: string) {
    return AuthPath.BASE + authPath;
  }
}

export { AuthPath };
