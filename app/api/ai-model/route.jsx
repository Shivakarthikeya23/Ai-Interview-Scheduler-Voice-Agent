import { QUESTIONS_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { extractJsonObject } from "@/lib/utils";

// OpenRouter's free tier is volatile enough that any hardcoded model list
// will eventually go stale - google/gemma-3-4b-it:free and
// meta-llama/llama-3.1-8b-instruct:free were both fully deprecated (404s)
// within weeks of being added here, and even models that DO still work
// (nvidia/nemotron-3.5-lightning:free) intermittently 404 on some requests
// and succeed on others, seemingly due to OpenRouter's own load-balancing
// across free-tier capacity rather than anything wrong with the request.
// Three independent models (each retried once) gives real headroom against
// that per-request flakiness instead of just picking "a" model that passed
// a one-off test. All three verified against this app's actual prompts at
// the real max_tokens budget - some other "free" models on OpenRouter are
// reasoning models that can burn the whole budget on hidden reasoning
// tokens and return null content instead of an answer.
const MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nex-agi/nex-n2.5-mini:free",
];
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
          const completion = await openai.chat.completions.create({
            model,
            messages: [
              { role: "user", content: FINAL_PROMPT }
            ],
            temperature: 0.8,
            max_tokens: 2000,
          });
          const content = completion.choices[0]?.message?.content;
          const cleaned = extractJsonObject(content);
          const parsed = cleaned ? JSON.parse(cleaned) : null;
          // Free-tier models occasionally wrap the JSON in prose (extractJsonObject
          // handles that) or emit outright garbled JSON - validating the shape here
          // and retrying catches that before it ever reaches the client, instead of
          // making the user manually retry the whole form.
          if (!Array.isArray(parsed?.interviewQuestions) || parsed.interviewQuestions.length === 0) {
            throw Object.assign(new Error("AI response did not contain valid interviewQuestions"), { isOutputValidationError: true });
          }
          console.log("Questions generated successfully");
          return NextResponse.json({ content: JSON.stringify(parsed) });
        } catch (err) {
          lastError = err;
          const is429 = err?.status === 429 || err?.code === 429 || String(err?.message || "").includes("429");
          if (is429 && attempt < 1) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
            continue;
          }
          if (err?.isOutputValidationError && attempt < 1) continue;
          // A non-retryable error (e.g. the model itself is gone, a 404) can
          // never succeed on retry - give up on this model and try the next one.
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