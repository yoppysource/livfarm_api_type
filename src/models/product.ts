//review / rating / createdA
import mongoose from 'mongoose';
import slugify from 'slugify';

interface ProductDoc extends mongoose.Document {
  category: number;
  name: string;
  nameInEng: string;
  slug: string;
  price: number;
  discountedPrice: number;
  location: string;
  description: string;
  imgPath: Array<string>;
  thumbnailPath: string;
  descriptionImgPath: string;
  detailImgPath: string[];
  sku: string;
  intro: string;
  tasteMeasure: string[];
  storageTip: string;
  recipe: string;
  nutrition: string;
  weight: string;
  ratingsAverage: number;
  ratingsQuantity: number;
}

const productSchema = new mongoose.Schema<ProductDoc>(
  {
    category: Number,

    name: {
      type: String,
      required: [true, 'Product must have a name'],
      unique: true,
      trim: true,
    },
    nameInEng: {
      type: String,
      required: [true, 'Product must have a name'],
      unique: true,
      trim: true,
    },
    slug: String,
    price: Number,
    partnerPrice: {
      type: Number,
      default: 3000,
    },
    discountedPrice: {
      type: Number,
    },
    location: String,
    description: String,
    thumbnailPath: String,
    descriptionImgPath: String,
    detailImgPath: [String],
    sku: String,
    type: String,
    intro: String,
    tasteMeasure: [String],
    storageTip: {
      type: String,
      default: '밑동을 한 번에 잘라 흐르는 물에 씻어 드세요. 남으면 물기를 털어 키친 타월 등으로 감싸 냉장 보관하세요.',
    },
    recipe: String,
    nutrition: String,
    weight: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [0, 'Rating must be above 0.0'],
      max: [5, 'Rating must be below 5.0'],
      //if there is an new value ,set called
      set: (value: number) => Math.round(value * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  },
);

//Indexing for price, ratingsAverage
productSchema.index({
  price: 1,
  ratingsAverage: -1,
});
productSchema.index({ slug: 1 });

//Define virtual field to populate reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  this.discountedPrice = this.price;
  next();
});

const Product = mongoose.model<ProductDoc>('Product', productSchema);

export { Product, ProductDoc };
