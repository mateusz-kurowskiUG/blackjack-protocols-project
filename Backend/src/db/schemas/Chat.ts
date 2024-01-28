import { Schema } from "mongoose";
import IChat from "../../interfaces/Chat.model";

const ChatSchema = new Schema<IChat>({
  chatId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: String,
  ownerId: String,
});
export default ChatSchema;
