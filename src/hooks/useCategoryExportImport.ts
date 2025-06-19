import { useRef } from 'react'
import { useCategoryStore } from '@/store/categoryStore'
import {
  convertToCSV,
  generateCSVFilename,
  downloadCSV,
  parseCSV,
  convertToCategories
} from '@/utils/categoryExportImport'
import { categoryGroupApi, categoryItemApi } from '@/utils/categoryApi'

export function useCategoryExportImport() {
  const { categories, fetchCategories } = useCategoryStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const csvContent = convertToCSV(categories)
    const filename = generateCSVFilename()
    downloadCSV(csvContent, filename)
  }

  // Supabase DB에 동기화되는 import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const csvContent = e.target?.result as string
        const importData = parseCSV(csvContent)
        const newCategories = convertToCategories(importData)

        // 1. 기존 그룹 전체 삭제 (DB)
        for (const group of categories) {
          await categoryGroupApi.delete(group.id)
        }

        // 2. 새 그룹/아이템 DB에 insert
        for (const group of newCategories) {
          const createdGroup = await categoryGroupApi.create(group.name, '')
          for (const item of group.category_items) {
            await categoryItemApi.create(createdGroup.id, item.name, '', item.order ?? 0)
          }
        }

        // 3. store 동기화
        await fetchCategories()
      } catch (error) {
        alert(error instanceof Error ? error.message : '파일 가져오기에 실패했습니다.')
      }
    }
    reader.readAsText(file)
  }

  return {
    fileInputRef,
    handleExport,
    handleImport
  }
} 