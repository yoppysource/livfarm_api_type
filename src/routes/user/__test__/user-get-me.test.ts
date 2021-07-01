import request from 'supertest';
import { app } from '../../../../app';
import { UserPath } from '../user-routes-path';

it('will get user data correctly on social login or login', async () => {
  let token = await global.getTokenBySignup();

  await request(app).get(UserPath.withBase(UserPath.ME)).set('authorization', `Bearer ${token}`).send().expect(200);

  token = await global.getTokenBySocialLogin();

  await request(app).get(UserPath.withBase(UserPath.ME)).set('authorization', `Bearer ${token}`).send().expect(200);
});

it('return error when the token is not verified', async () => {
  await request(app).get(UserPath.withBase(UserPath.ME)).set('authorization', `Bearer adasdasdasdas`).send().expect(401);
});

it('return error after user recently change the password', async () => {
  const token = await global.getTokenBySignup();
  await new Promise((res) => setTimeout(res, 2000));

  await request(app)
    .post(UserPath.withBase(UserPath.UPDATE_PASSWORD))
    .set('authorization', `Bearer ${token}`)
    .send({ currentPassword: 'password', newPassword: 'newpass' })
    .expect(200);

  await request(app).get(UserPath.withBase(UserPath.ME)).set('authorization', `Bearer ${token}`).send().expect(401);
});
