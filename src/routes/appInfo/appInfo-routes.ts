import express from 'express';
import asyncWrapper from 'async-wrapper-express-ts';

import { SharedController } from '../shared-controller';
import { verifyToken } from '../../middlewares/verify-token';
import { restrictToAdmin } from '../../middlewares/restrict-to-admin';
import { AppInfoPath } from './appInfo-routes-path';
import { AppInfo } from '../../models/appInfo';

const router = express.Router();
router.get('/:id', asyncWrapper(SharedController.getOne(AppInfo)));
router.use(verifyToken, restrictToAdmin);
router.route('/').post(asyncWrapper(SharedController.createOne(AppInfo)));
router
  .route(AppInfoPath.WITH_ID)
  .patch(asyncWrapper(SharedController.updateOne(AppInfo)))
  .delete(asyncWrapper(SharedController.deleteOne(AppInfo)));

export { router as appInfoRouter };
