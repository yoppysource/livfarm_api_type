import request from 'supertest';
import { app } from '../../../../app';
import { UserPath } from '../user-routes-path';

it('can update user information', async () => {
  const token = await global.getTokenBySignup();
  await request(app).patch(UserPath.withBase(UserPath.UPDATE_ME)).set('authorization', `Bearer ${token}`).send({ phoneNumber: '01012341234' }).expect(200);
  const res = await request(app).get(UserPath.withBase(UserPath.ME)).set('authorization', `Bearer ${token}`).send().expect(200);
  expect(res.body.data.data.phoneNumber).toStrictEqual('01012341234');
});

it('cannot update user information about roles', async () => {
  const token = await global.getTokenBySignup();
  await request(app)
    .patch(UserPath.withBase(UserPath.UPDATE_ME))
    .set('authorization', `Bearer ${token}`)
    .send({ phoneNumber: '01012341234', role: 'admin' })
    .expect(403);
});

it('can delete my information from the server', async () => {
  const token = await global.getTokenBySignup();
  await request(app).delete(UserPath.withBase(UserPath.DELETE_ME)).set('authorization', `Bearer ${token}`).send().expect(204);
  await request(app).get(UserPath.withBase(UserPath.ME)).set('authorization', `Bearer ${token}`).send().expect(401);
});
