import { Schema } from "mongoose";
import { IGame, IHash, IUser } from "../../interfaces/interfaces";

export const Game = new Schema<IGame>({
  id: String,
  userId: String,
  stake: Number,
  won: Boolean,
});

export const User = new Schema<IUser>({
  id: String,
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  balance: Number,
  password: String,
});

export const Hash = new Schema<IHash>({
  hash: String,
  saltRounds: Number,
});
