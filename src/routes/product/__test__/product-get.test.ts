import { app } from '../../../../app';
import request from 'supertest';
import { ProductPath } from '../product-routes';
it('get all products', async () => {
  const res = await request(app).get(ProductPath.withBase(ProductPath.ALL)).expect(200);
  expect(res.body.data.data[0]).toBeInstanceOf(Object);
});

it('get one product', async () => {
  const res = await request(app).get(ProductPath.withBase(ProductPath.ALL)).expect(200);
  await request(app).get(ProductPath.withBase(ProductPath.ID).replace(':id', res.body.data.data[3].id)).expect(200);
});
