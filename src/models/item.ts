// import mongoose from 'mongoose';
// import { InventoryDoc, Inventory, InventoryPopulatedDoc } from './inventory';

// interface ItemBaseDoc extends mongoose.Document {
//   quantity: number;
//   createdAt: Date;
// }

// interface ItemDoc extends ItemBaseDoc {
//   inventory: mongoose.Types.ObjectId;
// }

// interface ItemPopulatedDoc extends ItemBaseDoc {
//   inventory: InventoryPopulatedDoc;
// }

// interface ItemAttrs {
//   inventory: mongoose.Types.ObjectId;
//   quantity: number;
// }

// interface ItemModel extends mongoose.Model<ItemDoc> {
//   build(attrs: ItemAttrs): ItemDoc;
// }

// const itemSchema = new mongoose.Schema<ItemDoc>(
//   {
//     Inventory: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Inventory',
//       required: [true, 'cartItem must belong to Inventory'],
//     },
//     store: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Store',
//     },
//     quantity: {
//       type: Number,
//       default: 1,
//       min: [1, 'quantity must be above 1'],
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now(),
//     },
//   },
//   {
//     toJSON: {
//       transform(_, ret) {
//         ret.id = ret._id;
//         delete ret._id;
//         delete ret.__v;
//       },
//     },
//   },
// );

// itemSchema.statics.build = (attrs: ItemAttrs) => {
//   return new Item(attrs);
// };

// itemSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'Inventory',
//     model: Inventory,
//   });
//   next();
// });

// const Item = mongoose.model<ItemDoc, ItemModel>('Item', itemSchema);

// export { ItemDoc, ItemPopulatedDoc, Item };
