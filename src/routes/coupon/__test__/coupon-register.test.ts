import { app } from '../../../../app';
import { CouponPath } from '../coupon-routes-path';
import request from 'supertest';
import { UserPath } from '../../user/user-routes-path';

it('register coupon when user type correct coupon code', async () => {
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

  const res1 = await request(app)
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

  const res2 = await request(app)
    .post(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      code: 'test1',
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(201);

  await request(app)
    .post(CouponPath.withBase(CouponPath.REGISTER_COUPON).replace(':code', res1.body.data.data.code))
    .set('authorization', `Bearer ${userToken}`)
    .expect(200);

  await request(app)
    .post(CouponPath.withBase(CouponPath.REGISTER_COUPON).replace(':code', res2.body.data.data.code))
    .set('authorization', `Bearer ${userToken}`)
    .expect(200);

  const res = await request(app).get(UserPath.withBase(UserPath.ME)).set('authorization', `Bearer ${userToken}`).send().expect(200);

  console.log(res.body.data.data);
  expect(res.body.data.data.coupons.length).toEqual(3);
});
it('will not register coupon when user type incorrect coupon code', async () => {
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

  const res1 = await request(app)
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

  const res2 = await request(app)
    .post(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      code: 'test1',
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(201);

  await request(app)
    .post(CouponPath.withBase(CouponPath.REGISTER_COUPON).replace(':code', 'uncorrect'))
    .set('authorization', `Bearer ${userToken}`)
    .expect(404);

  await request(app)
    .post(CouponPath.withBase(CouponPath.REGISTER_COUPON).replace(':code', res2.body.data.data.code))
    .set('authorization', `Bearer ${userToken}`)
    .expect(200);

  const res = await request(app).get(UserPath.withBase(UserPath.ME)).set('authorization', `Bearer ${userToken}`).send().expect(200);

  console.log(res.body.data.data);
  expect(res.body.data.data.coupons.length).toEqual(2);
});
it('will not register coupon when user type expired coupon code', async () => {
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

  const res1 = await request(app)
    .post(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      code: 'test',
      limit: 10,
      amount: 10000,
      expireDate: Date.now() - 10000,
      description: 'It is test coupon',
    })
    .expect(201);

  const res2 = await request(app)
    .post(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      code: 'test1',
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(201);

  await request(app)
    .post(CouponPath.withBase(CouponPath.REGISTER_COUPON).replace(':code', res1.body.data.data.code))
    .set('authorization', `Bearer ${userToken}`)
    .expect(404);

  await request(app)
    .post(CouponPath.withBase(CouponPath.REGISTER_COUPON).replace(':code', res2.body.data.data.code))
    .set('authorization', `Bearer ${userToken}`)
    .expect(200);

  const res = await request(app).get(UserPath.withBase(UserPath.ME)).set('authorization', `Bearer ${userToken}`).send().expect(200);

  console.log(res.body.data.data);
  expect(res.body.data.data.coupons.length).toEqual(2);
});
it('will not register coupon when coupon already registed in user', async () => {
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

  const res1 = await request(app)
    .post(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      code: 'test',
      limit: 1,
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(201);

  const res2 = await request(app)
    .post(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      code: 'test1',
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(201);
  const res3 = await request(app)
    .post(CouponPath.withBase(CouponPath.ALL))
    .set('authorization', `Bearer ${adminToken}`)
    .send({
      code: 'test3',
      limit: 0,
      amount: 10000,
      expireDate: Date.now() + 10000,
      description: 'It is test coupon',
    })
    .expect(201);

  await request(app)
    .post(CouponPath.withBase(CouponPath.REGISTER_COUPON).replace(':code', res2.body.data.data.code))
    .set('authorization', `Bearer ${userToken}`)
    .expect(200);

  await request(app)
    .post(CouponPath.withBase(CouponPath.REGISTER_COUPON).replace(':code', res2.body.data.data.code))
    .set('authorization', `Bearer ${userToken}`)
    .expect(403);

  await request(app)
    .post(CouponPath.withBase(CouponPath.REGISTER_COUPON).replace(':code', res3.body.data.data.code))
    .set('authorization', `Bearer ${userToken}`)
    .expect(404);

  await request(app)
    .post(CouponPath.withBase(CouponPath.REGISTER_COUPON).replace(':code', res1.body.data.data.code))
    .set('authorization', `Bearer ${userToken}`)
    .expect(200);

  const res = await request(app).get(UserPath.withBase(UserPath.ME)).set('authorization', `Bearer ${userToken}`).send().expect(200);

  console.log(res.body.data.data);
  expect(res.body.data.data.coupons.length).toEqual(3);

  const res5 = await request(app).get(CouponPath.withBase(CouponPath.ALL)).set('authorization', `Bearer ${adminToken}`).send().expect(200);

  expect(res5.body.data.data[0].limit).toEqual(0);
});
