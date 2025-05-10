import React from 'react'

function QuestionListContainer({questionList}) {
  return (
    <div>
      <h2 className='font-bold text-large'> Interview Questions</h2>
            <p className='text-primary'> AI has generated the following interview questions based on the job description</p>
     <div className='p-5 border border-gray-300 rounded-xl'>
        {questionList.map((item, index) => (
        <div key={index} className='p-5 bg-white rounded-xl mb-3'>
            <h2 className='font-medium'>{item.question}</h2>
            <p className='text-primary'>Type: {item.type}</p>
        </div>
        ))}
        </div>
    </div>
  )
}

export default QuestionListContainer
