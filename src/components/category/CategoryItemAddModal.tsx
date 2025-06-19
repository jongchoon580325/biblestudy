'use client'

import { useState } from 'react'
import { useCategoryStore } from '@/store/categoryStore'
import { X } from 'lucide-react'

interface CategoryItemAddModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
  groupName: string
}

export default function CategoryItemAddModal({
  isOpen,
  onClose,
  groupId,
  groupName
}: CategoryItemAddModalProps) {
  const [name, setName] = useState('')
  const { addItem, categories } = useCategoryStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) return

    // 현재 그룹의 아이템 개수를 가져와서 순서 결정
    const currentGroup = categories.find(cat => cat.id === groupId)
    const nextOrder = currentGroup ? currentGroup.category_items.length + 1 : 1

    addItem(groupId, {
      id: crypto.randomUUID(),
      name: name.trim(),
      order: nextOrder
    })

    // 폼 초기화
    setName('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 모달 제목 */}
        <h2 className="text-xl font-semibold text-white mb-6">
          새 항목 추가
          <span className="block text-sm text-gray-400 mt-1">
            {groupName} 카테고리에 추가
          </span>
        </h2>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 항목 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              항목 이름
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="항목 이름을 입력하세요"
              required
              autoFocus
            />
          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 