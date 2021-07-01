import { app } from '../../../../app';
import request from 'supertest';
import { Store } from '../../../models/store';
import { StorePath } from '../store-routes';

it('update store for admin', async () => {
  const stores = await Store.find({});
  const storeId = stores[0].id;
  await request(app)
    .patch(StorePath.withBase(StorePath.ID).replace(':id', storeId))
    .send({
      isOpenToday: false,
    })
    .expect(401);

  const adminToken = await global.getAdminToken();
  await request(app)
    .patch(StorePath.withBase(StorePath.ID).replace(':id', storeId))
    .send({
      isOpenToday: false,
    })
    .set('authorization', `Bearer ${adminToken}`)
    .expect(200);

  const res2 = await request(app).get(StorePath.withBase(StorePath.ID).replace(':id', storeId)).expect(200);
  expect(res2.body.data.data.isOpenToday).toEqual(false);
});
