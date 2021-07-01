import request from 'supertest';
import { app } from '../../../../app';
import { ProductPath } from '../../product/product-routes';
import { ReviewPath } from '../review-routes';

it('is not allowed for unlogined user to create review', async () => {
  const res = await request(app).get(ProductPath.withBase(ProductPath.ALL)).expect(200);

  const sampleProductId = res.body.data.data[3].id;

  await request(app)
    .post((ProductPath.BASE + ReviewPath.FROM_PRODUCT).replace(':productId', sampleProductId))
    .send({ review: '1234', rating: 3 })
    .expect(401);

  const userToken = await global.getTokenBySocialLogin();

  await request(app)
    .post((ProductPath.BASE + ReviewPath.FROM_PRODUCT).replace(':productId', sampleProductId))
    .set('authorization', `Bearer ${userToken}`)
    .send({ review: '1234', rating: 2 })
    .expect(201);

  await request(app)
    .post((ProductPath.BASE + ReviewPath.FROM_PRODUCT).replace(':productId', sampleProductId))
    .set('authorization', `Bearer ${userToken}`)
    .send({ review: '1234', rating: 4 })
    .expect(201);
  const res2 = await request(app).get(ProductPath.withBase(ProductPath.ID).replace(':id', sampleProductId)).expect(200);
  expect(res2.body.data.data.ratingsAverage).toEqual((2 + 4) / 2);
});

it('can create reivew for each product', async () => {
  const res = await request(app).get(ProductPath.withBase(ProductPath.ALL)).expect(200);

  const sampleProductId = res.body.data.data[3].id;

  const userToken = await global.getTokenBySocialLogin();

  await request(app)
    .post((ProductPath.BASE + ReviewPath.FROM_PRODUCT).replace(':productId', sampleProductId))
    .set('authorization', `Bearer ${userToken}`)
    .send({ review: '1234', rating: 2 })
    .expect(201);

  await request(app)
    .post((ProductPath.BASE + ReviewPath.FROM_PRODUCT).replace(':productId', sampleProductId))
    .set('authorization', `Bearer ${userToken}`)
    .send({ review: '1234', rating: 4 })
    .expect(201);
  const res2 = await request(app).get(ProductPath.withBase(ProductPath.ID).replace(':id', sampleProductId)).expect(200);
  expect(res2.body.data.data.ratingsAverage).toEqual((2 + 4) / 2);
});
//   const stores = await Store.find({});
//   const storeId = stores[0].id;
//   const userToken = await global.getTokenBySocialLogin();

//   const res1 = await request(app)
//     .get(InventoryPath.withBase(InventoryPath.STORE_ID).replace(':storeId', storeId))
//     .set('authorization', `Bearer ${userToken}`)
//     .expect(200);
//   const beforeLength = res1.body.length;

//   await request(app)
//     .post(InventoryPath.withBase(InventoryPath.ALL))
//     .set('authorization', `Bearer ${userToken}`)
//     .send({ product: res1.body.data.data[0].product.id, store: storeId, hidden: false })
//     .expect(403);

//   const adminToken = await global.getAdminToken();
//   const res = await request(app)
//     .post(InventoryPath.withBase(InventoryPath.ALL))
//     .set('authorization', `Bearer ${adminToken}`)
//     .send({ product: res1.body.data.data[0].product.id, store: storeId, hidden: false })
//     .expect(201);

//   const res2 = await request(app)
//     .get(InventoryPath.withBase(InventoryPath.STORE_ID).replace(':storeId', storeId))
//     .set('authorization', `Bearer ${userToken}`)
//     .expect(200);

//   expect(beforeLength + 1).toEqual(res2.body.length);
