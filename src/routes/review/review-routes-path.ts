import asyncWrapper from 'async-wrapper-express-ts';
import express from 'express';
import { restrictToAdmin } from '../../middlewares/restrict-to-admin';
import { verifyToken } from '../../middlewares/verify-token';
import { Review, ReviewDoc } from '../../models/review';
import { SharedController } from '../shared-controller';
import { reportReview } from './review-controller';
import { ReviewPath } from './review-routes';
import { setMyToParams } from './set-my-to-params';
import { setProductIdAndUserId } from './set-product-id-user-id';

const router = express.Router({ mergeParams: true });

//get Reviews when user/non user browse the product
router.route(ReviewPath.ALL).get(asyncWrapper(SharedController.getAll<ReviewDoc>(Review)));
router.use(verifyToken);
// user is able to request for creating review
router.route(ReviewPath.REPORT).patch(asyncWrapper(reportReview));
router.route(ReviewPath.ALL).post(setProductIdAndUserId, asyncWrapper(SharedController.createOne<ReviewDoc>(Review)));

// user is able to delete update their review
router.route(ReviewPath.MY).get(setMyToParams, asyncWrapper(SharedController.getAll<ReviewDoc>(Review)));

router
  .route(ReviewPath.ID)
  .get(asyncWrapper(SharedController.getOne<ReviewDoc>(Review)))
  .patch(asyncWrapper(SharedController.updateOne<ReviewDoc>(Review)))
  .delete(asyncWrapper(SharedController.deleteOne<ReviewDoc>(Review)));

export { router as reviewRouter };
