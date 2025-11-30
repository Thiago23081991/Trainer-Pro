import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateWorkoutPlan = async (
  goal: string,
  level: string,
  daysPerWeek: number,
  equipment: string
): Promise<any> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `Create a detailed workout plan for a client with the goal of "${goal}". 
    Fitness Level: ${level}. 
    Frequency: ${daysPerWeek} days per week.
    Available Equipment: ${equipment}.
    
    Return the response as a JSON object containing a title for the plan and a list of exercises for one representative workout session.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.STRING },
                  reps: { type: Type.STRING },
                  obs: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating workout:", error);
    throw error;
  }
};

export const askFitnessAssistant = async (question: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: question,
            config: {
                systemInstruction: "You are an expert personal trainer and exercise physiologist. Answer concisely and professionally."
            }
        });
        return response.text || "I couldn't generate an answer at this time.";
    } catch (error) {
        console.error("Error asking assistant:", error);
        return "Sorry, I encountered an error connecting to the AI service.";
    }
}