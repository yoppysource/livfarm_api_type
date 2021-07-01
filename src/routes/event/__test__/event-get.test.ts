import { app } from '../../../../app';
import request from 'supertest';
import { EventPath } from '../event-routes-path';

it('get all event for user/non-user', async () => {
  await request(app).get(EventPath.withBase(EventPath.ALL)).expect(200);

  const adminToken = await global.getAdminToken();
  await request(app).post(EventPath.withBase(EventPath.ALL)).send({ url: 'test', imageUrl: 'dsds' }).set('authorization', `Bearer ${adminToken}`).expect(201);

  const res = await request(app).get(EventPath.withBase(EventPath.ALL)).expect(200);
  expect(res.body.data.data[0].url).toEqual('test');
});
