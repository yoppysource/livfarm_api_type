import express, { NextFunction, Request, Response } from 'express';
import asyncWrapper from 'async-wrapper-express-ts';

import { SharedController } from '../shared-controller';
import { EventDoc, Event } from '../../models/event';
import { verifyToken } from '../../middlewares/verify-token';
import { restrictToAdmin } from '../../middlewares/restrict-to-admin';
import { CartPath } from './cart-routes-path';
import { Cart, CartDoc } from '../../models/cart';
import { AppError } from '../../errors/app-error';
import { addItem, deleteItem, updateItem, updateMyCart } from './cart-controller';

const getMyCart = (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = req.user!.cart!;

    if (!cart) {
      return next(new AppError('존재하지 않는 정보입니다', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: cart,
      },
    });
  } catch (error) {
    console.log(error);
    return next(new AppError('오류가 발생했습니다', 500));
  }
};

// const setCartId = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     req.params.id = req.user!.cart!._id;
//   } catch (error) {
//     console.log(error);
//     return next(new AppError('오류가 발생했습니다', 500));
//   }
// };

const router = express.Router();
router.use(verifyToken);
router
  .route(CartPath.MY)
  // Store 정보가 달라졌을때
  .patch(asyncWrapper(updateMyCart))
  .get(getMyCart);
// Add modify quantity delete
router
  .route(CartPath.MY + CartPath.Item)
  .post(asyncWrapper(addItem))
  .patch(asyncWrapper(updateItem));
router.route(CartPath.MY + CartPath.Item + CartPath.DELETE).post(asyncWrapper(deleteItem));
// router.post(asyncWrapper(SharedController.createOne<EventDoc>(Event)));
// router
//   .route(EventPath.ID)
//   .patch(asyncWrapper(SharedController.updateOne<EventDoc>(Event)))
//   .delete(asyncWrapper(SharedController.deleteOne<EventDoc>(Event)));

export { router as cartRouter };
