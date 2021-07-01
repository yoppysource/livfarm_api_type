import { app } from '../../../../app';
import request from 'supertest';
import { StorePath } from '../store-routes';

it('get store and populated docs when user send address', async () => {
  const res = await request(app).post(StorePath.withBase(StorePath.FROM_LOCATION)).send({ address: '성남시 하대원동' }).expect(200);

  expect(res.body.data.data.inventories.length === 0).toEqual(false);
});

it('get store and populated docs when user send geolocation', async () => {
  const res = await request(app)
    .post(StorePath.withBase(StorePath.FROM_LOCATION))
    .send({ coordinates: [127.071267962717, 37.3156726620216] })
    .expect(200);
  expect(res.body.isPossibleToBuy).toEqual(true);
  expect(res.body.data.data.inventories.length === 0).toEqual(false);
});

it('get store and populated docs when user send geolocation and address', async () => {
  const res = await request(app)
    .post(StorePath.withBase(StorePath.FROM_LOCATION))
    .send({ address: '성남시 하대원동', coordinates: [127.071267962717, 37.3156726620216] })
    .expect(200);

  expect(res.body.isPossibleToBuy).toEqual(true);

  expect(res.body.data.data.inventories.length === 0).toEqual(false);
});

it('get store and populated docs when user send address even user cannot buy it', async () => {
  const res = await request(app).post(StorePath.withBase(StorePath.FROM_LOCATION)).send({ address: '유성구 지족동' }).expect(200);

  expect(res.body.data.data.inventories.length === 0).toEqual(false);
  expect(res.body.isPossibleToBuy).toEqual(false);
});

it('get store and populated docs when user send geolocation even user cannot buy it', async () => {
  const res = await request(app)
    .post(StorePath.withBase(StorePath.FROM_LOCATION))
    .send({ coordinates: [127.1024342, 36.3056726621] })
    .expect(200);

  expect(res.body.data.data.inventories.length === 0).toEqual(false);
  expect(res.body.isPossibleToBuy).toEqual(false);
});
