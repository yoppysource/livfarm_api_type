import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/app-error';
import { Inventory } from '../../models/inventory';
import { Product } from '../../models/product';
import { Review } from '../../models/review';

const getInventoriesBasedOnStoreId = async (req: Request, res: Response) => {
  //find order by ID
  const docs = await Inventory.find({ store: req.params.storeId });

  res.status(200).json({
    status: 'success',
    length: docs.length,
    //when sending arrary
    data: {
      data: docs,
    },
  });
};

export { getInventoriesBasedOnStoreId };
