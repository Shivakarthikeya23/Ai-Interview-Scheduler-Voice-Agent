import React from 'react'
import WelcomeContainer from './_components/WelcomeContainer'
import CreateOptions from './_components/CreateOptions'
import InterviewStats from './_components/InterviewStats'
import QuickActions from './_components/QuickActions'

function Dashboard() {
  return (
    <div> 
    <h2 className='my-3 font-bold text-2xl'>Dashboard</h2>
    <InterviewStats />
    <CreateOptions />
    </div>
    
  )
}

export default Dashboard