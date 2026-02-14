import mongoose from "mongoose";

const conversationsSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // User ID
  chat_id: { type: String, required: true }, // Chat ID
  type: { type: String, required: true }, // Type Message
  context: { type: Object, required: true, default: {} }, // Context Message
  is_first: { type: Boolean, default: false }, // Is First Message
  created_at: { type: Date, default: Date.now }, // Created at
});
const conversationsModel = mongoose.model("conversations", conversationsSchema);

export default conversationsModel;
