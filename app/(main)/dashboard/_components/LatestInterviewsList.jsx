"use client"
import { Button } from '@/components/ui/button';
import { Camera, Plus, Video } from 'lucide-react';
import React, { useState } from 'react'

function LatestInterviewsList() {

    const [interviewList, setInterviewList] = useState([]);
  return (
    <div className='my-5'>
        <h2 className='font-bold text-2xl'>Previously Created Interviews</h2>
        { interviewList?.length==0 &&
        <div className='p-5 flex flex-col gap-3 items-center justify-center bg-white border border-gray-200 rounded-lg shadow-md'>
            <Video className='h-10 w-10 text-primary' />
            <h2 className='text-lg font-bold'>No Interviews Created Yet</h2>
            <Button><Plus /> Create New Interview </Button>
        </div>
    }
    </div>
    
    
  )
}

export default LatestInterviewsList