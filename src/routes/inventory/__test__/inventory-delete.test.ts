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

  await request(app)
    .delete(InventoryPath.withBase(InventoryPath.ID).replace(':id', res1.body.data.data[0].id))
    .set('authorization', `Bearer ${userToken}`)
    .expect(403);

  const adminToken = await global.getAdminToken();
  await request(app)
    .delete(InventoryPath.withBase(InventoryPath.ID).replace(':id', res1.body.data.data[0].id))
    .set('authorization', `Bearer ${adminToken}`)
    .expect(204);
});
