"use client";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Flashlight, Mic, Phone, Timer, AlertCircle } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import AlertConfirmation from "./_components/AlertConfirmation";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

function StartInterview() {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const [vapi, setVapi] = useState(null);
  const [activeUser, setActiveUser] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Timer effect - only run when call is active
  useEffect(() => {
    let interval;
    if (isCallActive && callStarted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive, callStarted]);

  // Format timer display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize Vapi
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_VAPI_API_KEY) {
      try {
        const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);
        setVapi(vapiInstance);
      } catch (error) {
        console.error("Error initializing Vapi:", error);
        setError("Failed to initialize voice interface. Please check your configuration.");
        toast.error("Voice interface initialization failed");
      }
    } else {
      setError("Voice interface not configured. Please check environment variables.");
    }
  }, []);

  // Start call when interview info and vapi are ready
  useEffect(() => {
    if (interviewInfo && vapi && !callStarted && !error) {
      startCall();
    }
  }, [interviewInfo, vapi, callStarted, error]);

  const startCall = useCallback(() => {
    if (!vapi || !interviewInfo?.interviewData?.questionList || callStarted) return;
    
    try {
      let questionList = "";
      interviewInfo.interviewData.questionList.forEach((item, index) => {
        questionList += `${index + 1}. ${item.question}\n`;
      });

      const assistantOptions = {
        name: "AI Recruiter",
        firstMessage: `Hi ${interviewInfo?.userName}, how are you? Ready for your interview for the ${interviewInfo?.interviewData?.jobPosition} position? Let's begin!`,
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
              content: `You are an AI voice assistant conducting interviews for the position of ${interviewInfo?.interviewData?.jobPosition}.

Your job is to ask candidates the provided interview questions and assess their responses professionally.

Begin the conversation with a friendly introduction, setting a relaxed yet professional tone.

Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. 

Here are the interview questions to ask one by one:
${questionList}

Guidelines:
- Be friendly, engaging, and professional
- Keep responses short and natural, like a real conversation
- If the candidate struggles, offer hints or rephrase the question
- Provide brief, encouraging feedback after each answer
- After all questions are asked, wrap up the interview smoothly
- Keep the interview focused on the role and questions provided
- End on a positive note thanking them for their time

Duration: ${interviewInfo?.interviewData?.duration} minutes

Remember to maintain a professional yet conversational tone throughout the interview.`,
            },
          ],
        },
      };

      vapi.start(assistantOptions);
      setCallStarted(true);
      toast.success("Starting interview call...");
    } catch (error) {
      console.error("Error starting call:", error);
      setError("Failed to start interview call");
      toast.error("Failed to start interview call");
    }
  }, [vapi, interviewInfo, callStarted]);

  const stopInterview = useCallback(async () => {
    try {
      setIsGeneratingFeedback(true);
      
      // Stop the call first
      if (vapi && isCallActive) {
        vapi.stop();
        setIsCallActive(false);
        setCallStarted(false);
        toast.success("Interview ended successfully");
      }

      // Generate feedback if we have conversation data
      if (conversation && conversation.length > 0) {
        await GenerateFeedback();
      } else {
        toast.info("No conversation data available for feedback");
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error("Error stopping interview:", error);
      toast.error("Error ending interview");
      setIsGeneratingFeedback(false);
      // Still redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }, [vapi, isCallActive, conversation, router]);

  // Vapi event listeners
  useEffect(() => {
    if (!vapi) return;

    const handleCallStart = () => {
      console.log("Call has started");
      setIsCallActive(true);
      setTimer(0);
      toast.success("Interview call connected!");
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
      setIsCallActive(false);
      setCallStarted(false);
      toast.info("Interview call ended");
      
      // Only generate feedback if not already generating
      if (!isGeneratingFeedback && conversation && conversation.length > 0) {
        GenerateFeedback();
      } else if (!isGeneratingFeedback) {
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    };

    const handleMessage = (message) => {
      console.log("Message received:", message);
      if (message?.conversation) {
        setConversation(message.conversation);
      }
    };

    const handleError = (error) => {
      console.error("Vapi error:", error);
      toast.error("Interview call error occurred");
      setIsCallActive(false);
      setCallStarted(false);
      setError("Voice interface error occurred");
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);

    return () => {
      vapi.off("call-start", handleCallStart);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("call-end", handleCallEnd);
      vapi.off("message", handleMessage);
      vapi.off("error", handleError);
    };
  }, [vapi, conversation, router, isGeneratingFeedback]);

  const GenerateFeedback = async () => {
    if (!conversation || conversation.length === 0) {
      toast.error("No conversation data available for feedback");
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return;
    }

    setIsGeneratingFeedback(true);
    toast.info("Generating interview feedback...");

    try {
      const result = await axios.post("/api/ai-feedback", {
        conversation: conversation,
      });

      console.log("Feedback generated:", result?.data);
      
      if (result?.data?.content) {
        const content = result.data.content;
        const cleanedContent = content.replace(/```json|```/g, '').trim();
        
        try {
          const feedbackData = JSON.parse(cleanedContent);
          console.log("Parsed feedback:", feedbackData);
          
          // Store feedback in localStorage for now (in production, save to database)
          localStorage.setItem('interviewFeedback', JSON.stringify({
            feedback: feedbackData,
            interviewId: interviewInfo?.interviewData?.interviewId,
            candidateName: interviewInfo?.userName,
            candidateEmail: interviewInfo?.userEmail,
            jobPosition: interviewInfo?.interviewData?.jobPosition,
            timestamp: new Date().toISOString()
          }));
          
          toast.success("Interview feedback generated successfully!");
          
          // Redirect to feedback page instead of dashboard
          setTimeout(() => {
            router.push('/feedback');
          }, 2000);
        } catch (parseError) {
          console.error("Error parsing feedback:", parseError);
          toast.error("Error processing feedback data");
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Failed to generate interview feedback");
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (vapi && isCallActive) {
        try {
          vapi.stop();
        } catch (error) {
          console.error("Error stopping call on unmount:", error);
        }
      }
    };
  }, [vapi, isCallActive]);

  // Redirect if no interview info
  useEffect(() => {
    if (!interviewInfo && typeof window !== 'undefined') {
      toast.error("No interview session found. Redirecting to dashboard.");
      router.push('/dashboard');
    }
  }, [interviewInfo, router]);

  if (!interviewInfo) {
    return (
      <div className="p-20 lg:px-48 xl:px-56 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-20 lg:px-48 xl:px-56 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Interview Setup Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-20 lg:px-48 xl:px-56">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-bold text-xl">AI Interview Session</h2>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
          <Timer className="w-5 h-5 text-primary" />
          <span className="font-mono text-lg font-semibold">
            {formatTime(timer)}
          </span>
          {isCallActive && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-2"></div>
          )}
        </div>
      </div>

      {/* Interview Status */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">
              {interviewInfo?.interviewData?.jobPosition} Interview
            </h3>
            <p className="text-gray-600">
              Candidate: {interviewInfo?.userName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium">
              {isCallActive ? 'Live' : callStarted ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {/* AI Interviewer */}
        <div className="bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center shadow-lg">
          <div className="relative">
            {!activeUser && isCallActive && (
              <span className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping" />
            )}
            <Image
              src={"/ai.png"}
              alt="AI Interviewer"
              width={100}
              height={100}
              className="w-[80px] h-[80px] rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
          <h3 className="font-semibold text-lg">AI Recruiter</h3>
          <p className="text-sm text-gray-600 text-center px-4">
            {isCallActive ? 'Conducting interview...' : callStarted ? 'Connecting...' : 'Ready to start interview'}
          </p>
        </div>

        {/* Candidate */}
        <div className="bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center shadow-lg">
          <div className="relative">
            {activeUser && isCallActive && (
              <span className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping" />
            )}
            <div className="w-[80px] h-[80px] bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
              {interviewInfo?.userName?.[0]?.toUpperCase() || 'C'}
            </div>
          </div>
          <h3 className="font-semibold text-lg">{interviewInfo?.userName}</h3>
          <p className="text-sm text-gray-600 text-center px-4">
            {isCallActive ? (activeUser ? 'Speaking...' : 'Listening...') : callStarted ? 'Connecting...' : 'Waiting to connect'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-5 items-center justify-center mt-8">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
          <Mic className={`w-5 h-5 ${isCallActive ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">
            {isCallActive ? 'Microphone Active' : 'Microphone Off'}
          </span>
        </div>
        
        <AlertConfirmation stopInterview={stopInterview}>
          <button 
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isGeneratingFeedback}
          >
            <Phone className="w-5 h-5" />
            {isGeneratingFeedback ? 'Ending...' : 'End Interview'}
          </button>
        </AlertConfirmation>
      </div>

      {/* Feedback Generation Status */}
      {isGeneratingFeedback && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <div>
              <p className="font-medium text-blue-800">Generating Interview Feedback</p>
              <p className="text-sm text-blue-600">Please wait while we analyze the interview...</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Interview Instructions:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Speak clearly and at a normal pace</li>
          <li>• Wait for the AI to finish asking questions before responding</li>
          <li>• Take your time to think before answering</li>
          <li>• Click "End Interview" when you're ready to finish</li>
          <li>• Your interview will be automatically saved and feedback generated</li>
        </ul>
      </div>
    </div>
  );
}

export default StartInterview;