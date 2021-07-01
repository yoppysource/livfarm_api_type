import { app } from '../../../../app';
import request from 'supertest';
import { EventPath } from '../event-routes-path';

it('create event for only for admin', async () => {
  await request(app).post(EventPath.withBase(EventPath.ALL)).send({ url: 'test', imageUrl: 'dsds' }).expect(401);

  const adminToken = await global.getAdminToken();
  await request(app).post(EventPath.withBase(EventPath.ALL)).send({ url: 'test', imageUrl: 'dsds' }).set('authorization', `Bearer ${adminToken}`).expect(201);
});
