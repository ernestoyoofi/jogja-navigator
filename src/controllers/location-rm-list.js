import Location_RmList_Valid from "@/validators/location-rm-list";
import InitDB_Mongoose from "@/lib/db.init";
import Planning from "@/database/plannings";

async function Location_RmList({
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
  const valid = Location_RmList_Valid(data)
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

  // Remove Planning Task
  const result = await Planning.deleteOne({
    _id: valid.data.id,
    user_id: middleware.profile.id
  });

  if (result.deletedCount === 0) {
    return {
      error: "location-is-not-in-list" // Assuming id refers to planning id, if not found means not in list or wrong id
    }
  }

  return {
    data: {
      success: true
    }
  }
}

export default Location_RmList;
