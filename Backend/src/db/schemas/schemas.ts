import { Schema } from "mongoose";
import { IGame, IUser } from "../../interfaces/interfaces";

export const Game = new Schema<IGame>({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  userId: {
    type: String,
    required: true,
  },
  stake: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  playerCards: {
    type: Array,
    required: true,
  },
  dealerCards: {
    type: Array,
    required: true,
  },
});

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
