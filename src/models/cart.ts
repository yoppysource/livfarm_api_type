import mongoose, { Mongoose, Query } from 'mongoose';
import { Inventory, InventoryDoc, InventoryPopulatedDoc } from './inventory';
import { Product } from './product';
// import { ItemDoc, ItemPopulatedDoc, Item } from './item';

// interface CartBaseDoc extends mongoose.Document {
//   getTotalPrice: (itemDocs: ItemDoc[]) => number;
//   getTotalDiscountedPrice: (cartDocs: ItemDoc[]) => number;
// }
// interface CartDoc extends CartBaseDoc {
//   items: mongoose.ObjectId[];
// }

// interface CartPopulatedDoc extends CartBaseDoc {
//   items: ItemPopulatedDoc[];
// }

interface CartDoc extends mongoose.Document {
  getTotalPrice: number;
  getTotalDiscountedPrice: number;
  storeId: mongoose.Types.ObjectId;
  items: Item[];
}

interface Item {
  inventory: InventoryPopulatedDoc;
  quantity: number;
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
  return this.items.map((element: Item) => element.inventory.product.price * element.quantity).reduce((a: number, b: number) => a + b);
});

cartSchema.virtual('totalDiscountedPrice').get(function (this: any) {
  if (!this.items || this.items.length === 0) {
    return 0;
  }
  return this.items.map((element: Item) => element.inventory.product.discountedPrice * element.quantity).reduce((a: number, b: number) => a + b);
});

const Cart = mongoose.model<CartDoc>('Cart', cartSchema);

export { Cart, CartDoc };
