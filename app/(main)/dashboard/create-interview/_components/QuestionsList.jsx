import axios from 'axios';
import { Loader2, Loader2Icon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import QuestionListContainer from './QuestionListContainer';
import { supabase } from '@/services/supabaseClient';
import { useUser } from '@/app/Provider';
import { Button } from '@/components/ui/button';
import { v4 } from 'uuid';

function QuestionsList({formData, onCreateLink}) {

    const [loading, setLoading] = useState(true);
    const [questionList, setQuestionList] = useState();
    const {user} = useUser();
    const [saveLoading, setSaveLoading] = useState(false);
    useEffect(() => {
        if(formData){
            GenerateQuestionList()
        } 
    }, [formData])

    const GenerateQuestionList = async () =>{
        setLoading(true);
        try{
        const result = await axios.post("/api/ai-model", {
            ...formData
        })
        console.log("Result", result.data.content);
        const content = result.data?.content;

        if (typeof content === 'string') {
          const cleaned = content.replace(/```json|```/g, '').trim();
          try {
            const parsed = JSON.parse(cleaned);
            setQuestionList(parsed?.interviewQuestions || []); // Just store the array directly
          } catch (err) {
            console.error("Failed to parse interview questions:", err);
            setQuestionList([]);
          }
        }

        }catch(error){
            console.log(error);
            setLoading(false);
        }finally{
            setLoading(false);
        }
    }

    const onFinish = async () => {
      setSaveLoading(true);
      const interviewId = v4();
    
      const payload = {
        ...formData,
        questionList,
        userEmail: user?.email,
        interviewId
      };
    
      // Clean undefineds
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) delete payload[key];
      });    
      const { data, error } = await supabase
        .from('Interviews')
        .insert([payload])
        .select();
    
      setSaveLoading(false);
      if (error) {
        console.error("Insert failed:", error);
      } else {
        console.log("Insert success, data:", data);
      }

      onCreateLink(interviewId)
    };
    
   
  return (
    <div>
      {loading&&<div className='p-5 bg-green-100 rounded-xl border border-green-100 flex items-center gap-5'>
        <Loader2Icon className='animate-spin' />
        <div>
            <h2 className='font-medium'> Generating Interview Questions</h2>
            <p className='text-primary'> AI is generating the personalized questions based on the job description</p>
        </div>
        
       
    </div>
    }
     {questionList?.length > 0 && (
        <div>
            <QuestionListContainer questionList={questionList} />
        </div>
    )}

    <div>
        <Button className='flex justify-end mt-10' onClick={()=>onFinish()} disabled={saveLoading}>
          {saveLoading&&<Loader2 className='animate-spin' />}
          Create Interview Link & Finish</Button>
    </div>

    </div>
  )
}

export default QuestionsList
