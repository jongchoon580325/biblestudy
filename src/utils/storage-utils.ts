// IndexedDB/LocalStorage 유틸리티 (하이브리드 저장소)
import { MaterialRecord, SyncQueueRecord } from '../types/storage.types';
import type { AdminRecord } from '../types/storage.types';

// Supabase 클라이언트 인스턴스 import (싱글턴)
import { supabase } from './supabaseClient';

const DB_NAME = 'bibleHybridDB';
const DB_VERSION = 2;
const MATERIALS_STORE = 'materials';
const SYNC_QUEUE_STORE = 'sync_queue';
const APP_METADATA_STORE = 'app_metadata';
const ADMIN_STORE = 'admin';

export class HybridStorageService {
  // IndexedDB 오픈 및 스키마 생성
  static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        // materials
        if (!db.objectStoreNames.contains(MATERIALS_STORE)) {
          const store = db.createObjectStore(MATERIALS_STORE, { keyPath: 'local_id' });
          store.createIndex('by-category', 'category_type');
          store.createIndex('by-bible-book', 'bible_book');
          store.createIndex('by-sync-status', 'sync_status');
          store.createIndex('by-updated-at', 'updated_at');
        }
        // sync_queue
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const store = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
          store.createIndex('by-status', 'status');
          store.createIndex('by-retry-count', 'retry_count');
          store.createIndex('by-created-at', 'created_at');
        }
        // app_metadata
        if (!db.objectStoreNames.contains(APP_METADATA_STORE)) {
          db.createObjectStore(APP_METADATA_STORE, { keyPath: 'key' });
        }
        // category (카테고리 오브젝트스토어 및 인덱스 추가)
        if (!db.objectStoreNames.contains('category')) {
          const store = db.createObjectStore('category', { keyPath: 'id' });
          store.createIndex('by-type', 'type');
          store.createIndex('by-parent', 'parentId');
          store.createIndex('by-order', 'order');
        }
        // admin (관리자 계정 오브젝트스토어)
        if (!db.objectStoreNames.contains(ADMIN_STORE)) {
          db.createObjectStore(ADMIN_STORE, { keyPath: 'email' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // 자료 추가 (Create)
  static async addMaterial(material: MaterialRecord): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MATERIALS_STORE, 'readwrite');
      tx.objectStore(MATERIALS_STORE).put(material);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // 자료 전체 조회 (Read)
  static async getAllMaterials(): Promise<MaterialRecord[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIALS_STORE, 'readonly');
      const req = tx.objectStore(MATERIALS_STORE).getAll();
      req.onsuccess = () => resolve(req.result as MaterialRecord[]);
      req.onerror = () => reject(req.error);
    });
  }

  // 자료 삭제 (Delete)
  static async deleteMaterial(local_id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MATERIALS_STORE, 'readwrite');
      tx.objectStore(MATERIALS_STORE).delete(local_id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // 특정 성경책 자료만 조회 (by-bible-book 인덱스 활용)
  static async getMaterialsByBibleBook(bookName: string): Promise<MaterialRecord[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIALS_STORE, 'readonly');
      const idx = tx.objectStore(MATERIALS_STORE).index('by-bible-book');
      const req = idx.getAll(bookName);
      req.onsuccess = () => resolve(req.result as MaterialRecord[]);
      req.onerror = () => reject(req.error);
    });
  }

  // 동기화 큐에서 pending/processing 상태 작업 조회
  static async getPendingSyncQueueItems(): Promise<SyncQueueRecord[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readonly');
      const store = tx.objectStore('sync_queue');
      const idx = store.index('by-status');
      const pendingReq = idx.getAll('pending');
      const processingReq = idx.getAll('processing');
      const result: SyncQueueRecord[] = [];
      pendingReq.onsuccess = () => {
        result.push(...pendingReq.result);
        processingReq.onsuccess = () => {
          result.push(...processingReq.result);
          resolve(result);
        };
        processingReq.onerror = () => reject(processingReq.error);
      };
      pendingReq.onerror = () => reject(pendingReq.error);
    });
  }

  // IndexedDB 전체 자료 삭제 (materials)
  static async clearAllMaterials(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIALS_STORE, 'readwrite');
      tx.objectStore(MATERIALS_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // 동기화 큐 전체 삭제
  static async clearAllSyncQueue(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
      tx.objectStore(SYNC_QUEUE_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // 앱 메타데이터 전체 삭제
  static async clearAllAppMetadata(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(APP_METADATA_STORE, 'readwrite');
      tx.objectStore(APP_METADATA_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // 관리자 추가
  static async addAdmin(admin: AdminRecord): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ADMIN_STORE, 'readwrite');
      tx.objectStore(ADMIN_STORE).put(admin);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // 관리자 전체 조회
  static async getAllAdmins(): Promise<AdminRecord[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ADMIN_STORE, 'readonly');
      const req = tx.objectStore(ADMIN_STORE).getAll();
      req.onsuccess = () => resolve(req.result as AdminRecord[]);
      req.onerror = () => reject(req.error);
    });
  }

  // 관리자 수정
  static async updateAdmin(email: string, updates: Partial<AdminRecord>): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ADMIN_STORE, 'readwrite');
      const store = tx.objectStore(ADMIN_STORE);
      const getReq = store.get(email);
      getReq.onsuccess = () => {
        const old = getReq.result;
        if (!old) return resolve();
        const updated = { ...old, ...updates };
        store.put(updated);
      };
      getReq.onerror = () => reject(getReq.error);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // 관리자 삭제
  static async deleteAdmin(email: string): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ADMIN_STORE, 'readwrite');
      tx.objectStore(ADMIN_STORE).delete(email);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // 전체 관리자 삭제
  static async clearAllAdmins(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ADMIN_STORE, 'readwrite');
      tx.objectStore(ADMIN_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

// LocalStorage 유틸
export const localStorageUtil = {
  get<T>(key: string): T | null {
    const v = localStorage.getItem(key);
    if (!v) return null;
    try { return JSON.parse(v) as T; } catch { return null; }
  },
  set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    localStorage.removeItem(key);
  }
};

// 카테고리 API
export const CategoryAPI = {
  async getAll() {
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },
  async create(category: import('../types/storage.types').Category) {
    const { data, error } = await supabase.from('categories').insert([category]).select();
    if (error) throw error;
    return data?.[0];
  },
  async update(id: string, patch: Partial<import('../types/storage.types').Category>) {
    const { data, error } = await supabase.from('categories').update(patch).eq('id', id).select();
    if (error) throw error;
    return data?.[0];
  },
  async remove(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

// 동기화 로그 API
export const SyncLogAPI = {
  async getByMaterialId(material_id: string) {
    const { data, error } = await supabase.from('sync_logs').select('*').eq('material_id', material_id).order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },
  async create(log: import('../types/storage.types').SyncLog) {
    const { data, error } = await supabase.from('sync_logs').insert([log]).select();
    if (error) throw error;
    return data?.[0];
  }
};

// Supabase Storage 업로드 유틸
export async function uploadToStorage(filePath: string, fileData: ArrayBuffer, fileType: string): Promise<string | null> {
  // 파일 업로드(중복시 upsert)
  const { error: uploadError } = await supabase.storage.from('materials').upload(filePath, new Blob([fileData], { type: fileType }), { upsert: true });
  if (uploadError && !(uploadError.message && uploadError.message.includes('Duplicate'))) throw uploadError;
  // 업로드 성공 또는 이미 존재(409) 시 publicUrl 반환
  const { data: urlData } = supabase.storage.from('materials').getPublicUrl(filePath);
  return urlData.publicUrl || null;
} 