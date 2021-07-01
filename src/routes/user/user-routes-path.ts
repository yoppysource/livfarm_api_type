class UserPath {
  static BASE = '/api/v1/users';
  static UPDATE_PASSWORD = '/updateMyPassword';
  static ME = '/me';
  static UPDATE_ME = '/updateMe';
  static DELETE_ME = '/deleteMe';
  static ALL = '/';
  static ID = '/:id';

  static withBase(userPath: string) {
    return UserPath.BASE + userPath;
  }
}

export { UserPath };
