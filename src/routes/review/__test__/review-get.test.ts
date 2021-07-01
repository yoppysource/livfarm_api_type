import request from 'supertest';
import { app } from '../../../../app';
import { Inventory } from '../../../models/inventory';
import { InventoryPath } from '../../inventory/inventory-routes-path';
import { ProductPath } from '../../product/product-routes';
import { ReviewPath } from '../review-routes';

it('review must be populated based on product', async () => {
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
  expect(res2.body.data.data.length).toEqual(2);
});
it('user can see review what that wrote', async () => {
  const res = await request(app).get(ProductPath.withBase(ProductPath.ALL)).expect(200);

  const sampleProductId1 = res.body.data.data[2].id;
  const sampleProductId2 = res.body.data.data[3].id;

  const userToken = await global.getTokenBySocialLogin();
  const userToken2 = await global.getTokenBySignup();

  await request(app)
    .post((ProductPath.BASE + ReviewPath.FROM_PRODUCT).replace(':productId', sampleProductId2))
    .set('authorization', `Bearer ${userToken}`)
    .send({ review: '1234', rating: 1 })
    .expect(201);

  await request(app)
    .post((ProductPath.BASE + ReviewPath.FROM_PRODUCT).replace(':productId', sampleProductId2))
    .set('authorization', `Bearer ${userToken2}`)
    .send({ review: '1234', rating: 3 })
    .expect(201);

  await request(app)
    .post((ProductPath.BASE + ReviewPath.FROM_PRODUCT).replace(':productId', sampleProductId1))
    .set('authorization', `Bearer ${userToken}`)
    .send({ review: '1234', rating: 2 })
    .expect(201);

  await request(app)
    .post((ProductPath.BASE + ReviewPath.FROM_PRODUCT).replace(':productId', sampleProductId1))
    .set('authorization', `Bearer ${userToken2}`)
    .send({ review: '1234', rating: 4 })
    .expect(201);
  const res1 = await request(app).get(ReviewPath.withBase(ReviewPath.MY)).set('authorization', `Bearer ${userToken2}`).expect(200);
  expect(res1.body.length).toEqual(2);
});
