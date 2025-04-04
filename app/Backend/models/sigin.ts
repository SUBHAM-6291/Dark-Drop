import mongoose, { Schema, model } from "mongoose";
import { ISignIn } from "./Types/Login";

const signInSchema = new Schema<ISignIn>({
username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export const SIGNINMODEL = mongoose.model<ISignIn>("SignIn", signInSchema);
