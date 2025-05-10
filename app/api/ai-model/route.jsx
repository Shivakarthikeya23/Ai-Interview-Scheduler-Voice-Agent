import { QUESTIONS_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req){
    
    const {jobPosition, JobDescription, duration, type} = await req.json();

    try{

    const FINAL_PROMPT = QUESTIONS_PROMPT.replace("{{{jobTitle}}}", jobPosition)
    .replace("{{{jobDescription}}}", JobDescription)
    .replace("{{{interviewType}}}", type)
    .replace("{{{duration}}}", duration);

    console.log(FINAL_PROMPT)
    
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        
      })

      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          { role: "user", content: FINAL_PROMPT }
        ],
      })

      console.log(completion.choices[0].message)
      return NextResponse.json(completion.choices[0].message)
    }
    catch(error){
        console.log(error)
        return NextResponse.json({error})
    }
}