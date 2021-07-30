import axios from 'axios';
import { Request, NextFunction, Response } from 'express';
import { AppError } from '../../errors/app-error';
import { Cart } from '../../models/cart';
import { Inventory } from '../../models/inventory';
import { Store } from '../../models/store';
import { userRouter } from '../user/user-routes';

const getStoreAndAddressFromLocation = async (req: Request, res: Response, next: NextFunction) => {
  let address = '';
  let coordinates = [];
  let zoneCode = '';
  let isPossibleToBuy = false;
  const allStores = await Store.find({}).sort({ maxDistance: 1 });
  console.log(allStores);
  const baseStore = allStores[allStores.length - 1];
  try {
    if (req.body.address && req.body.coordinates) {
      address = req.body.address;
      coordinates = req.body.coordinates;
    } else if (req.body.address) {
      address = req.body.address;
      const resFromAPI = await axios({
        method: 'get',
        url: 'https://dapi.kakao.com/v2/local/search/address.json',
        headers: { Authorization: process.env.KAKAO_API_KEY },
        params: {
          query: address,
        },
      });
      coordinates[0] = Number(resFromAPI.data.documents[0].x);
      coordinates[1] = Number(resFromAPI.data.documents[0].y);
      if (resFromAPI.data.documents[0]) {
        if (resFromAPI.data.documents[0].road_address !== null) {
          zoneCode = resFromAPI.data.documents[0].road_address.zone_no;
        }
      }
    } else if (req.body.coordinates) {
      coordinates = req.body.coordinates;
      const resFromAPI = await axios({
        method: 'get',
        url: 'https://dapi.kakao.com/v2/local/geo/coord2address',
        headers: { Authorization: 'KakaoAK ab6c9e02157bfd1d3e026ae4ff056836' },
        params: {
          x: req.body.coordinates[0],
          y: req.body.coordinates[1],
        },
      });

      if (resFromAPI.data.documents[0]) {
        address = resFromAPI.data.documents[0].address.address_name;
      }
      if (resFromAPI.data.documents[0].address.road_address) {
        if (resFromAPI.data.documents[0].road_address.zone_no !== null) {
          zoneCode = resFromAPI.data.documents[0].road_address.zone_no;
        }
      }
    } else {
      await baseStore.populate({ path: 'inventories', model: Inventory, match: { hidden: { $ne: true } } }).execPopulate();
      if (req.user && (!req.user.cart.storeId || req.user.cart.storeId.toString() !== baseStore._id.toString())) {
        await Cart.findByIdAndUpdate(req.user.cart._id, { storeId: baseStore._id, $pull: { items: {} } });
      }
      return res.status(200).json({ status: 'success', isPossibleToBuy: false, data: { data: baseStore } });
    }
    if (req.user && req.user.role === 'partner') {
      await baseStore.populate({ path: 'inventories', model: Inventory, match: { hidden: { $ne: true } } }).execPopulate();
      if (req.user && (!req.user.cart.storeId || req.user.cart.storeId.toString() !== baseStore._id.toString())) {
        await Cart.findByIdAndUpdate(req.user.cart._id, { storeId: baseStore._id, $pull: { items: {} } });
      }
      return res.status(200).json({ status: 'success', address, zoneCode, coordinates, isPossibleToBuy: true, data: { data: baseStore } });
    }

    let nearStore;

    for await (const store of allStores) {
      nearStore = await Store.findOne({
        _id: store._id,
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [coordinates[0], coordinates[1]],
            },
            $maxDistance: store.maxDistance,
          },
        },
      });
      if (nearStore) break;
    }

    if (nearStore) {
      isPossibleToBuy = true;
    } else {
      nearStore = baseStore;
    }

    await nearStore.populate({ path: 'inventories', model: Inventory, match: { hidden: { $ne: true } } }).execPopulate();
    if (req.user && (!req.user.cart.storeId || req.user.cart.storeId.toString() !== nearStore._id.toString())) {
      await Cart.findByIdAndUpdate(req.user.cart._id, { storeId: nearStore._id, $pull: { items: {} } });
    }

    res.status(200).json({ status: 'success', address, zoneCode, coordinates, isPossibleToBuy, data: { data: nearStore } });
  } catch (error) {
    return next(new AppError('주소를 가져오던 중 오류가 발생했습니다. 다시 시도해주세요', 501));
  }
};
const getInventoriesWhenUserIsInStore = async (req: Request, res: Response, next: NextFunction) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId });
  if (store == null) return next(new AppError('가게 정보를 가져오는데 실패했습니다', 400));
  await store.populate({ path: 'inventories', model: Inventory, match: { hidden: { $ne: true } } }).execPopulate();
  if (req.user && (!req.user.cart.storeId || req.user.cart.storeId.toString() !== storeId.toString())) {
    await Cart.findByIdAndUpdate(req.user.cart._id, { storeId: storeId, $pull: { items: {} } });
  }
  res.status(200).json({ status: 'success', data: { data: store } });
};

export { getStoreAndAddressFromLocation, getInventoriesWhenUserIsInStore };
