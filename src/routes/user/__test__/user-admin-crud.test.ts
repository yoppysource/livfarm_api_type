import request from 'supertest';
import { app } from '../../../../app';
import { AuthPath } from '../../auth/auth-routes-path';
import { UserPath } from '../user-routes-path';

it('will not accept request based on user token', async () => {
  const token = await global.getTokenBySignup();
  await request(app).get(UserPath.withBase(UserPath.ALL)).set('authorization', `Bearer ${token}`).send().expect(403);
});

it('will accept request based on user admin ', async () => {
  await global.getTokenBySignup();
  const adminToken = await global.getAdminToken();
  const res = await request(app).get(UserPath.withBase(UserPath.ALL)).set('authorization', `Bearer ${adminToken}`).send().expect(200);
  expect(res.body.length).toBe(2);
});

it('allow read update delete method for user based on their admin token', async () => {
  const response = await request(app)
    .post(AuthPath.withBase(AuthPath.SIGNUP))
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  const userId = response.body.data.data.id;
  const adminToken = await global.getAdminToken();

  await request(app)
    .patch(UserPath.withBase(UserPath.ID).replace(':id', userId))
    .set('authorization', `Bearer ${adminToken}`)
    .send({ phoneNumber: '01012341234' })
    .expect(200);
  const res = await request(app).get(UserPath.withBase(UserPath.ID).replace(':id', userId)).set('authorization', `Bearer ${adminToken}`).send().expect(200);
  expect(res.body.data.data.phoneNumber).toStrictEqual('01012341234');
  await request(app).delete(UserPath.withBase(UserPath.ID).replace(':id', userId)).set('authorization', `Bearer ${adminToken}`).send().expect(204);
});
