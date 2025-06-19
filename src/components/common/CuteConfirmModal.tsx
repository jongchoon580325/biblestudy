import React from 'react'

interface CuteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  message: string
  confirmText?: string
}

export default function CuteConfirmModal({ isOpen, onClose, onConfirm, message, confirmText = '내보내기' }: CuteConfirmModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-80 flex flex-col items-center animate-bounce-in">
        <span className="text-3xl mb-2">🐰</span>
        <div className="text-center text-base font-semibold mb-4 text-gray-800 dark:text-gray-100">{message}</div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 rounded-lg bg-pink-400 text-white hover:bg-pink-500 transition-colors font-bold"
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounce-in 0.3s; }
      `}</style>
    </div>
  )
} 