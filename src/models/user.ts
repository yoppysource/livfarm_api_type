import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Cart, CartDoc } from './cart';

//Create interface for User Document
interface UserBaseDoc extends mongoose.Document {
  _id: string;
  email: string;
  isEmailConfirmed: boolean;
  role: 'user' | 'partner' | 'admin';
  password?: string;
  agreeToGetMail: boolean;
  passwordChangedAt?: any;
  passwordResetToken?: string;
  passwordResetExpires?: number;
  emailConfirmationToken?: string;
  emailConfirmationExpires?: number;
  snsId?: string;
  platform?: 'kakao' | 'apple' | 'facebook' | 'google';
  //DATA
  name?: string;
  birthday?: Date;
  gender?: 'male' | 'female';
  phoneNumber?: string;
  //Address might be more than one.
  addresses?: Address[];
  coupons?: UserCoupon[];
  point?: number;
  createdAt?: Date;
  updatedAt?: Date;
  //Define methods
  comparePassword: (candidatePassword: string, userPassword: string) => Promise<boolean>;
  isPasswordChangedAfterTokenIssued: (JWTTimestamp: number) => boolean;
  createPasswordResetToken: () => string;
  createEmailConfirmationToken: () => string;
}

interface UserDoc extends UserBaseDoc {
  cart?: string;
}

interface UserPopulatedDoc extends UserBaseDoc {
  cart?: CartDoc;
}
interface Address {
  type: 'Address';
  address: string;
  addressDetail?: string;
  postcode: string;
}
interface UserCoupon {
  code: string;
  used: boolean;
  category: 'rate' | 'value';
  amount: number;
  expireDate: number;
  description: string;
}

//Set the attributes for what would be needed for creating user
interface UserAttrs {
  email: string;
  password?: string;
  snsId?: string;
  isEmailConfirmed: boolean;
  platform?: 'kakao' | 'apple' | 'facebook' | 'google';
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema<UserDoc>(
  {
    //AUTH
    email: {
      type: String,
      //transfer email to lower case
      lowercase: true,
      index: {
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } },
      },
    },
    isEmailConfirmed: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: ['user', 'partner', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    agreeToGetMail: {
      type: Boolean,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailConfirmationToken: String,
    emailConfirmationExpires: Date,
    snsId: String,
    platform: {
      type: String,
      enum: ['kakao', 'apple', 'facebook', 'google'],
    },
    //DATA
    name: { type: String },
    birthday: Date,
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    phoneNumber: String,
    addresses: [
      {
        type: {
          type: String,
          default: 'Address',
          enum: ['Address'],
        },
        coordinates: [Number],
        address: String,
        addressDetail: String,
        postcode: String,
      },
    ],
    coupons: [
      //TODO: Client must handle expireDate and used not to present.
      {
        type: {
          type: String,
          default: 'Coupon',
          enum: ['Coupon'],
        },
        code: {
          type: String,
        },
        used: Boolean,
        category: {
          type: String,
          enum: ['rate', 'value'],
        },
        amount: Number,
        expireDate: Date,
        description: String,
      },
    ],
    point: {
      type: Number,
      default: 0,
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    toJSON: {
      transform(_, ret) {
        // delete keyword in javascript
        ret.id = ret._id;
        delete ret.password;
      },
    },
  },
);

//Set static to using UserAttrs when create the User
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

//Set methods for the User Object
userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.isPasswordChangedAfterTokenIssued = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.createEmailConfirmationToken = function (this: UserDoc) {
  const confirmationToken = crypto.randomBytes(32).toString('hex');
  this.emailConfirmationToken = crypto.createHash('sha256').update(confirmationToken).digest('hex');
  this.emailConfirmationExpires = Date.now() + 10 * 60 * 10000;
  return confirmationToken;
};
userSchema.methods.createPasswordResetToken = function (this: UserDoc) {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 10000;
  return resetToken;
};

//Save is called only create new document
userSchema.pre('save', async function (next) {
  if (this.snsId) return next();
  //only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('save', async function (next) {
  if (this.isNew) {
    // When user sign in the cart should be created.
    const doc = await Cart.create({});
    this.cart = doc._id;
    this.coupons!.push({
      code: 'WELCOME',
      used: false,
      category: 'value',
      amount: 10000,
      expireDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      description: '가입 환영 쿠폰입니다.',
    });
  }
  next();
});

// //Klaviyo
// userSchema.pre('save', async function (next) {
//   try {
//     if (this.isNew) {
//       KlaviyoClient.public.identify({
//         email: this.email,
//       });
//       KlaviyoClient.lists.addSubscribersToList({
//         listId: 'VXwYU7',
//         profiles: [
//           {
//             email: this.email,
//             properties: {
//               uid: this._id,
//             },
//           },
//         ],
//       });
//     }
//     if (this.agreeToGetMail === true) {
//       KlaviyoClient.lists.addSubscribersToList({
//         listId: 'Y6A9SE',
//         profiles: [
//           {
//             email: this.email,
//             properties: {
//               uid: this._id,
//             },
//           },
//         ],
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     next();
//   }

//   next();
// });

//Set pre-hook: Read

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'cart',
    model: Cart,
  });
  next();
});
// userSchema.post(/^findOneAnd/, async (document) => {
//   if (document.agreeToGetMail === true) {
//     KlaviyoClient.lists.addSubscribersToList({
//       listId: 'Y6A9SE',
//       profiles: [
//         {
//           email: document.email,
//           properties: {
//             uid: document.id,
//           },
//         },
//       ],
//     });
//   }
// });

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User, UserDoc, UserAttrs, UserModel, UserPopulatedDoc, UserCoupon };
