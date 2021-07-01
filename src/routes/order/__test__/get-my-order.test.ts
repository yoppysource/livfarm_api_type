import { app } from '../../../../app';
import request from 'supertest';
import { Inventory } from '../../../models/inventory';
import { InventoryPath } from '../../inventory/inventory-routes-path';
import { CartPath } from '../../cart/cart-routes-path';
import { UserPath } from '../../user/user-routes-path';
import { OrderPath } from '../order-routes-path';
it('can get order', async () => {
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

  const res4 = await request(app)
    .post(CartPath.withBase(CartPath.MY + CartPath.Item))
    .set('authorization', `Bearer ${token}`)
    .send({
      inventory: notHiddenId2,
      quantity: 2,
    })
    .expect(200);

  expect(res4.body.data.data.items[0].quantity).toEqual(3);
  expect(res4.body.data.data.items[1].quantity).toEqual(2);

  const res5 = await request(app).get(UserPath.withBase(UserPath.ME)).set('authorization', `Bearer ${token}`).send().expect(200);

  await request(app)
    .post(OrderPath.withBase(OrderPath.MY))
    .set('authorization', `Bearer ${token}`)
    .send({
      _id: Date.now().toString(),
      address: {
        address: 'address',
        addressDetail: 'detail',
        postcode: '21321',
      },
      orderRequestMessage: 'request',
      scheduledDate: 12993129321,
      bookingOrderMessage: 'hello',
      payMethod: 'card',
      paidAmount: res5.body.data.data.cart.totalPrice,
      user: res5.body.data.data.id,
      option: 'delivery',
      cart: res5.body.data.data.cart.id,
    })
    .expect(201);

  const res6 = await request(app).get(UserPath.withBase(UserPath.ME)).set('authorization', `Bearer ${token}`).send().expect(200);

  expect(res6.body.data.data.point).toBeGreaterThan(10);

  const res7 = await request(app).get(OrderPath.withBase(OrderPath.MY)).set('authorization', `Bearer ${token}`).expect(200);
  expect(res7.body.data.data.length).toBe(1);
});
