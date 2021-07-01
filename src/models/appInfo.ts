import mongoose from 'mongoose';
const appInfoSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'appInfo',
    enum: ['appInfo'],
  },
  version: String,
  inMaintenance: Boolean,
});

const AppInfo = mongoose.model('AppInfo', appInfoSchema);

export { AppInfo };
