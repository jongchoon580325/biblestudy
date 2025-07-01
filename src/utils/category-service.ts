// Bible Category 관리 서비스 (IndexedDB 기반)
import { Category } from '../types/category.types';
import { supabase, HybridStorageService } from './storage-utils';

const CATEGORY_STORE = 'category';

export const CategoryService = {
  // 전체 카테고리 조회
  async getAll(): Promise<Category[]> {
    const db = await HybridStorageService.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CATEGORY_STORE, 'readonly');
      const req = tx.objectStore(CATEGORY_STORE).getAll();
      req.onsuccess = () => resolve(req.result as Category[]);
      req.onerror = () => reject(req.error);
    });
  },
  // 카테고리 추가
  async add(category: Category): Promise<void> {
    const db = await HybridStorageService.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CATEGORY_STORE, 'readwrite');
      tx.objectStore(CATEGORY_STORE).put(category);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  // 카테고리 수정
  async update(id: string, updates: Partial<Category>): Promise<void> {
    const db = await HybridStorageService.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CATEGORY_STORE, 'readwrite');
      const store = tx.objectStore(CATEGORY_STORE);
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const old = getReq.result as Category;
        if (!old) return resolve();
        const updated = { ...old, ...updates, updated_at: new Date().toISOString() };
        store.put(updated);
      };
      getReq.onerror = () => reject(getReq.error);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  // 카테고리 삭제
  async delete(id: string): Promise<void> {
    const db = await HybridStorageService.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CATEGORY_STORE, 'readwrite');
      tx.objectStore(CATEGORY_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  // 전체 카테고리 초기화
  async clear(): Promise<void> {
    const db = await HybridStorageService.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CATEGORY_STORE, 'readwrite');
      tx.objectStore(CATEGORY_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  // 동기화 트리거 (pending/error 상태만 Supabase로 push)
  async syncPendingCategories(): Promise<void> {
    const db = await HybridStorageService.openDB();
    // 1. IndexedDB에서 pending/error 카테고리 조회
    const pendings: Category[] = await new Promise((resolve, reject) => {
      const tx = db.transaction(CATEGORY_STORE, 'readonly');
      const req = tx.objectStore(CATEGORY_STORE).getAll();
      req.onsuccess = () => {
        const all = req.result as Category[];
        resolve(all.filter(cat => cat.sync_status === 'pending' || cat.sync_status === 'error'));
      };
      req.onerror = () => reject(req.error);
    });
    // 2. Supabase upsert 및 상태 갱신
    for (const cat of pendings) {
      try {
        const { error } = await supabase.from('categories').upsert([
          {
            id: cat.id,
            name: cat.name,
            type: cat.type,
            parentId: cat.parentId,
            order: cat.order,
            created_at: cat.created_at,
            updated_at: new Date().toISOString(),
            sync_status: 'synced',
          }
        ], { onConflict: 'id' });
        if (error) throw error;
        // 성공 시 sync_status 갱신
        await CategoryService.update(cat.id, { sync_status: 'synced', updated_at: new Date().toISOString() });
      } catch {
        // 실패 시 error 상태로
        await CategoryService.update(cat.id, { sync_status: 'error', updated_at: new Date().toISOString() });
      }
    }
  },
}; 