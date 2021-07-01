import mongoose from 'mongoose';

interface EventDoc extends mongoose.Document {
  imageUrl: string;
  url: string;
}

interface EventAttrs {
  imageUrl: string;
  url: string;
}
const eventSchema = new mongoose.Schema(
  {
    imageUrl: String,
    url: String,
  },
  {
    toJSON: {
      transform(_, ret) {
        // delete keyword in javascript
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  },
);

const Event = mongoose.model('Event', eventSchema);

export { Event, EventDoc };
