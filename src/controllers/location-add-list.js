import Location_AddList_Valid from "@/validators/location-add-list";
import InitDB_Mongoose from "@/lib/db.init";
import Planning from "@/database/plannings";
import Location from "@/database/locations";

async function Location_AddList({
  system = {},
  middleware = {},
  data = { id: "" },
} = {}) {
  // Middleware Error
  if (middleware.error) {
    return {
      error: middleware.error
    }
  }

  // Validator
  const valid = Location_AddList_Valid(data)
  if (valid?.error) {
    return valid
  }

  // Database Connection
  const dbTest = await InitDB_Mongoose()
  if (dbTest?.err) {
    return {
      error: "database-not-connected"
    }
  }

  // Check Location
  const location = await Location.findById(valid.data.id);
  if (!location) {
    return {
      error: "location-is-not-found"
    }
  }

  // Check Existing Planning
  const existingPlanning = await Planning.findOne({
    user_id: middleware.profile.id,
    location_id: valid.data.id
  });

  if (existingPlanning) {
    return {
      error: "location-is-already-in-list"
    }
  }

  // Add Planning
  await Planning.create({
    user_id: middleware.profile.id,
    location_id: valid.data.id,
    is_finish: false,
    rating: 0
  });

  // Success
  return {
    data: {
      success: true
    }
  }
}

export default Location_AddList;
