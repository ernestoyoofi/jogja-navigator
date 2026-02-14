import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  profile: { type: String, required: true }, // Profile URL
  username: { type: String, required: true }, // Username
  email: { type: String, required: true }, // Email
  created_at: { type: Date, default: Date.now }, // Created at
});
const usersModel = mongoose.models.users || mongoose.model("users", usersSchema);

export default usersModel;
