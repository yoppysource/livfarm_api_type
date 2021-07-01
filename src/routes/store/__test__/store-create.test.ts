import { app } from '../../../../app';
import request from 'supertest';
import { Store } from '../../../models/store';
import { StorePath } from '../store-routes';

it('create stores for admin', async () => {
  await request(app)
    .post(StorePath.withBase(StorePath.ALL))
    .send({ name: 'test', location: [100, 100] })
    .expect(401);

  const adminToken = await global.getAdminToken();
  await request(app)
    .post(StorePath.withBase(StorePath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      name: 'test',
      location: {
        coordinates: [10, 10],
      },
    })
    .expect(201);
  const res1 = await request(app).get(StorePath.withBase(StorePath.ALL)).set('authorization', `Bearer ${adminToken}`).expect(200);
  expect(res1.body.length).toEqual(3);
});
