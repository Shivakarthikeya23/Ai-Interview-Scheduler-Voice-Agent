"use client"
import { Button } from '@/components/ui/button'
import { supabase } from '@/services/supabaseClient'
import React from 'react'

function Login() {

    const signInwithGoogle = async () => {
        const {error} = await supabase.auth.signInWithOAuth({
            provider: 'google',
        })
        if(error) console.log('Error signing in with Google:', error.message)
    }
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
        <div className='flex flex-col items-center border rounded-2xl p-8'> 
            <h1 className='text-4xl font-bold text-center'>AI Recruiter </h1>
            <div className='flex flex-col items-center gap-4'>
            <></>
            <h2 className='text-2xl fond-bold text-center'> Welcome to AI Recruiter </h2>
            <p className='text-gray-800'>Sign in with Google</p>
            <Button onClick ={signInwithGoogle}> Login With Google</Button>
        </div>
        </div>
    </div>
  )
}

export default Login