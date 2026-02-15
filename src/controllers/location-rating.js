import Location_Rating_Valid from "@/validators/location-rating";
import InitDB_Mongoose from "@/lib/db.init";
import Planning from "@/database/plannings";

async function Location_Rating({
  system = {},
  middleware = {},
  data = { id: "", rating: null },
} = {}) {
  // Middleware Error
  if (middleware.error) {
    return {
      error: middleware.error
    }
  }

  // Validator
  const valid = Location_Rating_Valid(data)
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

  // Find Planning Task
  const planning = await Planning.findOne({
    _id: valid.data.id,
    user_id: middleware.profile.id
  });

  if (!planning) {
    return {
      error: "location-is-not-in-list" // Or generic not found
    }
  }

  if (planning.is_finish) {
    // Optional: Allow re-rating? User instruction says "rating itu buat ngubah status is_finish jadi true dan ngasih rating"
    // Usually implies doing it once, but re-rating might be okay.
    // However, if logic strictly follows "changing is_finish to true", maybe check if already finished.
    // Let's allow update for now or check if specifically asked.
    // "rating itu buat ngubah status is_finish jadi true".
    // I will just update it regardless.
  }

  // Update
  planning.is_finish = true;
  planning.rating = valid.data.rating;
  await planning.save();

  return {
    data: {
      success: true
    }
  }
}

export default Location_Rating;
