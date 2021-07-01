import express from 'express';
import asyncWrapper from 'async-wrapper-express-ts';
import { EventPath } from './event-routes-path';

import { SharedController } from '../shared-controller';
import { EventDoc, Event } from '../../models/event';
import { verifyToken } from '../../middlewares/verify-token';
import { restrictToAdmin } from '../../middlewares/restrict-to-admin';

const router = express.Router();
router.get(EventPath.ALL, asyncWrapper(SharedController.getAll<EventDoc>(Event)));
router.get(EventPath.ID, asyncWrapper(SharedController.getOne<EventDoc>(Event)));
router.use(verifyToken, restrictToAdmin);
router.route(EventPath.ALL).post(asyncWrapper(SharedController.createOne<EventDoc>(Event)));
router
  .route(EventPath.ID)
  .patch(asyncWrapper(SharedController.updateOne<EventDoc>(Event)))
  .delete(asyncWrapper(SharedController.deleteOne<EventDoc>(Event)));

export { router as eventRouter };
