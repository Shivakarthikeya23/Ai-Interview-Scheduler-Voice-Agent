"use client";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Flashlight, Mic, Phone, Timer } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import AlertConfirmation from "./_components/AlertConfirmation";
import { toast } from "sonner";
import axios from "axios";

function StartInterview() {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const [vapi, setVapi] = React.useState(null);
  const [activeUser, setActiveUser] = React.useState(false);
  const [conversation, setConversation] = React.useState();

  useEffect(() => {
    // Initialize Vapi only on client side
    if (typeof window !== 'undefined') {
      const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);
      setVapi(vapiInstance);
    }
  }, []);

  useEffect(() => {
    if (interviewInfo && vapi) {
      startCall();
    }
  }, [interviewInfo, vapi]);

  const startCall = () => {
    if (!vapi) return;
    
    let questionList;
    interviewInfo?.interviewData?.questionList.forEach((item, index) => {
      questionList = item?.question + "," + questionList;
    });
    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage:
        "Hi" +
        interviewInfo?.userName +
        "how are you? Ready for your interview on " +
        interviewInfo?.interviewData?.jobPosition,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      voice: {
        provider: "playht",
        voiceId: "jennifer",
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              `You are an AI voice assistant conducting interviews.
Your job is to ask candidates provided interview questions, assess their responses.
Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
"Hey there! Welcome to your` +
              interviewInfo?.interviewData?.jobPosition +
              `interview. Let's get started with a few questions!"
Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. Below are the questions ask one by one:
Questions: ` +
              questionList +
              `
If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
"Need a hint? Think about how React tracks component updates!"
Provide brief, encouraging feedback after each answer. Example:
"Nice! That's a solid answer."
"Hmm, not quite! Want to try again?"
Keep the conversation natural and engaging-use casual phrases like "Alright, next up..." or "Let's tackle a tricky one!"
After 5-7 questions, wrap up the interview smoothly by summarizing their performance. Example:
"That was great! You handled some tough questions well. Keep sharpening your skills!"
End on a positive note:
"Thanks for chatting! Hope to see you crushing projects soon!"
Key Guidelines:
- Be friendly, engaging, and witty ✨
- Keep responses short and natural, like a real conversation
- Adapt based on the candidate's confidence level
- Ensure the interview remains focused on React
`.trim(),
          },
        ],
      },
    };

    vapi.start(assistantOptions);
  };

  const stopInterview = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  useEffect(() => {
    if (!vapi) return;

    const handleCallStart = () => {
      console.log("Call has started");
      toast("Call has connected..");
    };

    const handleSpeechStart = () => {
      console.log("Speech started");
      setActiveUser(false);
    };

    const handleSpeechEnd = () => {
      console.log("Speech has ended");
      setActiveUser(true);
    };

    const handleCallEnd = () => {
      console.log("Interview call has ended");
      toast("Interview ended");
      GenerateFeedback();
    };

    const handleMessage = (message) => {
      console.log("Message", message);
      setConversation(message?.conversation);
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", handleMessage);

    return () => {
      vapi.off("call-start", handleCallStart);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("call-end", handleCallEnd);
      vapi.off("message", handleMessage);
    };
  }, [vapi]);

  const GenerateFeedback = async () => {
    const result = await axios.post("/api/ai-feedback", {
      conversation: conversation,
    });
    console.log("Feedback", result?.data);
    const Content = result?.data?.content;
    const FINAL_CONTENT = Content.replace("```json", "").replace("```", "");
    console.log("FINAL_CONTENT", FINAL_CONTENT);
  };

  return (
    <div className="p-20 lg:px-48 xl:px-56">
      <h2 className="font-bold text-xl flex justify-between">
        AI Interview Session
        <span className="flex gap-2 items-center">
          <Timer />
          00:00:00
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <div className="bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center mt-5">
          <div className="relative">
            {!activeUser && (
              <span className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping" />
            )}
            <Image
              src={"/ai.png"}
              alt="ai"
              width={100}
              height={100}
              className="w-[60px] h-[60px] rounded-full object-center"
            />
          </div>
          <h2>Ai Recruiter</h2>
        </div>
        <div className="bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center mt-5">
          <div className="relative">
            {activeUser && (
              <span className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping" />
            )}
            <h2 className="text-2xl bg-primary text-white p-3 rounded-full px-5">
              {interviewInfo?.userName[0]}
            </h2>
          </div>
          <h2>{interviewInfo?.userName}</h2>
        </div>
      </div>

      <div className="flex gap-5 items-center justify-center mt-7">
        <Mic className="h-12 w-12 p-3 bg-gray-500 text-white rounded-full cursor-pointer" />
        <AlertConfirmation stopInterview={() => stopInterview()}>
          <Phone className="h-12 w-12 p-3 bg-red-500 text-white rounded-full cursor-pointer" />
        </AlertConfirmation>
      </div>
    </div>
  );
}

export default StartInterview;
