"use client";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Mic, Phone, Timer, AlertCircle, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
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
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const router = useRouter();
  const timerRef = useRef(null);
  const feedbackGeneratedRef = useRef(false);

  // Timer effect - more reliable implementation
  useEffect(() => {
    if (isCallActive && callStarted) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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
    if (typeof window !== 'undefined') {
      const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
      if (!apiKey) {
        setError("Voice interface not configured. Please contact support.");
        toast.error("Voice interface configuration missing");
        return;
      }

      try {
        const vapiInstance = new Vapi(apiKey);
        setVapi(vapiInstance);
        setConnectionStatus('ready');
      } catch (error) {
        console.error("Error initializing Vapi:", error);
        setError("Failed to initialize voice interface. Please refresh and try again.");
        toast.error("Voice interface initialization failed");
      }
    }
  }, []);

  // Start call when interview info and vapi are ready
  useEffect(() => {
    if (interviewInfo && vapi && !callStarted && !error && connectionStatus === 'ready') {
      const timer = setTimeout(() => {
        startCall();
      }, 1000); // Small delay to ensure everything is ready

      return () => clearTimeout(timer);
    }
  }, [interviewInfo, vapi, callStarted, error, connectionStatus]);

  const startCall = useCallback(() => {
    if (!vapi || !interviewInfo?.interviewData?.questionList || callStarted) return;
    
    try {
      setConnectionStatus('connecting');
      
      let questionList = "";
      interviewInfo.interviewData.questionList.forEach((item, index) => {
        questionList += `${index + 1}. ${item.question}\n`;
      });

      const assistantOptions = {
        name: "AI Recruiter",
        firstMessage: `Hi ${interviewInfo?.userName}, welcome to your interview for the ${interviewInfo?.interviewData?.jobPosition} position. I'm your AI interviewer today. Are you ready to begin?`,
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
              content: `You are an AI voice assistant conducting a professional interview for the position of ${interviewInfo?.interviewData?.jobPosition}.

Your responsibilities:
1. Conduct a structured interview using the provided questions
2. Maintain a professional yet friendly tone
3. Ask one question at a time and wait for complete responses
4. Provide brief acknowledgments between questions
5. Keep the interview focused and within the allocated time

Interview Questions (ask these in order):
${questionList}

Guidelines:
- Start with a warm greeting and brief introduction
- Ask questions clearly and give candidates time to think
- Provide brief positive feedback after each answer
- If a candidate asks for clarification, rephrase the question
- Keep your responses concise and professional
- End the interview by thanking the candidate

Duration: ${interviewInfo?.interviewData?.duration} minutes
Interview Type: ${Array.isArray(interviewInfo?.interviewData?.type) ? interviewInfo.interviewData.type.join(', ') : interviewInfo?.interviewData?.type || 'General'}

Remember: You are evaluating this candidate for a real position, so maintain professionalism throughout.`,
            },
          ],
        },
      };

      vapi.start(assistantOptions);
      setCallStarted(true);
      toast.success("Connecting to interview...");
    } catch (error) {
      console.error("Error starting call:", error);
      setError("Failed to start interview call. Please refresh and try again.");
      setConnectionStatus('error');
      toast.error("Failed to start interview call");
    }
  }, [vapi, interviewInfo, callStarted]);

  const stopInterview = useCallback(async () => {
    if (feedbackGeneratedRef.current) return; // Prevent multiple calls
    
    try {
      setIsGeneratingFeedback(true);
      feedbackGeneratedRef.current = true;
      
      // Stop the call first
      if (vapi && isCallActive) {
        vapi.stop();
        setIsCallActive(false);
        setCallStarted(false);
        setConnectionStatus('disconnected');
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        toast.success("Interview ended successfully");
      }

      // Generate feedback if we have conversation data
      if (conversation && conversation.length > 0) {
        await GenerateFeedback();
      } else {
        toast.info("Interview ended. Redirecting to dashboard...");
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error("Error stopping interview:", error);
      toast.error("Error ending interview");
      setIsGeneratingFeedback(false);
      feedbackGeneratedRef.current = false;
      
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
      setConnectionStatus('connected');
      setTimer(0);
      toast.success("Interview call connected!");
    };

    const handleSpeechStart = () => {
      console.log("AI speech started");
      setActiveUser(false);
    };

    const handleSpeechEnd = () => {
      console.log("AI speech ended");
      setActiveUser(true);
    };

    const handleCallEnd = () => {
      console.log("Interview call has ended");
      setIsCallActive(false);
      setCallStarted(false);
      setConnectionStatus('disconnected');
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast.info("Interview call ended");
      
      // Only generate feedback if not already generating
      if (!feedbackGeneratedRef.current && conversation && conversation.length > 0) {
        feedbackGeneratedRef.current = true;
        GenerateFeedback();
      } else if (!feedbackGeneratedRef.current) {
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
      setConnectionStatus('error');
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
  }, [vapi, conversation, router]);

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
          
          // Store feedback in localStorage with unique key
          const feedbackKey = `interviewFeedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const feedbackObject = {
            feedback: feedbackData,
            interviewId: interviewInfo?.interviewData?.interviewId,
            candidateName: interviewInfo?.userName,
            candidateEmail: interviewInfo?.userEmail,
            jobPosition: interviewInfo?.interviewData?.jobPosition,
            timestamp: new Date().toISOString(),
            duration: timer,
            totalQuestions: interviewInfo?.interviewData?.questionList?.length || 0
          };
          
          localStorage.setItem(feedbackKey, JSON.stringify(feedbackObject));
          // Also store in main key for immediate feedback viewing
          localStorage.setItem('interviewFeedback', JSON.stringify(feedbackObject));
          
          toast.success("Interview feedback generated successfully!");
          
          // Redirect to feedback page
          setTimeout(() => {
            router.push('/feedback');
          }, 1500);
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

  const toggleMute = useCallback(() => {
    if (vapi && isCallActive) {
      try {
        if (isMuted) {
          vapi.setMuted(false);
          setIsMuted(false);
          toast.success("Microphone unmuted");
        } else {
          vapi.setMuted(true);
          setIsMuted(true);
          toast.success("Microphone muted");
        }
      } catch (error) {
        console.error("Error toggling mute:", error);
        toast.error("Failed to toggle microphone");
      }
    }
  }, [vapi, isCallActive, isMuted]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
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

  // Auto-end interview based on duration
  useEffect(() => {
    if (interviewInfo?.interviewData?.duration && timer > 0) {
      const maxDuration = parseInt(interviewInfo.interviewData.duration) * 60; // Convert to seconds
      if (timer >= maxDuration && isCallActive) {
        toast.info("Interview time limit reached. Ending interview...");
        stopInterview();
      }
    }
  }, [timer, interviewInfo, isCallActive, stopInterview]);

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

  const maxDuration = parseInt(interviewInfo?.interviewData?.duration || 0) * 60;
  const progressPercentage = maxDuration > 0 ? (timer / maxDuration) * 100 : 0;

  return (
    <div className="p-6 lg:px-12 xl:px-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-bold text-xl">AI Interview Session</h2>
          <p className="text-gray-600">{interviewInfo?.interviewData?.jobPosition}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
            <Timer className="w-5 h-5 text-primary" />
            <span className="font-mono text-lg font-semibold">
              {formatTime(timer)}
            </span>
            {maxDuration > 0 && (
              <span className="text-sm text-gray-500">
                / {formatTime(maxDuration)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium capitalize">
              {connectionStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {maxDuration > 0 && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

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
            <p className="text-sm text-gray-500">
              {interviewInfo?.interviewData?.questionList?.length || 0} questions • {interviewInfo?.interviewData?.duration} minutes
            </p>
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
            {connectionStatus === 'connected' ? 
              (!activeUser ? 'Speaking...' : 'Listening...') : 
              connectionStatus === 'connecting' ? 'Connecting...' : 
              'Ready to start interview'
            }
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
            {connectionStatus === 'connected' ? 
              (activeUser ? 'Your turn to speak' : 'Listening to AI') : 
              connectionStatus === 'connecting' ? 'Connecting...' : 
              'Waiting to connect'
            }
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 items-center justify-center mt-8 flex-wrap">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
          <Mic className={`w-5 h-5 ${isCallActive && !isMuted ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">
            {isCallActive ? (isMuted ? 'Microphone Muted' : 'Microphone Active') : 'Microphone Off'}
          </span>
        </div>

        {isCallActive && (
          <button
            onClick={toggleMute}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        )}
        
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
              <p className="text-sm text-blue-600">Please wait while we analyze the interview and prepare your feedback...</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Interview Guidelines:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Speak clearly and at a normal pace</li>
          <li>• Wait for the AI to finish asking questions before responding</li>
          <li>• Take your time to think before answering</li>
          <li>• Use the mute button if you need a moment</li>
          <li>• Click "End Interview" when you're ready to finish</li>
          <li>• Your interview will be automatically saved and feedback generated</li>
        </ul>
      </div>
    </div>
  );
}

export default StartInterview;