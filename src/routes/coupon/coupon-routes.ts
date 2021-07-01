import express from 'express';
import asyncWrapper from 'async-wrapper-express-ts';

import { SharedController } from '../shared-controller';
import { EventDoc, Event } from '../../models/event';
import { verifyToken } from '../../middlewares/verify-token';
import { restrictToAdmin } from '../../middlewares/restrict-to-admin';
import { CouponPath } from './coupon-routes-path';
import { Coupon, CouponDoc } from '../../models/coupon';
import { registerCoupon } from './coupon-controller';

const router = express.Router();
//Client
router.use(verifyToken);
router.route(CouponPath.REGISTER_COUPON).post(asyncWrapper(registerCoupon));

//Admin
router.use(restrictToAdmin);
router
  .route(CouponPath.ALL)
  .get(asyncWrapper(SharedController.getAll<CouponDoc>(Coupon)))
  .post(asyncWrapper(SharedController.createOne<CouponDoc>(Coupon)));

router
  .route(CouponPath.ID)
  .get(asyncWrapper(SharedController.getOne<CouponDoc>(Coupon)))
  .patch(asyncWrapper(SharedController.updateOne<CouponDoc>(Coupon)))
  .delete(asyncWrapper(SharedController.deleteOne<CouponDoc>(Coupon)));

export { router as couponRouter };
