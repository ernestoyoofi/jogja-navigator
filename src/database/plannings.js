import mongoose from "mongoose";

const planningsSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // User ID
  location_id: { type: String, required: true }, // Location ID
  is_finish: { type: Boolean, required: true }, // Is Finish
  rating: { type: Number, required: true }, // Rating
  created_at: { type: Date, default: Date.now }, // Created at
});
const planningsModel = mongoose.models.plannings || mongoose.model("plannings", planningsSchema);

export default planningsModel;
