import { app } from '../../../../app';
import request from 'supertest';
import { ProductPath } from '../product-routes';

it('create product only for admin', async () => {
  const userToken = await global.getTokenBySignup();
  await request(app)
    .post(ProductPath.withBase(ProductPath.ALL))
    .set('authorization', `Bearer ${userToken}`)
    .send({
      name: 'test',
    })
    .expect(403);

  const adminToken = await global.getAdminToken();
  const res = await request(app)
    .post(ProductPath.withBase(ProductPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      name: 'test',
      nameInEng: 'hello',
    })
    .expect(201);
  console.log(res.body);
});
