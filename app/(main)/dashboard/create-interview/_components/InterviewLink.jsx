import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { ArrowLeft, Clock, Copy, List, Mail, Plus } from 'lucide-react';
import Image from 'next/image'
import Link from 'next/link';
import React from 'react'
import { toast } from 'sonner';

function InterviewLink({interviewId, formData}) {
  const url = process.env.NEXT_PUBLIC_HOST_URL+'/'+interviewId;

  const GetInterviewUrl=()=>{
    return url;
  }

  const onCopyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast("Link Copied to clipboard");
  }
  return (
    <div className='flex w-full items-center justify-center flex-col gap-5'>
      <Image src={'/Check.png'} alt='Check' width={100} height={100} className='w-[50px] h-[50px] mx-auto'/>
      <h2 className='font-bold text-lg'> Your AI interview is Ready</h2>
      <p>Share this Link with your candidates to start the interview</p>
      <div className='w-full p-7 mt-6 rounded-xl bg-white'>
        <div className='flex justify-between items-center'>
          <h2 className='font-bold'>Interview Link</h2>
          <h2 className='p-1 px-2 text-primary bg-green-50 round'>Valid for 30 days</h2>
          
        </div>
        <div className='mt-3 flex gap-3 items-center'>
            <Input defaultValue={GetInterviewUrl()} readOnly className='bg-gray-50' />
            <Button onClick={()=>onCopyLink()}><Copy /> Copy Link</Button>
          </div>
          <hr className='my-5' />

          <div className='flex gap-5 items-center'>
            <h2 className='text-sm text-gray-500 flex gap-2 items-center'><Clock className='h-4 w-4'/> 30 min {formData?.duration}</h2>
            <h2 className='text-sm text-gray-500 flex gap-2 items-center'><List className='h-4 w-4'/> 10 </h2>

          </div>
      </div>

      <div className='mt-7 bg-white p-5 rounded-lg w-full'>
        <h2 className='font-bold'> Share Via</h2>
        <div className='flex gap-5 items-center mt-3'>
          <Button><Mail /> Email </Button>
          <Button><Mail /> Slack </Button>
          <Button><Mail /> Email </Button>
        </div>
      </div>
      <div className='flex w-full gap-5 mt-6 justify-between'>
        <Link href={'/dashboard'} className='w-full'>
        <Button><ArrowLeft /> Back to dashboard</Button>
        </Link>
        <Link href={'/dashboard/create-interview'+interviewId} className='w-full'>
        <Button><Plus />Create New Interview </Button>
        </Link>
      </div>
      </div>
  )
}

export default InterviewLink
