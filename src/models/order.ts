import mongoose, { Mongoose } from 'mongoose';
import { CartDoc } from './cart';
import { Coupon } from './coupon';
import { User, UserDoc } from './user';

// const KlaviyoClient = require('../utils/email');
interface OrderDoc extends mongoose.Document {
  orderTitle: string;
  address: Object;
  option: string;
  usedPoint: number;
  orderRequestMessage: string;
  scheduledDate: Date;
  bookingOrderMessage: string;
  payMethod: string;
  status: number;
  paidAmount: number;
  isReviewed: boolean;
  coupon: Object;
  user: UserDoc;
  createdAt: Date;
  cart: CartDoc;
  storeId: mongoose.Types.ObjectId;
}
const orderSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    orderTitle: String,
    usedPoint: {
      type: Number,
      default: 0,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
    },
    address: {
      type: {
        type: String,
        default: 'Address',
        enum: ['Address'],
      },
      address: String,
      addressDetail: String,
      postcode: String,
    },
    option: {
      type: String,
      enum: ['inStore', 'delivery', 'takeOut'],
      default: 'delivery',
    },
    orderRequestMessage: String,
    scheduledDate: Date,
    bookingOrderMessage: String,
    payMethod: String,
    status: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,
    },
    paidAmount: Number,
    isReviewed: {
      type: Boolean,
      default: false,
    },
    coupon: {
      type: {
        type: String,
        default: 'Coupon',
        enum: ['Coupon'],
      },
      code: {
        type: String,
      },
      category: {
        type: String,
        enum: ['rate', 'value'],
      },
      amount: Number,
      description: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '주문은 반드시 사용자가 존재해야합니다.'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        // delete keyword in javascript
        ret.id = ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  },
);

orderSchema.virtual('orderStatus').get(function (this: OrderDoc) {
  const strKey = this.status.toString();
  const deliveryStatusObj: { [key: string]: string } = {
    '0': '결제 완료',
    '1': '배송 중',
    '2': '전달 완료',
    '3': '환불 처리',
  };

  const takeOutStatusObj: { [key: string]: string } = {
    '0': '결제 완료',
    '1': '포장 중',
    '2': '전달 완료',
    '3': '환불 처리',
  };
  if (this.option === 'delivery') {
    return deliveryStatusObj[strKey];
  } else {
    return takeOutStatusObj[strKey];
  }
});

orderSchema.index({ cart: 1, user: 1 });
orderSchema.index({ storeId: 1 });
orderSchema.pre(/^find/, function (next) {
  this.populate({ path: 'cart' }).populate({
    path: 'user',
    select: 'name phoneNumber',
  });
  next();
});

// orderSchema.post('save', async function (document) {
//   const user = await User.findById(document.user);
//   try {
//     KlaviyoClient.lists.addSubscribersToList({
//       listId: 'YuiFvt',
//       profiles: [
//         {
//           email: user.email,
//           properties: {
//             uid: user._id,
//             phone_number: user.phone_number,
//           },
//         },
//       ],
//     });
//   } catch (e) {
//     console.log(e);
//   }
// });

const Order = mongoose.model('Order', orderSchema);

export { Order, OrderDoc };
