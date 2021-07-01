import request from 'supertest';
import { app } from '../../../../app';
import { CouponPath } from '../coupon-routes-path';

it('get all coupon only for admin', async () => {
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

  await request(app)
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

  await request(app)
    .post(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      code: 'test1',
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(201);

  const res2 = await request(app)
    .get(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${userToken}`)
    .send({
      code: 'test2',
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(403);

  const res = await request(app)
    .get(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      code: 'test2',
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(200);

  expect(res.body.length).toEqual(2);
});
