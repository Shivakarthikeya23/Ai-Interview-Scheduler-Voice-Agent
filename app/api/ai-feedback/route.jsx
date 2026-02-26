import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const MODELS = ["google/gemma-3-4b-it:free", "meta-llama/llama-3.1-8b-instruct:free"];
const RETRY_DELAY_MS = 4000;

export async function POST(req) {
  try {
    const { conversation } = await req.json();

    if (!conversation || conversation.length === 0) {
      return NextResponse.json({ error: "No conversation data provided" }, { status: 400 });
    }

    const FINAL_PROMPT = FEEDBACK_PROMPT.replace(
      "{{conversation}}",
      JSON.stringify(conversation)
    );

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    let lastError;
    for (const model of MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          const completion = await openai.chat.completions.create({
            model,
            messages: [{ role: "user", content: FINAL_PROMPT }],
            temperature: 0.7,
            max_tokens: 2000,
          });
          console.log("Feedback generation successful");
          return NextResponse.json(completion.choices[0].message);
        } catch (err) {
          lastError = err;
          const is429 = err?.status === 429 || err?.code === 429 || String(err?.message || "").includes("429");
          if (is429 && attempt < 1) continue;
          if (!is429) throw err;
        }
      }
    }

    // Rate limit or provider error: return fallback so client can still save and redirect
    const fallback = {
      content: JSON.stringify({
        summery: "Feedback could not be generated (provider rate limit). Please try again later.",
        summary: "Feedback could not be generated (provider rate limit). Please try again later.",
        Recommendation: "N/A",
        RecommendationMsg: "Feedback generation was temporarily unavailable.",
        rating: { technicalSkills: 0, communication: 0, problemSolving: 0, experience: 0 },
      }),
    };
    console.warn("Feedback fallback used:", lastError?.message);
    return NextResponse.json(fallback);
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback", details: error.message },
      { status: 500 }
    );
  }
}