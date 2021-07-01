import express from 'express';
import { SharedController } from '../shared-controller';

import { verifyToken } from '../../middlewares/verify-token';
import { restrictToAdmin } from '../../middlewares/restrict-to-admin';
import asyncWrapper from 'async-wrapper-express-ts';

import { Store, StoreDoc } from '../../models/store';
import { StorePath } from './store-routes';
import { getStoreAndAddressFromLocation } from './store-controller';
import { setCurrentUser } from '../../middlewares/set_current_user';

const router = express.Router();

router.route(StorePath.ID).get(asyncWrapper(SharedController.getOne<StoreDoc>(Store)));
router.route(StorePath.FROM_LOCATION).post(setCurrentUser, asyncWrapper(getStoreAndAddressFromLocation));
router.use(verifyToken, restrictToAdmin);

router
  .route(StorePath.ALL)
  .get(asyncWrapper(SharedController.getAll<StoreDoc>(Store)))
  .post(asyncWrapper(SharedController.createOne<StoreDoc>(Store)));
router
  .route(StorePath.ID)
  .patch(asyncWrapper(SharedController.updateOne<StoreDoc>(Store)))
  .delete(asyncWrapper(SharedController.deleteOne<StoreDoc>(Store)));

export { router as storeRouter };
