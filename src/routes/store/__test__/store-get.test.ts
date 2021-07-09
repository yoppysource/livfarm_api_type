import { app } from '../../../../app';
import request from 'supertest';
import { Store } from '../../../models/store';
import { StorePath } from '../store-routes';

it('get a store for user/non-user', async () => {
  const stores = await Store.find({});
  const storeId = stores[0].id;

  const res = await request(app).get(StorePath.withBase(StorePath.ID).replace(':id', storeId)).expect(200);
  console.log(res.body.data.data);
});

// it('get all stores for admin', async () => {
//   await request(app).get(StorePath.withBase(StorePath.ALL)).expect(401);

//   const adminToken = await global.getAdminToken();
//   const res = await request(app).get(StorePath.withBase(StorePath.ALL)).set('authorization', `Bearer ${adminToken}`).expect(200);

//   expect(res.body.length).toEqual(2);
// });
