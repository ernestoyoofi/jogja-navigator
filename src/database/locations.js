import mongoose from "mongoose";

const locationsSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name
  address: { type: String, required: true }, // Address
  latitude: { type: Number, required: true, min: -90, max: 90 }, // Latitude
  longitude: { type: Number, required: true, min: -180, max: 180 }, // Longitude
  created_at: { type: Date, default: Date.now }, // Created at
});
const locationsModel = mongoose.model("locations", locationsSchema);

export default locationsModel;
