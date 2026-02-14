import Chat_Load_Valid from "@/validators/chat-load";
import InitDB_Mongoose from "@/lib/db.init";
import Conversation from "@/database/conversations";

async function Chat_Load({
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
  const valid = Chat_Load_Valid(data)
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

  // Load Chat
  const chats = await Conversation.find({
    user_id: middleware.profile.id,
    chat_id: valid.data.id
  }).sort({ created_at: 1 });

  if (chats.length === 0) {
    return {
      error: "chat-is-not-found"
    }
  }

  return {
    data: {
      list: chats.map((item) => ({
        id: item._id,
        type: item.type,
        content: item.context,
        created_at: item.created_at,
      }))
    }
  }
}

export default Chat_Load;
