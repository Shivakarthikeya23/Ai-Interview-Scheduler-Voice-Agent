import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { ArrowLeft, Clock, Copy, List, Mail, Plus, Share, ExternalLink } from 'lucide-react';
import Image from 'next/image'
import Link from 'next/link';
import React from 'react'
import { toast } from 'sonner';

function InterviewLink({interviewId, formData}) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/interview/${interviewId}`;

  const GetInterviewUrl = () => {
    return url;
  }

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Interview link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Interview Invitation - ${formData?.jobPosition}`);
    const body = encodeURIComponent(`Hello,

You have been invited to participate in an AI-powered interview for the position of ${formData?.jobPosition}.

Interview Details:
- Duration: ${formData?.duration} minutes
- Questions: ${formData?.questionList?.length || 'Multiple'} questions
- Valid for: 30 days

Please click the link below to start your interview:
${url}

Best regards,
AI Recruiter Team`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }

  const openInterviewPreview = () => {
    window.open(url, '_blank');
  }

  return (
    <div className='flex w-full items-center justify-center flex-col gap-5'>
      <Image src={'/Check.png'} alt='Check' width={100} height={100} className='w-[50px] h-[50px] mx-auto'/>
      <h2 className='font-bold text-lg'> Your AI Interview is Ready</h2>
      <p className='text-center text-gray-600'>Share this link with your candidates to start the interview. The link is valid for 30 days.</p>
      
      <div className='w-full p-7 mt-6 rounded-xl bg-white shadow-md'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='font-bold'>Interview Link</h2>
          <span className='p-1 px-3 text-primary bg-green-50 rounded-full text-sm font-medium'>Valid for 30 days</span>
        </div>
        
        <div className='mt-3 flex gap-3 items-center'>
          <Input 
            defaultValue={GetInterviewUrl()} 
            readOnly 
            className='bg-gray-50 font-mono text-sm' 
          />
          <Button onClick={onCopyLink} className="shrink-0">
            <Copy className="w-4 h-4 mr-2" /> 
            Copy
          </Button>
          <Button onClick={openInterviewPreview} variant="outline" className="shrink-0">
            <ExternalLink className="w-4 h-4 mr-2" /> 
            Preview
          </Button>
        </div>
        
        <hr className='my-5' />

        <div className='flex gap-5 items-center flex-wrap'>
          <div className='text-sm text-gray-500 flex gap-2 items-center'>
            <Clock className='h-4 w-4'/> 
            {formData?.duration} minutes
          </div>
          <div className='text-sm text-gray-500 flex gap-2 items-center'>
            <List className='h-4 w-4'/> 
            {formData?.questionList?.length || 0} questions
          </div>
          <div className='text-sm text-gray-500 flex gap-2 items-center'>
            <Share className='h-4 w-4'/> 
            {Array.isArray(formData?.type) ? formData.type.join(', ') : formData?.type || 'General'} interview
          </div>
        </div>
      </div>

      <div className='mt-7 bg-white p-5 rounded-lg w-full shadow-md'>
        <h2 className='font-bold mb-3'>Share Interview</h2>
        <div className='flex gap-3 items-center flex-wrap'>
          <Button onClick={shareViaEmail} variant="outline">
            <Mail className="w-4 h-4 mr-2" /> 
            Email
          </Button>
          <Button 
            onClick={() => {
              const text = `Interview invitation for ${formData?.jobPosition}: ${url}`;
              if (navigator.share) {
                navigator.share({
                  title: `Interview - ${formData?.jobPosition}`,
                  text: text,
                  url: url
                });
              } else {
                navigator.clipboard.writeText(text);
                toast.success("Interview details copied to clipboard!");
              }
            }}
            variant="outline"
          >
            <Share className="w-4 h-4 mr-2" /> 
            Share
          </Button>
        </div>
      </div>
      
      <div className='flex w-full gap-5 mt-6 justify-between'>
        <Link href={'/dashboard'} className='w-full'>
          <Button variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> 
            Back to Dashboard
          </Button>
        </Link>
        <Link href={'/dashboard/create-interview'} className='w-full'>
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create New Interview 
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default InterviewLink;