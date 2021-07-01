import request from 'supertest';
import { app } from '../../../../app';
import { Inventory } from '../../../models/inventory';
import { InventoryPath } from '../../inventory/inventory-routes-path';
import { ProductPath } from '../../product/product-routes';
import { ReviewPath } from '../review-routes';

it('user can update review', async () => {
  const notHiddenInventory = await Inventory.find({ hidden: { $ne: true } });
  const id = notHiddenInventory[0]._id;
  const id2 = notHiddenInventory[1]._id;
  const res = await request(app).get(InventoryPath.withBase(InventoryPath.ID).replace(':id', id)).expect(200);
  const res3 = await request(app).get(InventoryPath.withBase(InventoryPath.ID).replace(':id', id2)).expect(200);

  const userToken = await global.getTokenBySocialLogin();
  const userToken2 = await global.getTokenBySignup();

  await request(app)
    .post((ProductPath.BASE + ReviewPath.FROM_PRODUCT).replace(':productId', res.body.data.data.product.id))
    .set('authorization', `Bearer ${userToken}`)
    .send({ review: '1234', rating: 1 })
    .expect(201);
  await request(app)
    .post((ProductPath.BASE + ReviewPath.FROM_PRODUCT).replace(':productId', res3.body.data.data.product.id))
    .set('authorization', `Bearer ${userToken}`)
    .send({ review: '1234', rating: 4 })
    .expect(201);
  await request(app)
    .post((ProductPath.BASE + ReviewPath.FROM_PRODUCT).replace(':productId', res.body.data.data.product.id))
    .set('authorization', `Bearer ${userToken2}`)
    .send({ review: '1234', rating: 3 })
    .expect(201);
  const res2 = await request(app).get(ProductPath.withBase(ReviewPath.FROM_PRODUCT).replace(':productId', res.body.data.data.product.id)).expect(200);
  console.log(res2.body.data.data[0].id);

  await request(app)
    .patch(ReviewPath.withBase(ReviewPath.ID).replace(':id', res2.body.data.data[0].id))
    .set('authorization', `Bearer ${userToken2}`)
    .send({ rating: 5 })
    .expect(200);

  const res4 = await request(app).get(ProductPath.withBase(ProductPath.ID).replace(':id', res.body.data.data.product.id)).send().expect(200);

  expect(res4.body.data.data.ratingsAverage).toEqual((5 + 3) / 2);
});
