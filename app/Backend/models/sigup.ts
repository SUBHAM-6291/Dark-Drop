import mongoose, { Schema, Document } from 'mongoose';
import { ISignup } from './Types/Login';


const signupSchema = new Schema<ISignup>(
  {
   username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SIGNUPMODEL = mongoose.model<ISignup>('Signup', signupSchema);
