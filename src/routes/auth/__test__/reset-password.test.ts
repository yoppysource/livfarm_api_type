import request from 'supertest';
import { app } from '../../../../app';
import { User } from '../../../models/user';
import { AuthPath } from '../auth-routes-path';

it('send confirmation email for user', async () => {
  await request(app)
    .post(AuthPath.withBase(AuthPath.SIGNUP))
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
  // TODO: integration test에서 send grid와의 호환성 테스트 해야함.
  // await request(app)
  //   .post(AuthPath.withBase(AuthPath.PASSWORD_RESET_EMAIL))
  //   .send({
  //     email: 'test@test.com',
  //   })
  //   .expect(200);

  const user = await User.findOne({ email: 'test@test.com' });
  if (user) {
    const passwordResetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    await request(app).get(AuthPath.withBase(AuthPath.PASSWORD_RESET).replace(':token', passwordResetToken)).expect(200);
  }

  await request(app)
    .post(AuthPath.withBase(AuthPath.LOGIN))
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(401);

  await request(app)
    .post(AuthPath.withBase(AuthPath.LOGIN))
    .send({
      email: 'test@test.com',
      password: 'livfarm',
    })
    .expect(200);
});

it('send passwordReset for invaild email', async () => {
  await request(app)
    .post(AuthPath.withBase(AuthPath.CONFIRMATION_EMAIL))
    .send({
      email: 'testsds@test.com',
    })
    .expect(404);
});
