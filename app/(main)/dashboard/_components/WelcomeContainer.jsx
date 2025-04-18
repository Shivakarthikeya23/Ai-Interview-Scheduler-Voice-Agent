"use client";
import { useUser } from '@/app/Provider';
import Image from 'next/image';
import React from 'react'

function WelcomeContainer() {
  const {user} = useUser();

  return (
    <div className='bg-white m-8 mb-0 p-5 rounded-2xl flex items-center justify-between shadow-md'>
      <div >
      <h2 className='text-lg font-bold'>Welcome back , {user?.name}!</h2>
      <h2 className='text-gray-400'>AI-Driven Interviews, Best Resource for Interview Preparation</h2>
      </div>
      {user && <Image src={user?.picture} alt="user-avatar" width={40} height={40} className='rounded-full' />}
    </div>
  )
}

export default WelcomeContainer