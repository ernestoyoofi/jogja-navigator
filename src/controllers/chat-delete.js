import Chat_Delete_Valid from "@/validators/chat-delete";
import InitDB_Mongoose from "@/lib/db.init";
import Conversation from "@/database/conversations";

async function Chat_Delete({
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
  const valid = Chat_Delete_Valid(data)
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

  // Delete Chat
  await Conversation.deleteMany({
    user_id: middleware.profile.id,
    chat_id: valid.data.id
  });

  return {
    data: {
      success: true
    }
  }
}

export default Chat_Delete;
