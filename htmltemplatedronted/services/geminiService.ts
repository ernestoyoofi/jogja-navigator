
import { GoogleGenAI, Type } from "@google/genai";
import { Route, Spot } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const spotSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    cost: { type: Type.NUMBER },
    lat: { type: Type.NUMBER },
    lng: { type: Type.NUMBER },
    time: { type: Type.STRING },
  },
  required: ["id", "name", "description", "cost", "lat", "lng"],
};

export async function getTravelAdvice(prompt: string, history: {role: string, parts: {text: string}[]}[]): Promise<{ text: string; newSpots?: Spot[] }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `You are Sugeng, a local guide in Yogyakarta. 
        Help users plan their trip. When the user asks for places, suggestions, or a route, 
        you MUST provide a helpful conversational response AND a list of specific locations with coordinates.
        Always return JSON with: { "conversationalText": string, "spots": Array<{id, name, description, cost, lat, lng, time}> }.
        Yogyakarta coordinates are around lat -7.7956, lng 110.3695.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conversationalText: { type: Type.STRING },
            spots: {
              type: Type.ARRAY,
              items: spotSchema
            },
          },
          required: ["conversationalText"]
        }
      },
    });

    const result = JSON.parse(response.text || '{}');
    const newSpots: Spot[] = (result.spots || []).map((s: any) => ({
      id: s.id || Math.random().toString(36).substr(2, 9),
      name: s.name,
      description: s.description,
      cost: s.cost,
      coords: [s.lat, s.lng],
      time: s.time,
      isCompleted: false
    }));

    return {
      text: result.conversationalText,
      newSpots: newSpots.length > 0 ? newSpots : undefined
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Waduh, Sugeng lagi sibuk sebentar. Coba lagi ya!" };
  }
}
