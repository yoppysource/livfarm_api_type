import mongoose, { Query, Types } from 'mongoose';
import { InventoryDoc } from './inventory';

interface StoreDoc extends mongoose.Document {
  name: string;
  location: Object;
  takeOut: boolean;
  hidden: boolean;
  isOpenSaturday: boolean;
  isOpenSunday: boolean;
  isOpenToday: boolean;
  openHourStr: string;
  closeHourStr: string;
  inventories: InventoryDoc[];
}

interface StoreAttrs {
  name: string;
  takeOut: boolean;
  location: Object;
  address: string;
  hidden: boolean;
  isOpenSaturday: boolean;
  isOpenSunday: boolean;
  isOpenToday: boolean;
  openHourStr: string;
  closeHourStr: string;
}

interface StoreModel extends mongoose.Model<StoreDoc> {
  build(attrs: StoreAttrs): StoreDoc;
}

const storeSchema = new mongoose.Schema<StoreDoc>(
  {
    name: {
      type: String,
      required: [true, 'Store must have a name'],
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    address: String,
    hidden: {
      type: Boolean,
      default: false,
    },
    takeOut: {
      type: Boolean,
      default: false,
    },
    isOpenSaturday: {
      type: Boolean,
      default: false,
    },
    isOpenSunday: {
      type: Boolean,
      default: false,
    },
    isOpenToday: {
      type: Boolean,
      default: true,
    },
    openHourStr: {
      type: String,
      default: '09:00',
    },
    closeHourStr: {
      type: String,
      default: '18:00',
    },
    streamingTag: String,
  },
  {
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        // delete keyword in javascript
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  },
);
storeSchema.index({ location: '2dsphere' });

storeSchema.virtual('inventories', {
  ref: 'Inventory',
  localField: '_id',
  foreignField: 'store',
  options: { sort: { isOnShelf: -1, rank: 1 } },
});

storeSchema.statics.build = (attrs: StoreAttrs) => {
  return new Store(attrs);
};

const Store = mongoose.model<StoreDoc, StoreModel>('Store', storeSchema);
export { Store, StoreDoc };
