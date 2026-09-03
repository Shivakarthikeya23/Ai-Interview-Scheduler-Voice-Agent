import { QUESTIONS_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// google/gemma-3-4b-it:free was deprecated by OpenRouter (now 404s). Verified
// these two are currently live and return real (non-empty) JSON content
// within a 2000-token budget for this prompt - some other "free" models on
// OpenRouter are reasoning models that can burn the whole budget on hidden
// reasoning tokens and return null content instead.
const MODELS = ["nvidia/nemotron-3.5-lightning:free", "minimax/minimax-m2.7:free"];
const RETRY_DELAY_MS = 4000;

export async function POST(req) {
  try {
    const { jobPosition, jobDescription, duration, type } = await req.json();

    // Validate required fields
    if (!jobPosition || !jobDescription || !duration || !type) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    const FINAL_PROMPT = QUESTIONS_PROMPT.replace("{{{jobTitle}}}", jobPosition)
      .replace("{{{jobDescription}}}", jobDescription)
      .replace("{{{interviewType}}}", Array.isArray(type) ? type.join(', ') : (type || 'General'))
      .replace("{{{duration}}}", duration);

    console.log("Generating questions for:", jobPosition);
    
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
            messages: [
              { role: "user", content: FINAL_PROMPT }
            ],
            temperature: 0.8,
            max_tokens: 2000,
          });
          console.log("Questions generated successfully");
          return NextResponse.json(completion.choices[0].message);
        } catch (err) {
          lastError = err;
          const is429 = err?.status === 429 || err?.code === 429 || String(err?.message || "").includes("429");
          // A non-429 error (e.g. the model itself is gone, a 404) can never
          // succeed on retry - give up on this model and try the next one.
          if (is429 && attempt < 1) continue;
          break;
        }
      }
    }

    console.error("Error generating questions:", lastError);
    return NextResponse.json(
      { error: "Failed to generate questions", details: lastError?.message },
      { status: 502 }
    );
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions", details: error.message },
      { status: 500 }
    );
  }
}