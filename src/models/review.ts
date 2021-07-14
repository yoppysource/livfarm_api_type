import mongoose from 'mongoose';
import { Product } from './product';

interface ReviewDoc extends mongoose.Document {
  review?: string;
  rating: number;
  createdAt: Date;
  imgPath?: Array<string>;
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userName?: string;
  hidden: boolean;
  userIdsWhoReport: Array<mongoose.Types.ObjectId>;
}

interface ReviewAttrs {
  review?: string;
  rating: number;
  createdAt: Date;
  imgPath?: Array<string>;
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userName?: string;
}

interface ReviewModel extends mongoose.Model<ReviewDoc> {
  build(attrs: ReviewAttrs): ReviewDoc;
  calcAverageRatings(product: mongoose.Types.ObjectId): Promise<void>;
}

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
    },
    rating: {
      type: Number,
      min: [0, 'Rating must be above 0.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    imgPath: [String],
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to product.'],
    },
    hidden: {
      type: Boolean,
      defalut: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
    userIdsWhoReport: [mongoose.Schema.Types.ObjectId],
    userName: String,
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
reviewSchema.index({ product: 1, user: 1 });

reviewSchema.statics.calcAverageRatings = async function (productId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        nRating: {
          $sum: 1,
        },
        avgRating: {
          $avg: '$rating',
        },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
reviewSchema.pre(/^find/, function (next) {
  //@ts-ignore
  this.find({ hidden: { $ne: true } });
  next();
});
//When review created
reviewSchema.post('save', async function (this: ReviewDoc) {
  const model = this.constructor as ReviewModel;
  await model.calcAverageRatings(this.product);
});

//When review updated
reviewSchema.post(/^findOneAnd/, async (document) => {
  if (document) await document.constructor.calcAverageRatings(document.product);
});
reviewSchema.post('save', async function (doc) {
  if (doc.userIdsWhoReport.length > 0) {
    doc.hidden = true;
  }
  doc.save();
});
const Review = mongoose.model<ReviewDoc, ReviewModel>('Review', reviewSchema);

export { Review, ReviewDoc };
