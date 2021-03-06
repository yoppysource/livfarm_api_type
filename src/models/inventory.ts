import { NextFunction } from 'express';
import mongoose, { Query, Types } from 'mongoose';
import { OptionGroup } from './option-group';
import { Product, ProductDoc } from './product';

interface InventoryBaseDoc extends mongoose.Document {
  store: Types.ObjectId;
  inventory: number;
  rank: number;
  isOnShelf: boolean;
  hidden: boolean;
}

interface InventoryDoc extends InventoryBaseDoc {
  product: Types.ObjectId;
}

interface InventoryPopulatedDoc extends InventoryBaseDoc {
  product: ProductDoc;
}

interface InventoryAttrs {
  store: Types.ObjectId;
  product: Types.ObjectId;
  inventory: number;
  rank: number;
  hidden: boolean;
  optionGroups?: string[];
}

interface InventoryModel extends mongoose.Model<InventoryDoc> {
  build(attrs: InventoryAttrs): InventoryDoc;
}

const inventorySchema = new mongoose.Schema<InventoryDoc>(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, '인벤토리 안에는 반드시 store가 기입되어야합니다'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, '인벤토리에는 어떤 상품인지 기입되어야합니다.'],
    },
    recommended: {
      type: Boolean,
      default: false,
    },
    optionGroups: [mongoose.Schema.Types.ObjectId],
    inventory: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 100,
    },
    isOnShelf: {
      type: Boolean,
      default: false,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
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

inventorySchema.index({
  rank: -1,
});

inventorySchema.pre<Query<InventoryDoc, InventoryDoc>>(/^find/, function (this: Query<InventoryDoc, InventoryDoc>, next: Function) {
  this.populate({
    path: 'product',
    model: Product,
  })
    .sort('-isOnShelf recommended rank')
    .populate({
      path: 'optionGroups',
      model: OptionGroup,
    });
  next();
});
inventorySchema.pre('save', function (this: InventoryDoc, next: Function) {
  if (!this.inventory || this.inventory <= 0) {
    this.isOnShelf = false;
  } else {
    this.isOnShelf = true;
  }
  next();
});
//Update isOnShelf
inventorySchema.post(/Update/, async function (doc) {
  console.log(doc.inventory);
  if (doc) {
    if (!doc.inventory || doc.inventory <= 0) {
      doc.isOnShelf = false;
    } else {
      doc.isOnShelf = true;
    }
  }
  doc.save();
});

inventorySchema.statics.build = (attrs: InventoryAttrs) => {
  return new Inventory(attrs);
};

const Inventory = mongoose.model<InventoryDoc, InventoryModel>('Inventory', inventorySchema);
export { Inventory, InventoryDoc, InventoryPopulatedDoc };
