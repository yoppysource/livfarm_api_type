import axios from 'axios';
import { NextFunction, Response, Request } from 'express';
import { AppError } from '../../errors/app-error';
import { Cart } from '../../models/cart';
import { Inventory } from '../../models/inventory';
import { Order } from '../../models/order';
import { User } from '../../models/user';
//@ts-ignore
import { sendAlimtalk } from '../../services/aligo_service';

const pointPercentage = 10;

const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  //find order by ID
  const docs = await Order.find({ user: req.user.id }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: docs.length,
    //when sending arrary
    data: {
      data: docs,
    },
  });
};

const getTokenFromIamPort = async () => {
  try {
    const response = await axios({
      url: 'https://api.iamport.kr/users/getToken',
      method: 'post', // POST method
      headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
      data: {
        imp_key: process.env.IMP_KEY, // REST API키
        imp_secret: process.env.IMP_SECRET, // REST API Secret
      },
    });
    if (response.status === 200) {
      return response.data.response.access_token;
    }
  } catch (error) {
    console.log(error.response.data.message);
  }
};

const getDataFromIamPort = async (accessToken: string, merchantUID: string) => {
  try {
    const response = await axios({
      url: `https://api.iamport.kr/payments/find/${merchantUID}`,
      method: 'get', // POST method
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken,
      },
    });
    return response.data.response;
  } catch (error) {
    console.log(error.response.data.message);
  }
};

const sendAlimTalkWhenPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await getTokenFromIamPort();
    const data = await getDataFromIamPort(token, req.body.merchant_uid);
    console.log(data);
    //@ts-ignore
    req.iamportData = data;
    const customData = JSON.parse(data.custom_data);
    console.log(customData);
    //@ts-ignore
    req.iamportData.customData = customData;
    await sendAlimtalk(req, res);
  } catch (error) {
    console.log(error);
  }
};

const updateInventory = async (cartID: string) => {
  const cart = await Cart.findById(cartID);
  for (const item of cart!.items) {
    const inventory = await Inventory.findById(item.inventory._id);
    if (inventory) {
      let newInventory = inventory!.inventory - item.quantity;
      if (newInventory < 0) newInventory = 0;
      inventory.set({ inventory: newInventory });
      await inventory.save();
    } else {
      throw new AppError('존재하지 않는 상품입니다.', 401);
    }
  }
};

const createMyOrder = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user.point < req.body.usedPoint ?? 0) return next(new AppError('포인트 사용 관련 오류가 발생했습니다', 403));
  const doc = await Order.create(req.body);
  const addPoint = Math.round(doc.paidAmount / pointPercentage);
  const usedPoint = doc.usedPoint;
  const newPoint = addPoint - usedPoint;
  await updateInventory(req.body.cart);
  const newCart = await Cart.create({});
  await User.findByIdAndUpdate(req.body.user, { cart: newCart.id, $inc: { point: newPoint } });

  if (req.body.coupon && req.body.coupon.code) {
    await User.findOneAndUpdate(
      { _id: req.user._id, coupons: { $elemMatch: { code: req.body.coupon.code } } },
      { $set: { 'coupons.$.used': true } },
      { new: true },
    );
  }

  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
};

export { getMyOrders, createMyOrder, sendAlimTalkWhenPaid };
