import mongoose from 'mongoose';
import { Inventory, InventoryPopulatedDoc } from './inventory';
import { OptionDoc, optionSchema } from './option-group';

interface CartDoc extends mongoose.Document {
  getTotalPrice: number;
  getTotalDiscountedPrice: number;
  storeId: mongoose.Types.ObjectId;
  items: Item[];
}

interface Item {
  inventory: InventoryPopulatedDoc;
  quantity: number;
  options: OptionDoc[];
}

const cartSchema = new mongoose.Schema<CartDoc>(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
    },
    items: [
      new mongoose.Schema(
        {
          inventory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Inventory,
          },
          quantity: {
            type: Number,
            default: 1,
            min: [1, 'quantity must be above 1'],
          },
          options: [optionSchema],
        },
        {
          toObject: {
            virtuals: true,
          },
          toJSON: {
            virtuals: true,
            transform(_, ret) {
              // delete keyword in javascript
              ret.id = ret._id;
              delete ret.__v;
            },
          },
        },
      ),
    ],
    // items: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Item',
    //   },
    // ],
  },
  {
    toObject: {
      virtuals: true,
    },
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

cartSchema.pre(/^find/, async function (this: CartDoc, next) {
  this.populate({
    path: 'items.inventory',
    model: Inventory,
  });
  next();
});

// During pre hook the docs would be populated
cartSchema.virtual('totalPrice').get(function (this: any) {
  if (!this.items || this.items.length === 0) {
    return 0;
  }
  return this.items
    .map(
      (element: Item) =>
        (element.inventory.product.price +
          (element.options === undefined || element.options.length === 0
            ? 0
            : element.options.map((option: OptionDoc) => option.price).reduce((a: number, b: number) => a + b))) *
        element.quantity,
    )
    .reduce((a: number, b: number) => a + b);
});

cartSchema.virtual('totalDiscountedPrice').get(function (this: any) {
  if (!this.items || this.items.length === 0) {
    return 0;
  }
  return this.items.map((element: Item) => element.inventory.product.discountedPrice * element.quantity).reduce((a: number, b: number) => a + b);
});

const Cart = mongoose.model<CartDoc>('Cart', cartSchema);

export { Cart, CartDoc };
