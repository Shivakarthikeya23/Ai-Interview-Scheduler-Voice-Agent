"use client";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage() {
  const { interviewId } = useParams();
  const searchParams = useSearchParams();
  const noResponse = searchParams.get("noResponse") === "1";

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Thanks for participating</h1>
        <p className="text-gray-600 mb-6">
          {noResponse
            ? "The interview ended because no response was received. If you had technical issues, please try again or contact the recruiter."
            : "Your AI interview is complete. The recruiter will review your responses and let you know the next steps."}
        </p>
        <Link href="/">
          <Button>Return home</Button>
        </Link>
      </div>
    </div>
  );
}
