import { supabase } from './supabase'

export interface CategoryItem {
  id: string
  group_id: string
  name: string
  description?: string
  order: number
  created_at?: string
  updated_at?: string
}

export interface CategoryGroup {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
  category_items?: CategoryItem[]
}

export interface CategoryStructure extends CategoryGroup {
  category_items: CategoryItem[]
}

export const categoryGroupApi = {
  async getAll(): Promise<CategoryGroup[]> {
    const { data, error } = await supabase
      .from('category_groups')
      .select('*')
      .order('name')
    if (error) throw error
    return data || []
  },
  async create(name: string, description: string = ''): Promise<CategoryGroup> {
    const { data, error } = await supabase
      .from('category_groups')
      .insert([{ name, description }])
      .select()
    if (error) throw error
    return data[0]
  },
  async update(id: string, updates: Partial<CategoryGroup>): Promise<CategoryGroup> {
    const { data, error } = await supabase
      .from('category_groups')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('category_groups')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

export const categoryItemApi = {
  async getByGroupId(groupId: string): Promise<CategoryItem[]> {
    const { data, error } = await supabase
      .from('category_items')
      .select('*')
      .eq('group_id', groupId)
      .order('order')
    if (error) throw error
    return data || []
  },
  async create(groupId: string, name: string, description: string = '', orderIndex: number = 0): Promise<CategoryItem> {
    const { data, error } = await supabase
      .from('category_items')
      .insert([{ group_id: groupId, name, description, order_index: orderIndex }])
      .select()
    if (error) throw error
    return data[0]
  },
  async update(id: string, updates: Partial<CategoryItem>): Promise<CategoryItem> {
    const { data, error } = await supabase
      .from('category_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('category_items')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

export const getCategoryStructure = async (): Promise<CategoryStructure[]> => {
  const { data, error } = await supabase
    .from('category_groups')
    .select('*, category_items(*)')
    .order('name')
  if (error) throw error
  return (data || []).map(group => ({
    ...group,
    category_items: (group.category_items || []).sort((a: CategoryItem, b: CategoryItem) => a.order - b.order)
  }))
} 