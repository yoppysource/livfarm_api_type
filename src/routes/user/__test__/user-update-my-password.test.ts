import request from 'supertest';
import { app } from '../../../../app';
import { AuthPath } from '../../auth/auth-routes-path';
import { UserPath } from '../user-routes-path';

it('can change password with proper request from client', async () => {
  const token = await global.getTokenBySignup();
  const res = await request(app)
    .post(UserPath.withBase(UserPath.UPDATE_PASSWORD))
    .set('authorization', `Bearer ${token}`)
    .send({ currentPassword: 'dadad', newPassword: 'dasdas' })
    .expect(401);

  await request(app)
    .post(UserPath.withBase(UserPath.UPDATE_PASSWORD))
    .set('authorization', `Bearer ${token}`)
    .send({ currentPassword: 'password', newPassword: 'newpass' })
    .expect(200);
  await new Promise((res) => setTimeout(res, 2000));

  await request(app).post(AuthPath.withBase(AuthPath.LOGIN)).send({ email: 'test@test.com', password: 'newpass' }).expect(200);
});

it('will not receipt request from social login user', async () => {
  const res = await request(app)
    .post(AuthPath.withBase(AuthPath.SOCIAL_LOGIN))
    .send({
      snsId: 'sdsdafwcdsc',
      platform: 'kakao',
      email: 'kakao@test.com',
    })
    .expect(201);

  await request(app)
    .post(UserPath.withBase(UserPath.UPDATE_PASSWORD))
    .set('authorization', `Bearer ${res.body.token}`)
    .send({ currentPassword: 'password', newPassword: 'dasdas' })
    .expect(401);
});
