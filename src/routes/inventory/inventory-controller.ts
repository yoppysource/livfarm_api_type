import { Request, Response, NextFunction } from 'express';
import { Inventory } from '../../models/inventory';

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
