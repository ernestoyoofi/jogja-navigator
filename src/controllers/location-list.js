import Location_List_Valid from "@/validators/location-list";
import InitDB_Mongoose from "@/lib/db.init";
import Planning from "@/database/plannings";
import Location from "@/database/locations"; // Import locations model for populate or lookup

async function Location_List({
  system = {},
  middleware = {},
  data = {},
} = {}) {
  // Middleware Error
  if (middleware.error) {
    return {
      error: middleware.error
    }
  }

  // Validator (optional since it takes empty data, but good practice)
  const valid = Location_List_Valid(data)
  if (valid.error) {
    return {
      error: valid.error
    }
  }

  // Database Connection
  const dbTest = await InitDB_Mongoose()
  if (dbTest?.err) {
    return {
      error: "database-not-connected"
    }
  }

  // Get User Plannings
  // Use aggregation to join with locations collection
  // Note: Mongoose `locations` collection usually lowercase pluralized from model name unless specified.
  // Model name 'locations' -> collection 'locations'
  const plannings = await Planning.aggregate([
    {
      $match: {
        user_id: String(middleware.profile.id)
      }
    },
    {
      $addFields: {
        locationIdObj: { $toObjectId: "$location_id" } // Convert string location_id to ObjectId for lookup
      }
    },
    {
      $lookup: {
        from: "locations",
        localField: "locationIdObj",
        foreignField: "_id",
        as: "location_info"
      }
    },
    {
      $unwind: {
        path: "$location_info",
        preserveNullAndEmptyArrays: true // Keep if location not found (though should exist)
      }
    },
    {
      $sort: {
        created_at: -1
      }
    },
    {
      $project: {
        id: "$_id",
        location_id: "$location_id",
        is_finish: "$is_finish",
        rating: "$rating",
        created_at: "$created_at",
        // Location details
        name: { $ifNull: ["$location_info.name", "Unknown Location"] },
        address: { $ifNull: ["$location_info.address", ""] },
        latitude: { $ifNull: ["$location_info.latitude", 0] },
        longitude: { $ifNull: ["$location_info.longitude", 0] },
      }
    }
  ]);

  return {
    data: {
      list: plannings
    }
  }
}

export default Location_List;
