import { Phone, Video } from 'lucide-react'
import React from 'react'
import LatestInterviewsList from './LatestInterviewsList'
import Link from 'next/link'

function CreateOptions() {
  return (
    <div>
    <div className='grid grid-cols-2 gap-5'>
        <Link href={'/dashboard/create-interview'} className='bg-white border border-gray-200 rounded-lg p-5'>
            <Video className='p-3 text-primary bg-green-50 rounded-lg h-12 w-12'  />
            <h2 className='text-lg font-bold'>Create New Interview</h2>
            <p className='text-gray-500'> Create AI interviews and schedule with candidates</p>
        
        </Link>
        <div className='bg-white border border-gray-200 rounded-lg p-5'>
            <Phone className='p-3 text-primary bg-green-50 rounded-lg h-12 w-12'  />
            <h2 className='text-lg font-bold'>Create Phone screening call</h2>
            <p className='text-gray-500'> Create AI interviews and schedule with candidates</p>
        
        </div>
        
    </div>
    <LatestInterviewsList />
    </div>
  )
}

export default CreateOptions