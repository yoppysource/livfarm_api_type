import { app } from '../../../../app';
import request from 'supertest';
import { EventPath } from '../event-routes-path';

it('delete event for only admin', async () => {
  const adminToken = await global.getAdminToken();
  await request(app).post(EventPath.withBase(EventPath.ALL)).send({ url: 'test', imageUrl: 'dsds' }).set('authorization', `Bearer ${adminToken}`).expect(201);
  const res = await request(app).get(EventPath.withBase(EventPath.ALL)).expect(200);
  await request(app).delete(EventPath.withBase(EventPath.ID).replace(':id', res.body.data.data[0].id)).send({ url: 'test', imageUrl: 'dsds' }).expect(401);

  await request(app)
    .delete(EventPath.withBase(EventPath.ID).replace(':id', res.body.data.data[0].id))
    .send({ url: 'test', imageUrl: 'dsds' })
    .set('authorization', `Bearer ${adminToken}`)
    .expect(204);
});
