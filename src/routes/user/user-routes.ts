import asyncWrapper from 'async-wrapper-express-ts';
import express from 'express';
import { restrictToAdmin } from '../../middlewares/restrict-to-admin';
import { setMyId, preventFromUpdatingRole } from '../../middlewares/set-my-id';
import { verifyToken } from '../../middlewares/verify-token';
import { User, UserDoc } from '../../models/user';
import { SharedController } from '../shared-controller';
import { updatePassword } from './user-controller';
import { UserPath } from './user-routes-path';

const router = express.Router();

router.use(asyncWrapper(verifyToken));

router.post(UserPath.UPDATE_PASSWORD, asyncWrapper(updatePassword));
router.get(UserPath.ME, setMyId, asyncWrapper(SharedController.getOne<UserDoc>(User)));
router.patch(UserPath.UPDATE_ME, setMyId, preventFromUpdatingRole, asyncWrapper(SharedController.updateOne<UserDoc>(User)));
router.delete(UserPath.DELETE_ME, setMyId, asyncWrapper(SharedController.deleteOne<UserDoc>(User)));

// WEB
// //View Routes
// router.get("/logout", authController.logout);

//This is only for Admin
router.use(restrictToAdmin);

router.route(UserPath.ALL).get(asyncWrapper(SharedController.getAll<UserDoc>(User)));

router
  .route(UserPath.ID)
  .get(asyncWrapper(SharedController.getOne<UserDoc>(User)))
  .patch(asyncWrapper(SharedController.updateOne<UserDoc>(User)))
  .delete(asyncWrapper(SharedController.deleteOne<UserDoc>(User)));

export { router as userRouter };
