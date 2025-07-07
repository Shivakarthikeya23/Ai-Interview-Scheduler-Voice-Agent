import React from 'react'
import { Brain, Zap } from 'lucide-react'

function Logo({ className = "", size = "default" }) {
  const sizeClasses = {
    small: "text-lg",
    default: "text-2xl",
    large: "text-4xl"
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Brain className={`${sizeClasses[size]} text-primary`} />
        <Zap className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
      </div>
      <span className={`font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent ${sizeClasses[size]}`}>
        AI Recruiter
      </span>
    </div>
  )
}

export default Logo