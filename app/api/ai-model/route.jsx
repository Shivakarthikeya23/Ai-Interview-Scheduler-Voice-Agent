import { QUESTIONS_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

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

    const completion = await openai.chat.completions.create({
      model: "google/gemma-3-4b-it:free",
      messages: [
        { role: "user", content: FINAL_PROMPT }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    console.log("Questions generated successfully");
    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions", details: error.message }, 
      { status: 500 }
    );
  }
}