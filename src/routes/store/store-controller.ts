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
      let store;
      const allStores = await Store.find({});
      store = allStores[0];
      await store.populate({ path: 'inventories', model: Inventory, match: { hidden: { $ne: true } } }).execPopulate();

      if (req.user) {
        if (!req.user.cart.store) {
          await Cart.findByIdAndUpdate(req.user.cart._id, { store: store._id, $pull: { items: {} } });
        } else {
          if (req.user.cart.store.toString() !== store._id.toString()) {
            await Cart.findByIdAndUpdate(req.user.cart._id, { store: store._id, $pull: { items: {} } });
          }
        }
      }

      return res.status(200).json({ status: 'success', isPossibleToBuy: false, data: { data: store } });
    }

    const stores = await Store.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [coordinates[0], coordinates[1]],
          },

          $maxDistance: 10000,
        },
      },
    });

    let store;

    if (stores && stores.length !== 0) {
      isPossibleToBuy = true;
      store = stores[0];
    } else {
      const allStores = await Store.find({});
      store = allStores[0];
    }

    await store.populate({ path: 'inventories', model: Inventory, match: { hidden: { $ne: true } } }).execPopulate();

    if (req.user) {
      if (!req.user.cart.store) {
        await Cart.findByIdAndUpdate(req.user.cart._id, { store: store._id, $pull: { items: {} } });
      } else {
        if (req.user.cart.store.toString() !== store._id.toString()) {
          await Cart.findByIdAndUpdate(req.user.cart._id, { store: store._id, $pull: { items: {} } });
        }
      }
    }

    res.status(200).json({ status: 'success', address, zoneCode, coordinates, isPossibleToBuy, data: { data: store } });
  } catch (error) {
    return next(new AppError('주소를 가져오던 중 오류가 발생했습니다. 다시 시도해주세요', 501));
  }
};

export { getStoreAndAddressFromLocation };
