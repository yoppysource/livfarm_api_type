import { app } from '../../../../app';
import request from 'supertest';
import { ProductPath } from '../product-routes';
import { Store } from '../../../models/store';
import { InventoryPath } from '../../inventory/inventory-routes-path';

it('update product only for admin', async () => {
  const userToken = await global.getTokenBySignup();
  const res = await request(app).get(ProductPath.withBase(ProductPath.ALL)).expect(200);

  await request(app)
    .patch(ProductPath.withBase(ProductPath.ID).replace(':id', res.body.data.data[3].id))
    .set('authorization', `Bearer ${userToken}`)
    .send({
      name: 'test',
    })
    .expect(403);
  const adminToken = await global.getAdminToken();
  const res3 = await request(app)
    .patch(ProductPath.withBase(ProductPath.ID).replace(':id', res.body.data.data[3].id))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      name: 'test',
    })
    .expect(200);

  console.log(res3.body.data.data);
  //for Product
  const res2 = await request(app).get(ProductPath.withBase(ProductPath.ALL)).expect(200);
  expect(res2.body.data.data[3].name).toEqual('test');
});
