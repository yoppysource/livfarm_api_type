import request from 'supertest';
import { app } from '../../../../app';
import { Inventory } from '../../../models/inventory';
import { InventoryPath } from '../../inventory/inventory-routes-path';
import { CartPath } from '../cart-routes-path';

it('delete items from cart', async () => {
  const token = await global.getTokenBySignup();

  const notHiddenInventory = await Inventory.find({ hidden: { $ne: true } });
  const notHiddenId = notHiddenInventory[0].id;
  const notHiddenId2 = notHiddenInventory[1].id;

  const adminToken = await global.getAdminToken();
  await request(app)
    .patch(InventoryPath.withBase(InventoryPath.ID).replace(':id', notHiddenId))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      inventory: 10,
    })
    .expect(200);
  await request(app)
    .patch(InventoryPath.withBase(InventoryPath.ID).replace(':id', notHiddenId2))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      inventory: 12,
    })
    .expect(200);

  await request(app).get(InventoryPath.withBase(InventoryPath.ID).replace(':id', notHiddenId)).expect(200);

  await request(app)
    .post(CartPath.withBase(CartPath.MY + CartPath.Item))
    .set('authorization', `Bearer ${token}`)
    .send({
      inventory: notHiddenId,
      quantity: 2,
    })
    .expect(200);

  await request(app)
    .post(CartPath.withBase(CartPath.MY + CartPath.Item))
    .set('authorization', `Bearer ${token}`)
    .send({
      inventory: notHiddenId,
      quantity: 1,
    })
    .expect(200);

  const res = await request(app)
    .post(CartPath.withBase(CartPath.MY + CartPath.Item))
    .set('authorization', `Bearer ${token}`)
    .send({
      inventory: notHiddenId2,
      quantity: 2,
    })
    .expect(200);

  const res4 = await request(app)
    .post(CartPath.withBase(CartPath.MY + CartPath.Item + CartPath.DELETE))
    .set('authorization', `Bearer ${token}`)
    .send({
      id: res.body.data.data.items[1].id,
    })
    .expect(200);

  expect(res4.body.data.data.items.length).toEqual(1);
});
