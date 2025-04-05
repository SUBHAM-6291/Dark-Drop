// models/File.ts
import mongoose from 'mongoose';
const FileSchema = new mongoose.Schema({
  ownerId: String,
  path: String,
  size: Number,
  originalName: String,
  isPrivate: Boolean,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  version: Number,
  isVersion: Boolean,
  versionOf: String,
});
export default mongoose.models.File || mongoose.model('File', FileSchema);