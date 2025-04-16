import mongoose, { Schema, Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IImage {
  imageId: string;
  filePath: string;
  fileName: string;
  uploadedAt: Date;
}

export interface IUserImages extends Document {
  email: string;
  images: IImage[];
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema<IImage>({
  imageId: {
    type: String,
    required: [true, 'Image ID is required'],
    default: uuidv4,
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

imageSchema.pre('validate', function (next) {
  const images = (this as any).images as IImage[];
  const imageIds = images.map((img) => img.imageId);
  const uniqueImageIds = new Set(imageIds);
  if (imageIds.length !== uniqueImageIds.size) {
    next(new Error('Duplicate imageId values found in images array'));
  }
  next();
});

const userImagesSchema = new Schema<IUserImages>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    unique: true,
  },
  images: {
    type: [imageSchema],
    default: [],
  },
}, {
  timestamps: true,
});

userImagesSchema.index({ 'images.imageId': 1 }, { unique: false });

export const UserImagesModel = (mongoose.models.UserImages ||
  model<IUserImages>('UserImages', userImagesSchema)) as mongoose.Model<IUserImages>;