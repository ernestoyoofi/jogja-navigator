import "@/lib/dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import Conversation from "@/database/conversations";
import Chat_Submit_Valid from "@/validators/chat-submit";
import InitDB_Mongoose from "@/lib/db.init";
import crypto from "crypto";

// AI 1 : AI Agent For Complex Planning & Deep Research
const DeepSearchContextChat = `Tugas: Analisis user & buat instruksi riset.
Data: Waktu {{time}}, Lokasi {{latitude}},{{longitude}}, User {{username}}.
Instruksi:
1. Pahami niat user.
2. Buat "research_prompt" cari 6 lokasi valid (dekat & buka).
3. Jika butuh info, isi "button_response" (array string).
4. "plan_analysis" pakai bahasa santai/semi-Jawa.`
const DeepSearchResponseSchema = {
  type: Type.OBJECT,
  required: ["plan_analysis", "research_prompt"],
  properties: {
    plan_analysis: {
      type: Type.STRING,
    },
    research_prompt: {
      type: Type.STRING,
    },
    button_response: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
  },
}
// AI 2 : AI Agent For Research Location Specifict Location & Date Time
const ResearchContextChat = `Tugas: Cari lokasi valid di Jogja sesuai instruksi.
Konteks: Saat ini {{time}}, User di {{latitude}},{{longitude}}.
Syarat:
- Min 3-6 lokasi.
- Urutkan rank 1-10.
- Lat/Long wajib akurat (decimal).
- Output diawali 'JSONFORMAT:'.
Format: JSONFORMAT:{"results":[{"name":"...","address":"...","rank_recommend":9,"latitude":...,"longitude":...}]}`
// AI 3 : AI Agent For Finalizing & Formatting The Response (Context)
const SummaryContextChat = `Tugas: Rangkum hasil riset & format JSON final.
Data: {{time}}, Lokasi User {{latitude}},{{longitude}}.
Instruksi:
1. "summary": Bahasa semi-Jawa ramah.
2. "location": Gabungkan data riset (nama, alamat, coords). Max 5 lokasi terbaik.`
const SummaryResponseSchema = {
  type: Type.OBJECT,
  required: ["summary", "location"],
  properties: {
    summary: {
      type: Type.STRING,
    },
    location: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["name", "address", "rank_recommend", "latitude", "longitude"],
        properties: {
          name: {
            type: Type.STRING,
          },
          address: {
            type: Type.STRING,
          },
          rank_recommend: {
            type: Type.NUMBER,
          },
          latitude: {
            type: Type.NUMBER,
          },
          longitude: {
            type: Type.NUMBER,
          },
        },
      },
    },
  },
};

async function Chat_Submit({
  system = {},
  middleware = {},
  data = {
    id: "", message: "", latitude: "", longitude: ""
  },
} = {}) {
  // Middleware Error
  if (middleware.error) {
    return {
      error: middleware.error
    }
  }

  // Validator
  const valid = Chat_Submit_Valid(data)
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
  // TimeZone
  const now = new Date();
  const formattedDate = now.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).replace(",", " |");

  // Generate ID
  const idChat = crypto.randomBytes(12).toString("hex");
  const chatId = data.id || idChat;

  // AI Setup
  const ai = new GoogleGenAI({
    apiKey: process.env["GEMINI_APIKEY"],
  });

  // Get Chat History
  // Mencari semua pesan dengan chat_id yang sama dan user_id yang sama
  // Diurutkan berdasarkan waktu pembuatan (lama -> baru)
  const chatHistory = await Conversation.find({
    chat_id: data.id,
    user_id: middleware.profile.id,
  })
    .select("_id type context is_first created_at")
    .sort({ created_at: 1 });

  // Save User Chat
  await Conversation.create({
    user_id: middleware.profile.id,
    chat_id: chatId,
    type: "user",
    context: {
      message: data.message,
      user_context: data.message,
      latitude: data.latitude,
      longitude: data.longitude
    },
    is_first: chatHistory.length === 0,
  });

  // AI 1 : AI Agent For Complex Planning & Deep Research
  console.log("Generate Deep Search...")
  const deepSearch = await ai.models.generateContent({
    model: process.env.MODEL_AI_AGENT,
    contents: [
      ...chatHistory.slice(0, 2).map((item) => ({
        role: item.type === "user" ? "user" : "model",
        parts: [
          {
            text: item.type === "user" ? item.context.message : item.context.summary,
          },
        ],
      })),
      {
        role: "user",
        parts: [
          {
            text: data.message,
          },
        ],
      },
    ],
    config: {
      response_mime_type: "application/json",
      systemInstruction: [
        {
          text: DeepSearchContextChat
            .replace("{{time}}", formattedDate)
            .replace("{{latitude}}", data.latitude)
            .replace("{{longitude}}", data.longitude)
            .replace("{{username}}", middleware.profile.username),
        }
      ],
      response_schema: DeepSearchResponseSchema,
    },
  });
  const deepSearchContent = deepSearch.candidates.map((candidate) => candidate.content.parts.map((part) => part.text).join("")).join("")
  console.log(deepSearchContent)
  const deepSearchJson = JSON.parse(deepSearchContent.replace("```json", "").replace("```", ""))
  console.log(deepSearchJson)
  if (deepSearchJson?.button_response) {
    // Save AI Chat
    await Conversation.create({
      user_id: middleware.profile.id,
      chat_id: chatId,
      type: "model",
      context: {
        summary: deepSearchJson.plan_analysis,
        buttons: deepSearchJson.button_response
      },
      is_first: false,
    });

    return {
      data: {
        id: idChat,
        summary: deepSearchJson.plan_analysis,
        buttons: deepSearchJson.button_response
      }
    }
  }
  // AI 2 : AI Model For Research Location Specifict Location & Date Time
  console.log("Generate Research...")
  const research = await ai.models.generateContent({
    model: process.env.MODEL_AI_AGENT,
    contents: [
      {
        role: "model",
        parts: [
          {
            text: deepSearchJson.research_prompt,
          },
        ],
      },
    ],
    config: {
      response_mime_type: "application/json",
      systemInstruction: [
        {
          text: ResearchContextChat
            .replace("{{time}}", formattedDate)
            .replace("{{latitude}}", data.latitude)
            .replace("{{longitude}}", data.longitude)
            .replace("{{username}}", middleware.profile.username),
        }
      ],
    },
  });
  const researchContent = research.candidates.map((candidate) => candidate.content.parts.map((part) => part.text).join("")).join("")
  console.log(researchContent)
  const researchJson = JSON.parse(researchContent.replace("```json", "").replace("```", ""))
  console.log(researchJson)
  // AI 3 : AI Agent For Finalizing & Formatting The Response
  console.log("Generate Summary...")
  const summary = await ai.models.generateContent({
    model: process.env.MODEL_AI_AGENT,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: deepSearchJson.plan_analysis,
          },
        ],
      },
    ],
    config: {
      response_mime_type: "application/json",
      systemInstruction: [
        {
          text: SummaryContextChat
            .replace("{{time}}", formattedDate)
            .replace("{{latitude}}", data.latitude)
            .replace("{{longitude}}", data.longitude)
            .replace("{{username}}", middleware.profile.username),
        }
      ],
      response_schema: SummaryResponseSchema,
    },
  });
  const summaryContent = summary.candidates.map((candidate) => candidate.content.parts.map((part) => part.text).join("")).join("")
  console.log(summaryContent)
  const splitingMessage = summaryContent.split("JSONFORMAT:")
  const summaryJson = JSON.parse(splitingMessage[1]?.replace("```json", "")?.replace("```", "") || "{}")
  console.log(summaryJson)

  // Save AI Chat
  await Conversation.create({
    user_id: middleware.profile.id,
    chat_id: chatId,
    type: "assistant",
    context: {
      summary: summaryJson.summary,
      location: summaryJson.location,
    },
    is_first: false,
  });

  return {
    data: {
      summary: summaryJson.summary,
      location: summaryJson.location,
    }
  }
}

export default Chat_Submit;