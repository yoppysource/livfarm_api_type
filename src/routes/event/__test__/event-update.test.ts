import { app } from '../../../../app';
import request from 'supertest';
import { EventPath } from '../event-routes-path';

it('update event only for admin', async () => {
  const adminToken = await global.getAdminToken();
  await request(app).post(EventPath.withBase(EventPath.ALL)).send({ url: 'test', imageUrl: 'dsds' }).set('authorization', `Bearer ${adminToken}`).expect(201);

  const res = await request(app).get(EventPath.withBase(EventPath.ALL)).expect(200);
  const storeId = res.body.data.data[0].id;
  await request(app)
    .patch(EventPath.withBase(EventPath.ID).replace(':id', storeId))
    .send({
      url: 'test2',
    })
    .set('authorization', `Bearer ${adminToken}`)
    .expect(200);
  const res2 = await request(app).get(EventPath.withBase(EventPath.ALL)).expect(200);

  expect(res2.body.data.data[0].url).toEqual('test2');
});
