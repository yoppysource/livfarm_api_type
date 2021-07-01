import { NextFunction, Request, Response } from 'express';
import mongoose, { AnyObject } from 'mongoose';
import { AppError } from '../errors/app-error';
import { APIFeatures } from './API-feature';

interface PopulateOption<K, Q = undefined> {
  path: string;
  model: mongoose.Model<K>;
  populate?: {
    path: string;
    model: mongoose.Model<Q>;
  };
}

class SharedController {
  static deleteOne =
    <T>(Model: mongoose.Model<T>) =>
    async (req: Request, res: Response, next: NextFunction) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) {
        return next(new AppError('해당하는 정보를 찾을 수 없습니다', 404));
      }
      res.status(204).json({
        status: 'success',
        data: null,
      });
    };

  static updateOne =
    <T>(Model: mongoose.Model<T>) =>
    async (req: Request, res: Response, next: NextFunction) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        //new updated data will be returned
        // mongoose.Schema 에서 설정한 벨리데이터가 작동한다.
        runValidators: true,
      });
      if (!doc) {
        return next(new AppError('존재하지 않는 정보입니다', 404));
      }
      res.status(200).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    };

  static createOne =
    <T>(Model: mongoose.Model<T>) =>
    async (req: Request, res: Response, next: NextFunction) => {
      const doc = await Model.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    };

  static getOne =
    <T, K = undefined, Q = undefined>(Model: mongoose.Model<T>, popOptions?: PopulateOption<K, Q>) =>
    async (req: Request, res: Response, next: NextFunction) => {
      let query = Model.findById(req.params.id);
      if (popOptions) query = query.populate(popOptions);

      const doc: any = await query;

      if (!doc) {
        return next(new AppError('존재하지 않는 정보입니다', 404));
      }

      if (doc.hidden !== null && doc.hidden === true) {
        return next(new AppError('관리자에 의해 가려진 정보입니다', 401));
      }

      res.status(200).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    };

  static getAll =
    <T>(Model: mongoose.Model<T>) =>
    async (req: Request, res: Response, next: NextFunction) => {
      // To allow for nested GET reviews on tour (hack)
      let filter: any = {};
      if (req.params.productId) filter = { product: req.params.productId };
      if (req.params.storeId) filter = { store: req.params.storeId };
      // Get my for get all review data based on the user
      if (req.params.my) filter = { user: req.params.my };

      if (!req.user || req.user.role !== 'admin') {
        filter['hidden'] = { $ne: true };
      }

      const features = new APIFeatures(Model.find(filter), req.query).fillter().sort().limitFields().paginate();
      //   "totalDocsExamined": 9 인덱스로 해결하기.
      // const docs = await features.query.explain();
      const docs = await features.query;
      //여기서는 error 던지지 않는다. 실제로 받았고 쿼리에서 찾았는데 안나온거는 에러가 볼 수 없음
      res.status(200).json({
        status: 'success',
        length: docs.length,
        //when sending arrary
        data: {
          data: docs,
        },
      });
    };
}

export { SharedController };
