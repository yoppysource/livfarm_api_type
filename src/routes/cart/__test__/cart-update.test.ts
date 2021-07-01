import request from 'supertest';
import { app } from '../../../../app';
import { Inventory } from '../../../models/inventory';
import { Store } from '../../../models/store';
import { InventoryPath } from '../../inventory/inventory-routes-path';
import { StorePath } from '../../store/store-routes';
import { CartPath } from '../cart-routes-path';

it('update cart based on store', async () => {
  const token = await global.getTokenBySignup();
  const stores = await Store.find({}).populate({
    path: 'inventories',
    model: Inventory,
    match: { hidden: { $ne: true } },
    options: { sort: { isOnShelf: -1, rank: 1 } },
  });

  const store0 = stores[0]._id;
  const store1 = stores[1]._id;
  await request(app).patch(CartPath.withBase(CartPath.MY)).set('authorization', `Bearer ${token}`).send({ store: store0 }).expect(200);

  await request(app)
    .post(CartPath.withBase(CartPath.MY + CartPath.Item))
    .set('authorization', `Bearer ${token}`)
    .send({
      inventory: stores[0].inventories[0]._id,
      quantity: 1,
    })
    .expect(200);

  const res = await request(app)
    .post(CartPath.withBase(CartPath.MY + CartPath.Item))
    .set('authorization', `Bearer ${token}`)
    .send({
      inventory: stores[0].inventories[1]._id,
      quantity: 3,
    })
    .expect(200);

  expect(res.body.data.data.items.length).toEqual(2);

  const res1 = await request(app).patch(CartPath.withBase(CartPath.MY)).set('authorization', `Bearer ${token}`).send({ store: store1 }).expect(200);
  expect(res1.body.data.data.items.length).toEqual(0);
});
