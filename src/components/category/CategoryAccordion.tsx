'use client'

import React, { useState } from 'react'
import { ChevronDown, Folder, FolderOpen, Plus, Edit, Trash2 } from 'lucide-react'
import { useCategoryStore } from '@/store/categoryStore'
import CategoryItemAddModal from './CategoryItemAddModal'
import CuteConfirmModal from '@/components/common/CuteConfirmModal'
import Toast from '@/components/common/Toast'

export default function CategoryAccordion() {
  const { categories, expandedGroups, toggleGroup, deleteCategory, deleteItem, updateItem, updateCategory } = useCategoryStore()
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [selectedGroupName, setSelectedGroupName] = useState<string>('')
  const [itemDeleteModal, setItemDeleteModal] = useState<{ open: boolean; groupId: string; itemId: string; itemName: string }>({ open: false, groupId: '', itemId: '', itemName: '' })
  const [toast, setToast] = useState<{ open: boolean; message: string; type?: 'success'|'error'|'info' }>({ open: false, message: '', type: 'success' })
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState<string>('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemGroupId, setEditingItemGroupId] = useState<string>('')
  const [editingItemName, setEditingItemName] = useState<string>('')
  const [groupDeleteModal, setGroupDeleteModal] = useState<{ open: boolean; groupId: string; groupName: string }>({ open: false, groupId: '', groupName: '' })

  const handleToggle = (categoryId: string) => {
    setOpenCategoryId(openCategoryId === categoryId ? null : categoryId)
    toggleGroup(categoryId)
  }

  const handleAddItem = (groupId: string, groupName: string) => {
    setSelectedGroupId(groupId)
    setSelectedGroupName(groupName)
    setIsAddItemModalOpen(true)
  }

  // 그룹 인라인 수정 핸들러
  const startEditGroup = (groupId: string, name: string) => {
    setEditingGroupId(groupId)
    setEditingGroupName(name)
  }
  const saveEditGroup = () => {
    if (editingGroupId && editingGroupName.trim()) {
      updateCategory(editingGroupId, { name: editingGroupName.trim() })
      setToast({ open: true, message: '그룹명이 수정되었습니다.', type: 'success' })
    }
    setEditingGroupId(null)
    setEditingGroupName('')
  }
  const cancelEditGroup = () => {
    setEditingGroupId(null)
    setEditingGroupName('')
  }

  // 아이템 인라인 수정 핸들러
  const startEditItem = (groupId: string, itemId: string, name: string) => {
    setEditingItemId(itemId)
    setEditingItemGroupId(groupId)
    setEditingItemName(name)
  }
  const saveEditItem = () => {
    if (editingItemId && editingItemGroupId && editingItemName.trim()) {
      updateItem(editingItemGroupId, editingItemId, { name: editingItemName.trim() })
      setToast({ open: true, message: '항목명이 수정되었습니다.', type: 'success' })
    }
    setEditingItemId(null)
    setEditingItemGroupId('')
    setEditingItemName('')
  }
  const cancelEditItem = () => {
    setEditingItemId(null)
    setEditingItemGroupId('')
    setEditingItemName('')
  }

  return (
    <div className="space-y-4">
      {categories.map((group) => {
        const isExpanded = expandedGroups.has(group.id)
        
        return (
          <div
            key={group.id}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
          >
            {/* 카테고리 헤더 */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleToggle(group.id)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronDown
                    className={`h-4 w-4 transform transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div className="text-blue-400">
                  {isExpanded ? (
                    <FolderOpen className="h-4 w-4" />
                  ) : (
                    <Folder className="h-4 w-4" />
                  )}
                </div>
                {editingGroupId === group.id ? (
                  <input
                    className="text-base font-normal text-white bg-black rounded px-1 py-0.5 focus:outline-none"
                    value={editingGroupName}
                    autoFocus
                    onChange={e => setEditingGroupName(e.target.value)}
                    onBlur={saveEditGroup}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEditGroup()
                      if (e.key === 'Escape') cancelEditGroup()
                    }}
                    style={{ minWidth: 80 }}
                  />
                ) : (
                  <h3 className="text-base font-normal text-white">
                    {group.name}
                  </h3>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleAddItem(group.id, group.name)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="항목 추가"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                  title="카테고리 수정"
                  onClick={() => startEditGroup(group.id, group.name)}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setGroupDeleteModal({ open: true, groupId: group.id, groupName: group.name })}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="카테고리 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 카테고리 아이템 목록 */}
            {isExpanded && (
              <div className="border-t border-gray-700">
                {group.category_items.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    등록된 항목이 없습니다
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-700">
                    {group.category_items.map((item) => (
                      <li
                        key={item.id}
                        className="p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                      >
                        {editingItemId === item.id ? (
                          <input
                            className="text-sm font-normal text-white bg-black rounded px-1 py-0.5 focus:outline-none"
                            value={editingItemName}
                            autoFocus
                            onChange={e => setEditingItemName(e.target.value)}
                            onBlur={saveEditItem}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEditItem()
                              if (e.key === 'Escape') cancelEditItem()
                            }}
                            style={{ minWidth: 60 }}
                          />
                        ) : (
                          <span className="text-sm font-normal text-gray-300">{item.name}</span>
                        )}
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="항목 수정"
                            onClick={() => startEditItem(group.id, item.id, item.name)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setItemDeleteModal({ open: true, groupId: group.id, itemId: item.id, itemName: item.name })}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="항목 삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* 아이템 추가 모달 */}
      <CategoryItemAddModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        groupId={selectedGroupId}
        groupName={selectedGroupName}
      />

      {/* 아이템 삭제 확인 모달 */}
      <CuteConfirmModal
        isOpen={itemDeleteModal.open}
        onClose={() => setItemDeleteModal({ ...itemDeleteModal, open: false })}
        onConfirm={() => {
          deleteItem(itemDeleteModal.groupId, itemDeleteModal.itemId)
        }}
        message={`'${itemDeleteModal.itemName}' 항목을 정말 삭제하시겠습니까?`}
        confirmText="삭제"
      />

      <CuteConfirmModal
        isOpen={groupDeleteModal.open}
        onClose={() => setGroupDeleteModal({ ...groupDeleteModal, open: false })}
        onConfirm={() => {
          deleteCategory(groupDeleteModal.groupId)
        }}
        message={`'${groupDeleteModal.groupName}' 그룹을 정말 삭제하시겠습니까? 하위 항목도 모두 삭제됩니다.`}
        confirmText="삭제"
      />

      <Toast
        isOpen={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  )
} 