import React, { useEffect } from 'react'

interface ToastProps {
  message: string
  isOpen: boolean
  onClose: () => void
  type?: 'success' | 'error' | 'info'
}

export default function Toast({ message, isOpen, onClose, type = 'success' }: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 2000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const color =
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    'bg-gray-800 text-white'

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-lg ${color} animate-toast-in`}
      style={{ minWidth: 200, textAlign: 'center' }}
    >
      {message}
      <style>{`
        @keyframes toast-in {
          0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-toast-in { animation: toast-in 0.3s; }
      `}</style>
    </div>
  )
} 