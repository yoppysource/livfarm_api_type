import request from 'supertest';
import { app } from '../../../../app';
import { Store } from '../../../models/store';

import { InventoryPath } from '../inventory-routes-path';

it('delete inventory document only for admin', async () => {
  const stores = await Store.find({});
  const storeId = stores[0].id;
  const userToken = await global.getTokenBySocialLogin();

  const res1 = await request(app)
    .get(InventoryPath.withBase(InventoryPath.STORE_ID).replace(':storeId', storeId))
    .set('authorization', `Bearer ${userToken}`)
    .expect(200);
  const beforeLength = res1.body.length;

  await request(app)
    .post(InventoryPath.withBase(InventoryPath.ALL))
    .set('authorization', `Bearer ${userToken}`)
    .send({ product: res1.body.data.data[0].product.id, store: storeId, hidden: false })
    .expect(403);

  const adminToken = await global.getAdminToken();
  const res = await request(app)
    .post(InventoryPath.withBase(InventoryPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({ product: res1.body.data.data[0].product.id, store: storeId, hidden: false })
    .expect(201);

  const res2 = await request(app)
    .get(InventoryPath.withBase(InventoryPath.STORE_ID).replace(':storeId', storeId))
    .set('authorization', `Bearer ${userToken}`)
    .expect(200);

  expect(beforeLength + 1).toEqual(res2.body.length);
});
