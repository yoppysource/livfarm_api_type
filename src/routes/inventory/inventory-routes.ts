import express from 'express';
import asyncWrapper from 'async-wrapper-express-ts';
import { InventoryPath } from './inventory-routes-path';
import { SharedController } from '../shared-controller';
import { Inventory, InventoryDoc } from '../../models/inventory';
import { Product, ProductDoc } from '../../models/product';
import { Review, ReviewDoc } from '../../models/review';
import { verifyToken } from '../../middlewares/verify-token';
import { restrictToAdmin } from '../../middlewares/restrict-to-admin';

const router = express.Router();
router.get(InventoryPath.STORE_ID, asyncWrapper(SharedController.getAll<InventoryDoc>(Inventory)));
router.get(
  InventoryPath.ID,
  asyncWrapper(
    SharedController.getOne<InventoryDoc, ProductDoc, ReviewDoc>(Inventory, {
      path: 'product',
      model: Product,
      populate: {
        path: 'reviews',
        model: Review,
      },
    }),
  ),
);
router.use(verifyToken, restrictToAdmin);
router
  .route(InventoryPath.ALL)
  .get(asyncWrapper(SharedController.getAll<InventoryDoc>(Inventory)))
  .post(asyncWrapper(SharedController.createOne<InventoryDoc>(Inventory)));
router
  .route(InventoryPath.ID)
  .patch(asyncWrapper(SharedController.updateOne<InventoryDoc>(Inventory)))
  .delete(asyncWrapper(SharedController.deleteOne<InventoryDoc>(Inventory)));

export { router as inventoryRouter };
