// IndexedDB/LocalStorage 유틸리티 (하이브리드 저장소)
import { MaterialRecord } from '../types/storage.types';

const DB_NAME = 'bibleHybridDB';
const DB_VERSION = 1;
const MATERIALS_STORE = 'materials';
const SYNC_QUEUE_STORE = 'sync_queue';
const APP_METADATA_STORE = 'app_metadata';

export class HybridStorageService {
  // IndexedDB 오픈 및 스키마 생성
  static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(MATERIALS_STORE)) {
          const store = db.createObjectStore(MATERIALS_STORE, { keyPath: 'local_id' });
          store.createIndex('by-category', 'category_type');
          store.createIndex('by-bible-book', 'bible_book');
          store.createIndex('by-sync-status', 'sync_status');
          store.createIndex('by-updated-at', 'updated_at');
        }
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const store = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
          store.createIndex('by-status', 'status');
          store.createIndex('by-retry-count', 'retry_count');
          store.createIndex('by-created-at', 'created_at');
        }
        if (!db.objectStoreNames.contains(APP_METADATA_STORE)) {
          db.createObjectStore(APP_METADATA_STORE, { keyPath: 'key' });
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