import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  
import React, { useEffect, useState } from 'react'
import { InterviewType } from '@/services/Constants'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

function FormContainer({onHandleInputChange}) {

    const [interviewType, setInterviewType] = useState([]);

    useEffect(() => {
        if(interviewType){
            onHandleInputChange('type', interviewType)
        }
    }, [interviewType])

  return (
    <div className='p-5 bg-white rounded-2xl'>
        <div>
            <h2 className='text-sm font-medium'>Job Position</h2>
            <Input placeholder='e.g. Software Engineer' className='w-mt-2'
                onChange={(event) => onHandleInputChange('jobPosition', event.target.value)}
            />
        </div>
        <div className='mt-5'>
            <h2 className='text-sm font-medium'>Job Description</h2>
            <Textarea placeholder='Enter detailed job description' className='h-[200px] mt-2' 
                onChange={(event) => onHandleInputChange('jobDescription', event.target.value)}
            />
        </div>
        <div className='mt-5'>
            <h2 className='text-sm font-medium'>Interview Duraton</h2>
            <Select onValueChange={(value) => onHandleInputChange('duration', value)} defaultValue="5" className="w-full mt-2">
  <SelectTrigger className="w-full mt-2">
    <SelectValue placeholder="Select Duration" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="5">5 Min</SelectItem>
    <SelectItem value="15">15 Min</SelectItem>
    <SelectItem value="30">30 Min</SelectItem>
    <SelectItem value="45">45 Min</SelectItem>
    <SelectItem value="60">60 Min</SelectItem>
  </SelectContent>
</Select>
        </div>
        <div className='mt-5'>
            <h2 className='text-sm font-medium'>Interview Type</h2>
            <div className='flex flex-wrap gap-3 mt-2'>
                {InterviewType.map((type, index) => (
                    <div key={index} className='flex items-center gap-2 mt-2 p-1 px-2
                     bg-white border border-gray-300  
                     rounded-lg hover:bg-secondary'
                     onClick={() => setInterviewType(prev => [...prev, type.title])}
                    >
                        <type.icon className='w-4 h-4'/>
                        <span>{type.title}</span>
                    </div>
                ))}
            </div>
        </div>
        <div className='mt-7 flex justify-end'>
        <Button>Generate Question <ArrowRight /> </Button>
        </div>
    </div>
  )
}

export default FormContainer