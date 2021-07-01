import request from 'supertest';
import { app } from '../../../../app';
import { AuthPath } from '../auth-routes-path';

it('retures a 201 on successful social login first time', async () => {
  await request(app)
    .post(AuthPath.withBase(AuthPath.SOCIAL_LOGIN))
    .send({
      snsId: 'sdsdafwcdsc',
      platform: 'kakao',
      email: 'kakao@test.com',
    })
    .expect(201);
});

it('retures a 200 on successful social login with exist account', async () => {
  await request(app)
    .post(AuthPath.withBase(AuthPath.SOCIAL_LOGIN))
    .send({
      snsId: 'sdsdafwcdsc',
      platform: 'kakao',
      email: 'kakao@test.com',
    })
    .expect(201);

  await request(app)
    .post(AuthPath.withBase(AuthPath.SOCIAL_LOGIN))
    .send({
      snsId: 'sdsdafwcdsc',
      platform: 'kakao',
      email: 'kakao@test.com',
    })
    .expect(200);
});

it('return isEmailConfirmed equal to true after successful social login', async () => {
  const response = await request(app)
    .post(AuthPath.withBase(AuthPath.SOCIAL_LOGIN))
    .send({
      snsId: 'sdsdafwcdsc',
      platform: 'apple',
      email: 'apple@test.com',
    })
    .expect(201);

  // cookieSession에 secure 가 true라고 되어있어서 (테스트환경은 http)
  expect(response.body.data.data.isEmailConfirmed).toBeTruthy();
});

it('return error after using the same email with different platform for social login', async () => {
  await request(app)
    .post(AuthPath.withBase(AuthPath.SOCIAL_LOGIN))
    .send({
      snsId: 'sdsdafwcdsc',
      platform: 'apple',
      email: 'apple@test.com',
    })
    .expect(201);

  const response = await request(app)
    .post(AuthPath.withBase(AuthPath.SOCIAL_LOGIN))
    .send({
      snsId: 'sdsdafwcdsc',
      platform: 'kakao',
      email: 'apple@test.com',
    })
    .expect(400);
  console.log(response.body);
});
