import "@/lib/dotenv";
import { GoogleGenAI } from "@google/genai";
import Conversation from "@/database/conversations";
import Chat_Submit_Valid from "@/validators/chat-submit";
import InitDB_Mongoose from "@/lib/db.init";

// AI 1 : AI Agent For Complex Planning & Deep Research
// AI 3 : AI Agent For Finalizing & Formatting The Response (Context)
const responseSchema = {
  type: Type.OBJECT,
  required: ["question_select", "recommend"],
  properties: {
    summary: {
      type: Type.STRING,
    },
    type: {
      type: Type.STRING,
    },
    question_select: {
      type: Type.ARRAY,
       items: {
         type: Type.STRING,
       },
     },
    recommend: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
          },
          address: {
            type: Type.STRING,
          },
        },
      },
    },
  },
};

async function Chat_Submit({
  system = {},
  middleware = {},
  data = { id: "", message: "" },
} = {}) {
  // Middleware Error
  if (middleware.error) {
    return {
      error: middleware.error
    }
  }

  // Validator
  const valid = Chat_Submit_Valid(data)
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

  // AI Setup
  const ai = new GoogleGenAI({
    apiKey: process.env["GEMINI_APIKEY"],
  });

  // Get Chat History
  // Mencari semua pesan dengan chat_id yang sama dan user_id yang sama
  // Diurutkan berdasarkan waktu pembuatan (lama -> baru)
  const chatHistory = await Conversation.find({
    chat_id: valid.data.id,
    user_id: middleware.profile.id,
  })
    .select("_id type context is_first created_at")
    .sort({ created_at: 1 });

  // AI 1 : AI Agent For Complex Planning & Deep Research

  // AI 2 : AI Model For Research Location Specifict Location & Date Time

  // AI 3 : AI Agent For Finalizing & Formatting The Response

  return {
    data: {
      history_count: chatHistory.length,
      history: chatHistory
    }
  }
}

export default Chat_Submit;
