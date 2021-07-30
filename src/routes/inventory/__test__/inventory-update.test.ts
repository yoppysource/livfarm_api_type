import request from 'supertest';
import { app } from '../../../../app';
import { Inventory } from '../../../models/inventory';
import { Store } from '../../../models/store';
import { AuthPath } from '../../auth/auth-routes-path';
import { InventoryPath } from '../inventory-routes-path';

it('update inventory document only for admin', async () => {
  const stores = await Store.find({});
  const storeId = stores[0].id;
  const userToken = await global.getTokenBySocialLogin();

  const res1 = await request(app)
    .get(InventoryPath.withBase(InventoryPath.STORE_ID).replace(':storeId', storeId))
    .set('authorization', `Bearer ${userToken}`)
    .expect(200);
  const beforeLength = res1.body.length;

  await request(app)
    .patch(InventoryPath.withBase(InventoryPath.ID).replace(':id', res1.body.data.data[0].id))
    .set('authorization', `Bearer ${userToken}`)
    .send({
      hidden: true,
    })
    .expect(403);

  const adminToken = await global.getAdminToken();
  await request(app)
    .patch(InventoryPath.withBase(InventoryPath.ID).replace(':id', res1.body.data.data[0].id))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      hidden: true,
    })
    .expect(200);
});
