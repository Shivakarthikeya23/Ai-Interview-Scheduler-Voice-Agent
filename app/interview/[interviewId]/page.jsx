"use client";
import React, { useEffect, useState } from "react";
import InterviewHeader from "../_components/InterviewHeader";
import Image from "next/image";
import { Clock, Info, Loader2Icon, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import { InterviewDataContext } from "@/context/InterviewDataContext";

function Interview() {
  const { interviewId } = useParams();
  console.log("Interview ID", interviewId);

  const [interviewData, setInterviewData] = React.useState();
  const [userName, setUserName] = useState();
  const [userEmail, setUserEmail] = useState();
  const [loading, setLoading] = useState(false);
  const { interviewInfo, setInterviewInfo } =
    React.useContext(InterviewDataContext);
  const router = useRouter();

  useEffect(() => {
    interviewId && GetInterviewDetails();
  }, [interviewId]);

  const GetInterviewDetails = async () => {
    setLoading(true);
    try {
      let { data: Interviews, error } = await supabase
        .from("Interviews")
        .select("jobPosition,  jobDescription, duration, type")
        .eq("interviewId", interviewId);

      if (error || !Interviews?.length) {
        toast("Incorrect Interview link");
        return;
      }

      setInterviewData(Interviews[0]);
      console.log(Interviews[0]);
    } catch {
      toast("Incorrect Interview Link");
    } finally {
      setLoading(false);
    }
  };

  const onJoinInterview = async () => {
    setLoading(true);
    try {
      let { data: Interviews, error } = await supabase
        .from("Interviews")
        .select("*")
        .eq("interviewId", interviewId);

      if (error || !Interviews?.length) {
        toast("Unable to join interview. Please check the link and try again.");
        return;
      }

      console.log("Interviews", Interviews);
      setInterviewInfo({
        userName: userName,
        userEmail: userEmail,
        interviewData: Interviews[0],
      });
      router.push("/interview/" + interviewId + "/start");
    } catch (error) {
      console.error("Error joining interview:", error);
      toast("Unable to join interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-10 md:px-28 lg:px-48 xl:px-64 mt-16 p-2">
      <div className="flex flex-col items-center justify-center border rounded-xl bg-white p-7 lg:px-32 xl:px-52">
        <h2 className="text-2xl pt-4">AI Recruiter</h2>
        <h2>AI powered Interview Platform</h2>
        <Image
          src={"/interview.jpg"}
          alt="Interview"
          width={500}
          height={500}
          className="w-[350px] my-6"
        />

        <h2 className="font-bold text-xl">{interviewData?.jobPosition}</h2>
        <h2 className="flex gap-2 items-center text-gray-500 mt-3">
          <Clock />
          {interviewData?.duration} min
        </h2>

        <div className="w-full">
          <h2>Enter your full name</h2>
          <Input
            placeholder="e.g. John Smith"
            onChange={(event) => setUserName(event.target.value)}
          />
        </div>
        <div className="w-full">
          <h2>Enter your email</h2>
          <Input
            placeholder="e.g. John.Smith@gmail.com"
            onChange={(event) => setUserEmail(event.target.value)}
          />
        </div>
        <div className="p-3 bg-green-100 flex gap-4 rounded-lg mt-5">
          <Info className="text-primary" />
          <div>
            <h2 className="font-bold">Before you begin</h2>
            <ul>
              <li className="text-sm text-primary">
                {" "}
                - Ensure you have stable internet connection
              </li>
              <li className="text-sm text-primary">
                {" "}
                - Test your camera and microphone
              </li>
              <li className="text-sm text-primary">
                {" "}
                - No disturbances from surroundings
              </li>
            </ul>
          </div>
        </div>

        <Button
          className={"mt-5 w-full font-bold"}
          disabled={loading || !userName?.trim() || !userEmail?.trim()}
          onClick={() => onJoinInterview()}
        >
          <Video />
          {loading && <Loader2Icon />} Join Interview
        </Button>
      </div>
    </div>
  );
}

export default Interview;
