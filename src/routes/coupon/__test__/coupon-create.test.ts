import request from 'supertest';
import { app } from '../../../../app';
import { CouponPath } from '../coupon-routes-path';

it('create limited coupon only for admin', async () => {
  const userToken = await global.getTokenBySignup();
  const adminToken = await global.getAdminToken();

  await request(app)
    .post(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${userToken}`)
    .send({
      code: 'test',
      limit: 10,
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(403);

  const res = await request(app)
    .post(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      code: 'test',
      limit: 10,
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(201);
  console.log(res.body.data.data);
});
it('create unlimite coupon only for admin', async () => {
  const userToken = await global.getTokenBySignup();
  const adminToken = await global.getAdminToken();

  await request(app)
    .post(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${userToken}`)
    .send({
      code: 'test',
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(403);

  const res = await request(app)
    .post(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      code: 'test',
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(201);
  console.log(res.body.data.data);
});
