import asyncWrapper from 'async-wrapper-express-ts';
import express from 'express';
import { restrictToAdmin } from '../../middlewares/restrict-to-admin';
import { verifyToken } from '../../middlewares/verify-token';
import { Order, OrderDoc } from '../../models/order';
import { SharedController } from '../shared-controller';
import { createMyOrder, getMyOrders, sendAlimTalkWhenPaid } from './order-controller';
import { OrderPath } from './order-routes-path';

const router = express.Router();

router.route(OrderPath.WEBHOOK).post(sendAlimTalkWhenPaid);

router.use(verifyToken);
router.route(OrderPath.MY).get(asyncWrapper(getMyOrders)).post(asyncWrapper(createMyOrder));

router.use(restrictToAdmin);
router.route(OrderPath.ALL).get(asyncWrapper(SharedController.getAll<OrderDoc>(Order)));
router
  .route(OrderPath.ID)
  .get(asyncWrapper(SharedController.getOne<OrderDoc>(Order)))
  .patch(asyncWrapper(SharedController.updateOne<OrderDoc>(Order)))
  .delete(asyncWrapper(SharedController.deleteOne<OrderDoc>(Order)));
//Webhook
export { router as orderRouter };
