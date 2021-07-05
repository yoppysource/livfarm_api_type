import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../src/models/product";
import { User } from "../src/models/user";
import { Order } from "../src/models/order";
import { Cart } from "../src/models/cart";
import { Review } from "../src/models/review";
import { Inventory } from "../src/models/inventory";
import { Store } from "../src/models/store";
import { Event } from "../src/models/event";


dotenv.config({ path: "../config.env" });
function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

const randomBoolean = () => Math.random() >= 0.5;

const DB = process.env.DATABASE!.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD!,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful"));

// Read JSON FILE
//import data into DB

const deleteData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    await User.deleteMany();
    await Inventory.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    await Review.deleteMany();
    await Store.deleteMany();
    console.log("data successfully deleted!");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const importData = async () => {
  try {
    const products = JSON.parse(fs.readFileSync(`./products.json`, 'utf-8'));
    await Product.create(products);
    const store1 = await Store.create(
      Store.build({
        name: '하대원 리브팜',
        takeOut: false,
        address: '성남시 중원구 하대원동 217번길 5 지하 1층',
        location: {
          coordinates: [127.142202931285, 37.42874326246],
        },
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
      }),
    );

    const productArray = await Product.find({});
    for (let product of productArray) {
      console.log(product.id);
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
  process.exit();
};

const importEvent = async () => {
  try {
    const events = JSON.parse(fs.readFileSync(`./events.json`, 'utf-8'));
    await Event.create(events);
    console.log('data successfully loaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION


if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else if(process.argv[2] === "--import-events"){
  importEvent();
}

console.log(process.argv);
