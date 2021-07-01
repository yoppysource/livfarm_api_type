import express from 'express';
import { SharedController } from '../shared-controller';
import { Product, ProductDoc } from '../../models/product';
import { Review, ReviewDoc } from '../../models/review';
import { verifyToken } from '../../middlewares/verify-token';
import { restrictToAdmin } from '../../middlewares/restrict-to-admin';
import { ProductPath } from './product-routes';
import asyncWrapper from 'async-wrapper-express-ts';
import { ReviewPath } from '../review/review-routes';
import { reviewRouter } from '../review/review-routes-path';

const router = express.Router();

router.use(ReviewPath.FROM_PRODUCT, reviewRouter);

router.get(ProductPath.ALL, asyncWrapper(SharedController.getAll<ProductDoc>(Product)));
router.get(
  ProductPath.ID,
  asyncWrapper(
    SharedController.getOne<ProductDoc, ReviewDoc>(Product, {
      path: 'reviews',
      model: Review,
    }),
  ),
);

router.use(verifyToken, restrictToAdmin);

router.route(ProductPath.ALL).post(asyncWrapper(SharedController.createOne<ProductDoc>(Product)));
router
  .route(ProductPath.ID)
  .patch(asyncWrapper(SharedController.updateOne<ProductDoc>(Product)))
  .delete(asyncWrapper(SharedController.deleteOne<ProductDoc>(Product)));

export { router as productRouter };
