import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

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

    const completion = await openai.chat.completions.create({
      model: "google/gemma-3-4b-it:free",
      messages: [{ role: "user", content: FINAL_PROMPT }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    console.log("Feedback generation successful");
    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback", details: error.message }, 
      { status: 500 }
    );
  }
}