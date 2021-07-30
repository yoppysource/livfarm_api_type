import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from '../../app';
import request from 'supertest';
import { AuthPath } from '../routes/auth/auth-routes-path';
import { User } from '../models/user';
import fs from 'fs';
import { Product } from '../models/product';
import { Inventory } from '../models/inventory';
import { Store } from '../models/store';
declare global {
  namespace NodeJS {
    interface Global {
      getTokenBySignup(): Promise<string>;
      getTokenBySocialLogin(): Promise<string>;
      getCookie(): Promise<string[]>;
      getAdminToken(): Promise<string>;
    }
  }
}

let mongo: any;
function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

const randomBoolean = () => Math.random() >= 0.5;

beforeAll(async () => {
  try {
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true,
    });
    const products = JSON.parse(fs.readFileSync(`./dev-data/products.json`, 'utf-8'));
    await Product.create(products);
    const store1 = await Store.create(
      Store.build({
        name: '하대원 리브팜',
        takeOut: false,
        address: '성남시 중원구 하대원동 217번길 5 지하 1층',
        location: {
          coordinates: [127.142202931285, 37.42874326246],
        },
        isOpenSaturday: false,
        isOpenSunday: false,
        hidden: false,
        isOpenToday: true,
        openHourStr: '09:00',
        closeHourStr: '18:00',
        maxDistance: 1500,
      }),
    );
    const store2 = await Store.create(
      Store.build({
        name: '수지 리브팜',
        takeOut: true,
        address: '경기 용인시 수지구 성복1로 80 서희스타힐스 102동 116호',
        location: {
          coordinates: [127.071267962717, 37.3156726620216],
        },
        isOpenSaturday: false,
        isOpenSunday: false,
        hidden: false,
        isOpenToday: true,
        openHourStr: '09:00',
        closeHourStr: '18:00',
        maxDistance: 1500,
      }),
    );

    const productArray = await Product.find({});
    for (let product of productArray) {
      await Inventory.create(
        Inventory.build({
          store: store1.id,
          product: product.id,
          inventory: randomNumber(0, 10),
          rank: randomNumber(0, 50),
          hidden: randomBoolean(),
        }),
      );
      await Inventory.create(
        Inventory.build({
          store: store2.id,
          product: product.id,
          inventory: randomNumber(0, 10),
          rank: randomNumber(0, 50),
          hidden: randomBoolean(),
        }),
      );
    }
    console.log('data successfully loaded!');
  } catch (error) {
    console.log(error);
  }
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    if (collection.collectionName == 'products' || collection.collectionName == 'inventories' || collection.collectionName == 'stores') continue;
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  try {
    await mongo.stop();
    await mongoose.connection.close();
  } catch (error) {
    console.log(error);
  }
});

//Set up the global function
global.getTokenBySignup = async () => {
  const email = `test@test.com`;
  const password = 'password';
  const response = await request(app).post(AuthPath.withBase(AuthPath.SIGNUP)).send({ email, password });
  return response.body.token;
};

global.getTokenBySocialLogin = async () => {
  const snsId = 'dadsd';
  const email = 'dsadas@naver.com';
  const platform = 'kakao';
  const response = await request(app).post(AuthPath.withBase(AuthPath.SOCIAL_LOGIN)).send({ snsId, email, platform });
  return response.body.token;
};

global.getAdminToken = async () => {
  const email = 'admin@test.com';
  const password = 'password';
  const response = await request(app).post(AuthPath.withBase(AuthPath.SIGNUP)).send({ email, password });

  const user = await User.findById(response.body.data.data.id);
  if (user) {
    user.role = 'admin';
    await user.save();
  }

  return response.body.token;
};

// global.getCookie = async () => {
//   const email = 'test@test.com';
//   const password = 'password';
//   const response = await request(app).post('/api/users/signup').send({ email, password }).expect(201);
//   const cookie = response.get('Set-Cookie');
//   return cookie;
// };
