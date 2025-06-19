import { create } from 'zustand'
import { supabase } from '@/utils/supabase'
// import { persist } from 'zustand/middleware' // 완전 제거

export interface CategoryItem {
  id: string
  name: string
  description?: string
  order: number
}

export interface CategoryGroup {
  id: string
  name: string
  description?: string
  category_items: CategoryItem[]
}

interface CategoryStore {
  categories: CategoryGroup[]
  expandedGroups: Set<string>
  
  // Accordion 제어 메서드
  toggleGroup: (groupId: string) => void
  expandGroup: (groupId: string) => void
  collapseGroup: (groupId: string) => void
  expandAll: () => void
  collapseAll: () => void
  
  // 카테고리 관리 메서드
  addCategory: (category: CategoryGroup) => void
  updateCategory: (id: string, category: Partial<CategoryGroup>) => void
  deleteCategory: (id: string) => void
  addItem: (groupId: string, item: CategoryItem) => void
  updateItem: (groupId: string, itemId: string, item: Partial<CategoryItem>) => void
  deleteItem: (groupId: string, itemId: string) => void
  setCategories: (categories: CategoryGroup[]) => void
  fetchCategories: () => Promise<void>
}

export const useCategoryStore = create<CategoryStore>()(
  (set, get) => ({
    categories: [],
    expandedGroups: new Set<string>(),

    // Accordion 제어 메서드
    toggleGroup: (groupId: string) => {
      const expandedGroups = new Set(get().expandedGroups)
      if (expandedGroups.has(groupId)) {
        expandedGroups.delete(groupId)
      } else {
        expandedGroups.add(groupId)
      }
      set({ expandedGroups })
    },

    expandGroup: (groupId: string) => {
      const expandedGroups = new Set(get().expandedGroups)
      expandedGroups.add(groupId)
      set({ expandedGroups })
    },

    collapseGroup: (groupId: string) => {
      const expandedGroups = new Set(get().expandedGroups)
      expandedGroups.delete(groupId)
      set({ expandedGroups })
    },

    expandAll: () => {
      const allGroupIds = get().categories.map(group => group.id)
      set({ expandedGroups: new Set(allGroupIds) })
    },

    collapseAll: () => {
      set({ expandedGroups: new Set() })
    },

    // 카테고리 관리 메서드
    addCategory: async (category: CategoryGroup) => {
      // Supabase DB에 직접 저장
      await supabase.from('category_groups').insert([{ name: category.name, description: category.description || '' }])
      await get().fetchCategories()
    },

    updateCategory: (id: string, category: Partial<CategoryGroup>) => {
      set(state => ({
        categories: state.categories.map(cat =>
          cat.id === id ? { ...cat, ...category } : cat
        )
      }))
    },

    deleteCategory: async (id: string) => {
      await supabase.from('category_groups').delete().eq('id', id)
      await get().fetchCategories()
    },

    addItem: async (groupId: string, item: CategoryItem) => {
      await supabase.from('category_items').insert({
        group_id: groupId,
        name: item.name,
        description: item.description || '',
        order_index: item.order ?? 0
      })
      await get().fetchCategories()
    },

    updateItem: (groupId: string, itemId: string, item: Partial<CategoryItem>) => {
      set(state => ({
        categories: state.categories.map(cat =>
          cat.id === groupId
            ? {
                ...cat,
                category_items: cat.category_items.map(i =>
                  i.id === itemId ? { ...i, ...item } : i
                )
              }
            : cat
        )
      }))
    },

    deleteItem: async (groupId: string, itemId: string) => {
      await supabase.from('category_items').delete().eq('id', itemId)
      await get().fetchCategories()
    },

    setCategories: (categories) => set({ categories }),

    fetchCategories: async () => {
      const { data, error } = await supabase
        .from('category_groups')
        .select('*, category_items(*)')
        .order('name')
      if (error) {
        alert(error.message)
        return
      }
      set({
        categories: (data as CategoryGroup[] || []).map((group) => ({
          ...group,
          category_items: (group.category_items as CategoryItem[] || []).sort((a, b) => a.order - b.order)
        }))
      })
    }
  })
) 