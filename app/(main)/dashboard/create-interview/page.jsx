"use client"
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import FormContainer from './_components/FormContainer';
import QuestionsList from './_components/QuestionsList';
import { toast } from 'sonner';
import InterviewLink from './_components/InterviewLink';

function CreateInterview() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState();
    const onHandleInputChange = (field, value) => {
        setFormData(prev =>({
            ...prev,
            [field]: value
        }
        ))
        console.log("FormData", formData)
    }

    const onGoToNext = () => {
        if(formData?.jobPosition == "" || formData?.jobDescription == "" || formData?.duration == "" || formData?.type.length == 0){
            toast("Please fill all the fields")
            return ;
        }
        setStep(prev => prev + 1);
    }
  return (
    <div className='mt-10 px-10 md:px-24 lg:px-44 xl:px-56'>
        <div className='flex gap-5 items-center'>
            <ArrowLeft onClick={() => router.back()} className='cursor-pointer'/>
            <h2 className='font-bold text-2xl'>Create New Interview</h2>
        </div>
        <Progress value={step*33.33} className='my-5' />
        {step==1?<FormContainer onHandleInputChange={onHandleInputChange}
        GoToNext={()=>onGoToNext()} />
:step==2? <QuestionsList formData={formData} /> : 
step==3? <InterviewLink /> : null }
    </div>
  )
}

export default CreateInterview