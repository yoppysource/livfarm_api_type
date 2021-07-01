import request from 'supertest';
import { app } from '../../../../app';
import { AuthPath } from '../auth-routes-path';

it('retures a 201 on successful sign up', async () => {
  await request(app)
    .post(AuthPath.withBase(AuthPath.SIGNUP))
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
});

it('returns a 400 with missing email and password', async () => {
  await request(app).post(AuthPath.withBase(AuthPath.SIGNUP)).send({ email: 'test@test.com' }).expect(400);
  await request(app).post(AuthPath.withBase(AuthPath.SIGNUP)).send({ password: 'password' }).expect(400);
  await request(app).post(AuthPath.withBase(AuthPath.SIGNUP)).send({}).expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post(AuthPath.withBase(AuthPath.SIGNUP))
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  await request(app)
    .post(AuthPath.withBase(AuthPath.SIGNUP))
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

it('get token after successful sign up', async () => {
  const response = await request(app)
    .post(AuthPath.withBase(AuthPath.SIGNUP))
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
  // cookieSession에 secure 가 true라고 되어있어서 (테스트환경은 http)
  expect(response.body.token).toBeDefined();
});

it('get cart after successful sign up', async () => {
  const response = await request(app)
    .post(AuthPath.withBase(AuthPath.SIGNUP))
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  // cookieSession에 secure 가 true라고 되어있어서 (테스트환경은 http)
  expect(response.body.data.data.cart).toBeDefined();
});

it('return isEmailConfirmed equal to false after successful sign up', async () => {
  const response = await request(app)
    .post(AuthPath.withBase(AuthPath.SIGNUP))
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  // cookieSession에 secure 가 true라고 되어있어서 (테스트환경은 http)
  expect(response.body.data.data.isEmailConfirmed).toBeFalsy();
});
