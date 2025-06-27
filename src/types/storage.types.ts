// 하이브리드 저장소 타입 정의

export interface MaterialRecord {
  local_id: string; // IndexedDB PK (UUID)
  server_id?: string; // Supabase PK
  title: string;
  description?: string;
  category_type: 'bible' | 'general';
  bible_book?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_data?: ArrayBuffer; // 로컬 파일 데이터
  file_url?: string; // 서버 파일 URL
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  sync_status: 'synced' | 'pending' | 'syncing' | 'conflict' | 'error';
  sync_version: number;
  last_sync?: Date;
  is_deleted: boolean;
  storage_location: 'local' | 'server' | 'both';
}

export interface SyncQueueRecord {
  id: string; // UUID
  type: 'create' | 'update' | 'delete';
  entity_type: 'material' | 'category';
  local_id: string;
  data: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count: number;
  created_at: Date;
  error?: string;
}

export interface AppMetadata {
  last_sync: Date;
  sync_version: number;
  user_preferences: Record<string, unknown>;
} 