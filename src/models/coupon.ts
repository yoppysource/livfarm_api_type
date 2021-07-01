import mongoose from 'mongoose';

interface CouponDoc extends mongoose.Document {
  code: string;
  limit: number;
  category: string;
  amount: number;
  expireDate: Date;
  description: string;
}

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    limit: Number,
    category: {
      type: String,
      enum: ['rate', 'value'],
      default: 'value',
    },
    amount: Number,
    expireDate: Date,
    description: String,
  },
  {
    toJSON: {
      transform(_, ret) {
        // delete keyword in javascript
        ret.id = ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  },
);

// //Use pre middleware for not to get coupon which reach to limit.
// couponSchema.pre(/^find/, function (this: any, next) {

//   next();
// });

couponSchema.post(/^update/, async function (document: CouponDoc) {
  if (document.limit && document.limit < 0) {
    await document.remove();
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

export { Coupon, CouponDoc };
