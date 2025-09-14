import OpenAI from "openai";

export function makeAIClient() {
    const provider = process.env.NEXT_PUBLIC_AI_PROVIDER
    return new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
    });
}