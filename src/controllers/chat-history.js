import InitDB_Mongoose from "@/lib/db.init";
import Conversation from "@/database/conversations";

async function Chat_History({ system = {}, middleware = {}, data = {} } = {}) {
  // Middleware Error
  if (middleware.error) {
    return {
      error: middleware.error
    }
  }

  // Database Connection
  const dbTest = await InitDB_Mongoose()
  if (dbTest?.err) {
    return {
      error: "database-not-connected"
    }
  }

  // Find Conversations
  const history = await Conversation.find({
    user_id: middleware.profile.id,
    is_first: true
  }).sort({ created_at: -1 });

  return {
    data: history.map((item) => ({
      id: item.chat_id,
      title: item.context.title || "New Conversation",
      created_at: item.created_at,
    }))
  }
}

export default Chat_History;
