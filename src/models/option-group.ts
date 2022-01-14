import mongoose from 'mongoose';

interface OptionDoc extends mongoose.Document {
  name: string;
  price: number;
  imagePath: string;
  avaliable: boolean;
}

interface OptionGroupDoc extends mongoose.Document {
  name: string;
  mandatory: boolean;
  multiSelectable: boolean;
  options: OptionDoc;
}

const optionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
      required: true,
    },
    imagePath: {
      type: String,
      required: true,
    },
    avaliable: {
      type: Boolean,
      default: true,
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
);

const optionGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mandatory: {
      type: Boolean,
      required: true,
    },
    multiSelectable: {
      type: Boolean,
      required: true,
    },
    options: [optionSchema],
  },
  {
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  },
);

const OptionGroup = mongoose.model('OptionGroup', optionGroupSchema);

export { OptionGroup, OptionGroupDoc, optionSchema, OptionDoc };
