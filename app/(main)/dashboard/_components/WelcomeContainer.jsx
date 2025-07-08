"use client";
import { useUser } from '@/app/Provider';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

function WelcomeContainer() {
  const {user} = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className='bg-gradient-to-r from-primary/10 to-blue-500/10 m-8 mb-0 p-6 rounded-2xl flex items-center justify-between shadow-lg border border-primary/20'>
      <div >
      <h2 className='text-2xl font-bold text-gray-800'>Welcome back{mounted && user?.name ? `, ${user.name}` : ''}!</h2>
      <h2 className='text-gray-600 mt-1'>AI-Driven Interviews, Best Resource for Interview Preparation</h2>
      <div className='flex items-center gap-4 mt-3'>
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
          System Online
        </div>
        <div className='text-sm text-gray-600'>
          Last login: {new Date().toLocaleDateString()}
        </div>
      </div>
      </div>
      {mounted && user?.picture && (
        <div className='relative'>
          <Image src={user.picture} alt="user-avatar" width={50} height={50} className='rounded-full border-2 border-white shadow-md' />
          <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>
        </div>
      )}
    </div>
  )
}

export default WelcomeContainer