import mongoose from 'mongoose';

const UserDataSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  amalLog: { type: mongoose.Schema.Types.Mixed, default: {} },
  journal: { type: Array, default: [] },
  customAmalan: { type: Array, default: [] },
  theme: { type: String, default: 'light' },
  user: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: true,
  minimize: false
});

export const UserDataModel = mongoose.models.UserData || mongoose.model('UserData', UserDataSchema);
