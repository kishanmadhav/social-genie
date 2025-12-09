'use client'

import { useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up">
      <div className={`flex items-center space-x-3 px-6 py-4 rounded-xl shadow-lg backdrop-blur-md border ${
        type === 'success' 
          ? 'bg-green-50/90 border-green-200 text-green-800' 
          : 'bg-red-50/90 border-red-200 text-red-800'
      }`}>
        {type === 'success' ? (
          <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
        ) : (
          <XCircleIcon className="w-6 h-6 flex-shrink-0" />
        )}
        <p className="font-medium">{message}</p>
        <button 
          onClick={onClose}
          className="ml-4 hover:opacity-70 transition-opacity"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
