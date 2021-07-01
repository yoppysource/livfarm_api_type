import { app } from '../../../../app';
import request from 'supertest';
import { ProductPath } from '../product-routes';

it('delete product only for admin', async () => {
  const userToken = await global.getTokenBySignup();
  const res = await request(app).get(ProductPath.withBase(ProductPath.ALL)).expect(200);

  await request(app)
    .delete(ProductPath.withBase(ProductPath.ID).replace(':id', res.body.data.data[3].id))
    .set('authorization', `Bearer ${userToken}`)
    .expect(403);
  const adminToken = await global.getAdminToken();
  await request(app)
    .delete(ProductPath.withBase(ProductPath.ID).replace(':id', res.body.data.data[3].id))
    .set('authorization', `Bearer ${adminToken}`)
    .expect(204);
});
