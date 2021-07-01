import { NextFunction, Response, Request } from 'express';
import { AppError } from '../../errors/app-error';
import { Cart, CartDoc } from '../../models/cart';
import { Inventory } from '../../models/inventory';
import { Product } from '../../models/product';
import { inventoryRouter } from '../inventory/inventory-routes';

const updateMyCart = async (req: Request, res: Response, next: NextFunction) => {
  const cartId = req.user.cart._id;
  let cart = await Cart.findOne(cartId);
  if (!cart) {
    return next(new AppError('유효하지 않은 요청입니다.', 401));
  }
  //store가 변할 경우
  if (req.body.store) {
    if (req.body.store !== cart.store) {
      cart.items = [];
      cart.store = req.body.store;
    } else {
      cart.store = req.body.store;
    }
    await cart.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: cart,
    },
  });
};

const addItem = async (req: Request, res: Response, next: NextFunction) => {
  const { inventory, quantity } = req.body;

  if (!inventory || !quantity) {
    return next(new AppError('유효하지 않은 요청입니다.', 401));
  }

  const cartId = req.user.cart._id;
  let cart = await Cart.findOne(cartId);

  if (!cart) {
    return next(new AppError('유효하지 않은 요청입니다.', 401));
  }
  let isDuplicated = false;
  let isShortage = false;
  cart.items.forEach((item) => {
    if (item.inventory._id.toString() === inventory) {
      isDuplicated = true;
      item.quantity += quantity;
      if (item.quantity > item.inventory.inventory) {
        isShortage = true;
      }
    }
  });

  if (isShortage) {
    return next(new AppError('재고가 부족합니다', 401));
  }

  if (!isDuplicated) {
    cart.items.push({ inventory, quantity });
  }

  await cart.save();

  await cart
    .populate({
      path: 'items.inventory',
      model: Inventory,
    })
    .execPopulate();

  res.status(200).json({
    status: 'success',
    data: {
      data: cart,
    },
  });
};

const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body;
  if (!id) {
    return next(new AppError('유효하지 않은 요청입니다.', 401));
  }
  const cartId = req.user.cart._id;
  let cart = await Cart.findByIdAndUpdate(cartId, { $pull: { items: { _id: req.body.id } } }, { new: true, multi: true });

  res.status(200).json({
    status: 'success',
    data: {
      data: cart,
    },
  });
};

const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  const { id, quantity } = req.body;
  if (!id || !quantity) {
    return next(new AppError('유효하지 않은 요청입니다.', 401));
  }
  const cartId = req.user.cart._id;
  let cart = await Cart.findOneAndUpdate({ _id: cartId, items: { $elemMatch: { _id: id } } }, { $set: { 'items.$.quantity': quantity } }, { new: true });

  res.status(200).json({
    status: 'success',
    data: {
      data: cart,
    },
  });
};

export { updateMyCart, addItem, deleteItem, updateItem };
