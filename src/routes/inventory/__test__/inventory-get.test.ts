import request from 'supertest';
import { app } from '../../../../app';
import { Inventory } from '../../../models/inventory';
import { Store } from '../../../models/store';
import { AuthPath } from '../../auth/auth-routes-path';
import { InventoryPath } from '../inventory-routes-path';

it('get all inventories', async () => {
  const adminToken = await global.getAdminToken();
  const res = await request(app).get(InventoryPath.withBase(InventoryPath.ALL)).set('authorization', `Bearer ${adminToken}`).expect(200);
  console.log(res.body.length);
});

it('will not allow getting all inventories for user', async () => {
  const userToken = await global.getTokenBySocialLogin();
  await request(app).get(InventoryPath.withBase(InventoryPath.ALL)).set('authorization', `Bearer ${userToken}`).expect(403);
});

it('get inventory query based on store', async () => {
  const stores = await Store.find({});
  const storeId = stores[0].id;
  console.log(storeId);
  const userToken = await global.getTokenBySocialLogin();
  const res = await request(app)
    .get(InventoryPath.withBase(InventoryPath.STORE_ID).replace(':storeId', storeId))
    .set('authorization', `Bearer ${userToken}`)
    .expect(200);
  console.log(res.body.length);

  const storeId2 = stores[1].id;
  console.log(storeId);
  const res2 = await request(app)
    .get(InventoryPath.withBase(InventoryPath.STORE_ID).replace(':storeId', storeId2))
    .set('authorization', `Bearer ${userToken}`)
    .expect(200);
  console.log(res2.body.length);
});

it('get inventory based on ID', async () => {
  const token = global.getTokenBySignup();

  const hiddenInventory = await Inventory.find({ hidden: { $ne: false } });
  const hiddenId = hiddenInventory[0].id;

  const notHiddenInventory = await Inventory.find({ hidden: { $ne: true } });
  const notHiddenId = notHiddenInventory[0].id;

  await request(app).get(InventoryPath.withBase(InventoryPath.ID).replace(':id', hiddenId)).expect(401);
  const res = await request(app).get(InventoryPath.withBase(InventoryPath.ID).replace(':id', notHiddenId)).expect(200);

  console.log(res.body.data.data);
});
