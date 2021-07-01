import request from 'supertest';
import { app } from '../../../../app';
import { AuthPath } from '../auth-routes-path';

it('retures a 200 on successful login', async () => {
  await request(app)
    .post(AuthPath.withBase(AuthPath.SIGNUP))
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  await request(app)
    .post(AuthPath.withBase(AuthPath.LOGIN))
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200);
});

it('retures a 400 for missing value', async () => {
  await request(app)
    .post(AuthPath.withBase(AuthPath.LOGIN))
    .send({
      email: 'test@test.com',
    })
    .expect(400);

  await request(app)
    .post(AuthPath.withBase(AuthPath.LOGIN))
    .send({
      password: 'sdads',
    })
    .expect(400);
});

it('retures a 401 for non-match password', async () => {
  await request(app)
    .post(AuthPath.withBase(AuthPath.SIGNUP))
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  await request(app)
    .post(AuthPath.withBase(AuthPath.LOGIN))
    .send({
      email: 'test@test.com',
      password: 'dsdasdasd',
    })
    .expect(401);
});

it('retures a 401 for duplicate email', async () => {
  await request(app)
    .post(AuthPath.withBase(AuthPath.SOCIAL_LOGIN))
    .send({
      snsId: 'sdsdafwcdsc',
      platform: 'kakao',
      email: 'kakao@test.com',
    })
    .expect(201);

  await request(app)
    .post(AuthPath.withBase(AuthPath.LOGIN))
    .send({
      email: 'kakao@test.com',
      password: 'dsdasdasd',
    })
    .expect(401);
});
