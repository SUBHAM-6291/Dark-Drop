import mongoose, { Schema, Document, model } from 'mongoose';

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
    unique: true,
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
  }
}, { _id: false });

const userImagesSchema = new Schema<IUserImages>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  images: {
    type: [imageSchema],
    default: [],
  }
}, {
  timestamps: true,
});

export const UserImagesModel = (mongoose.models.UserImages || 
  model<IUserImages>('UserImages', userImagesSchema)) as mongoose.Model<IUserImages>;