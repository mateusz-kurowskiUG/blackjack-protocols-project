import { Schema } from "mongoose";
import IGame from "../../interfaces/Game.model";

const GameSchema = new Schema<IGame>({
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
export default GameSchema;
