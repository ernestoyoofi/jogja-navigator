import "@/lib/dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import Conversation from "@/database/conversations";
import Chat_Submit_Valid from "@/validators/chat-submit";
import InitDB_Mongoose from "@/lib/db.init";

// AI 1 : AI Agent For Complex Planning & Deep Research
const DeepSearchContextChat = `Role: Kamu adalah Lead Architect JogjaNavigator.
Tugas: Analisis kebutuhan user (budget, waktu, vibe). 
Input: Chat User, Longitude, Latitude, Time (GMT+7).
Parameter Sistem Sekarang:
{
  "time": "{{time}}",
  "latitude": "{{latitude}}",
  "longitude": "{{longitude}}",
}

Instruksi:
1. Identifikasi niat user secara mendalam.
2. Buat instruksi riset yang tajam untuk AI Model 2. 
3. Fokus pada pencarian lokasi yang masuk akal secara geografis (dekat koordinat user) dan waktu (sedang buka).
4. Jika user pertanyaan kurang jelas, bagian button response kamu isi dalam bentuk string array contoh umumnya ["<Pilihan 1>", "<Pilihan 2>", "<Pilihan 3>"] 

Output wajib format JSON:
{
  "plan_analysis": "Analisis singkat dalam semi-bahasa Jawa",
  "research_prompt": "Cari 6 lokasi di Jogja dengan kriteria: [Kriteria]. Pastikan dapat koordinat lat/lng, alamat lengkap, dan alasan kenapa ini cocok buat user.",
  "button_response"?: ["<Pilihan 1>", "<Pilihan 2>", "<Pilihan 3>"] // Tidak wajib, tapi wajib untuk mencari jawaban user jauh lebih detail
}`
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
const ResearchContextChat = `Role: Kamu adalah Senior Researcher khusus area Yogyakarta.
Tugas: Cari lokasi terbaik sesuai instruksi AI 1. Kamu harus memberikan data yang valid, bukan halusinasi.

Instruksi Akhir:
1. Berikan minimal 3 - 6 lokasi.
2. Urutkan berdasarkan rank_recommend (1-10).
3. Wajib memberikan latitude dan longitude yang akurat (format decimal).
4. Output HARUS diawali dengan 'JSONFORMAT:' dan dilarang menggunakan markdown code blocks (\`\`\`).

Format Output:
JSONFORMAT:{"results":[{"name":"<Nama Tempat>","address":"<Alamat Lokasi>","rank_recommend":9}, ...(lainnya)]}`
// AI 3 : AI Agent For Finalizing & Formatting The Response (Context)
const SummaryContextChat = `Role: Kamu adalah Front-man JogjaNavigator (Mas/Mbak Jogja).
Tugas: Resume hasil riset dan buat JSON Final untuk UI.

Instruksi:
1. Buat 'summary' dalam bahasa semi-Jawa yang sangat ramah (contoh: "Sugeng rawuh! niki daftar tempat sing paling jos...").
2. Pastikan semua data koordinat dan alamat dari AI 2 masuk ke dalam array 'location'.
3. Berikan minimal 3 location resultnya dan maksimal terbanyaknya 5 lokasi dari hasil resume diatas serta data dari reverse geo, jadikan satu lokasi serta data geonya.

Format Output (Wajib Valid JSON):
{
  "result": {
    "summary": "Teks ramah semi-Jawa di sini",
    "location": [
      {
        "name": "string",
        "address": "string",
        "rank_recommend": number,
        "latitude": number,
        "longitude": number
      }
    ]
  }
}`
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

  // AI 1 : AI Agent For Complex Planning & Deep Research
  console.log("Generate Deep Search...")
  const deepSearch = await ai.models.generateContent({
    model: process.env.MODEL_AI_AGENT,
    contents: [
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
            .replace("{{longitude}}", data.longitude),
        }
      ],
      response_schema: DeepSearchResponseSchema,
    },
  });
  const deepSearchContent = deepSearch.candidates.map((candidate) => candidate.content.parts.map((part) => part.text).join("")).join("")
  const deepSearchJson = JSON.parse(deepSearchContent.replace("```json", "").replace("```", ""))
  console.log(deepSearchJson)
  // AI 2 : AI Model For Research Location Specifict Location & Date Time
  console.log("Generate Research...")
  const research = await ai.models.generateContent({
    model: process.env.MODEL_AI_AGENT,
    contents: [
      {
        role: "user",
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
            .replace("{{longitude}}", data.longitude),
        }
      ],
    },
  });
  const researchContent = research.candidates.map((candidate) => candidate.content.parts.map((part) => part.text).join("")).join("")
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
            .replace("{{longitude}}", data.longitude),
        }
      ],
      response_schema: SummaryResponseSchema,
    },
  });
  const summaryContent = summary.candidates.map((candidate) => candidate.content.parts.map((part) => part.text).join("")).join("")
  const summaryJson = JSON.parse(summaryContent.replace("```json", "").replace("```", ""))
  console.log(summaryJson)

  return {
    data: {
      history_count: chatHistory.length,
      summary: summaryJson.summary,
      location: summaryJson.location,
    }
  }
}

export default Chat_Submit;

/*
Chat_Submit({
  system: {},
  middleware: {
    profile: {
      id: "6900808b73685a947974686b"
    }
  },
  data: {
    message: "Hii",
    latitude: -7.78289109153371,
    longitude: 110.3668836934281
  },
}).then((res) => {
  console.log(res)
}).catch((err) => {
  console.log(err)
})
*/