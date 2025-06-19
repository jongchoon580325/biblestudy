'use client'

import { useState, useEffect } from 'react'
import { useCategoryStore } from '@/store/categoryStore'
import CategoryAccordion from './CategoryAccordion'
import CategoryAddModal from './CategoryAddModal'

export default function CategoryManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { fetchCategories } = useCategoryStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">카테고리 관리</h2>
        <div className="flex items-center">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            카테고리 추가
          </button>
        </div>
      </div>
      <CategoryAccordion />
      <CategoryAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
} 