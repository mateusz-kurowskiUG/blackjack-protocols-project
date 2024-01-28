import { Schema } from "mongoose";
import { IUser } from "../../interfaces/interfaces";

export const User = new Schema<IUser>({
  userId: String,
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  balance: {
    type: Number,
    required: true,
    min: 0,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
});
