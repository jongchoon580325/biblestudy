// 동기화 엔진: 네트워크 상태 감지 + 큐 polling + Supabase push
// (c) 2024 bible hybrid project
import { HybridStorageService } from './storage-utils';
import { supabase } from './supabaseClient';

let syncInterval: NodeJS.Timeout | null = null;
const SYNC_INTERVAL_MS = 10 * 1000; // 10초마다 polling

// 네트워크 상태 확인
function isOnline() {
  const online = typeof window !== 'undefined' && window.navigator.onLine;
  if (!online) {
    console.warn('[SYNC][SKIP] 네트워크 미연결 상태, 동기화 시도 중단');
  }
  return online;
}

// 동기화 큐 polling 시작
export function startSyncPolling() {
  if (syncInterval) return;
  syncInterval = setInterval(syncPendingMaterials, SYNC_INTERVAL_MS);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  if (isOnline()) syncPendingMaterials();
  console.log('[SYNC][TRIGGER] 자동 동기화 polling 시작');
}

// polling 중단
export function stopSyncPolling() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = null;
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  console.log('[SYNC][TRIGGER] 자동 동기화 polling 중단');
}

// 온라인 전환 시 즉시 동기화
function handleOnline() {
  syncPendingMaterials();
}
function handleOffline() {
  // 필요시 UI 상태 갱신 등
}

// 실제 동기화 실행 함수
export async function syncPendingMaterials() {
  if (!isOnline()) return;
  // 1. IndexedDB에서 sync_status가 'pending' 또는 'error'인 자료 조회
  const all = await HybridStorageService.getAllMaterials();
  const pendings = all.filter(m => m.sync_status === 'pending' || m.sync_status === 'error');
  for (const mat of pendings) {
    try {
      // 1. 파일이 있으면 Supabase Storage에 업로드
      let fileUrl = mat.file_url;
      if (mat.file_data && mat.file_name) {
        const filePath = `${mat.category_type}/${mat.local_id}_${mat.file_name}`;
        // 이미 업로드된 경우 skip
        if (!fileUrl) {
          const { error: uploadError } = await supabase.storage.from('materials').upload(filePath, new Blob([mat.file_data], { type: mat.file_type }), { upsert: true });
          if (uploadError && !(uploadError.message && uploadError.message.includes('Duplicate'))) throw uploadError;
          // 업로드 성공 또는 이미 존재(409) 시 publicUrl 획득
          const { data: urlData } = supabase.storage.from('materials').getPublicUrl(filePath);
          fileUrl = urlData.publicUrl;
        }
      }
      // 2. DB upsert (local_id 기준, onConflict)
      const { error } = await supabase.from('materials').upsert([
        {
          local_id: mat.local_id, // 고유값 반드시 포함
          title: mat.title,
          description: mat.description,
          category_type: mat.category_type,
          file_name: mat.file_name,
          file_size: mat.file_size,
          file_type: mat.file_type,
          file_url: fileUrl,
          tags: mat.tags,
          metadata: mat.metadata,
          created_at: mat.created_at,
          updated_at: new Date(),
          is_deleted: mat.is_deleted,
          bible_book: mat.bible_book,
        }
      ], { onConflict: 'local_id' });
      if (error) {
        if (error.message?.includes('JWT') || error.message?.includes('auth')) {
          console.error('[SYNC][FAIL][AUTH]', mat.local_id, error.message || error);
        } else if (error.message?.includes('permission') || error.message?.includes('denied')) {
          console.error('[SYNC][FAIL][PERMISSION]', mat.local_id, error.message || error);
        } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
          console.error('[SYNC][FAIL][NETWORK]', mat.local_id, error.message || error);
        } else {
          console.error('[SYNC][FAIL][API]', mat.local_id, error.message || error);
        }
        throw error;
      }
      console.log('[SYNC][SUCCESS]', mat.local_id, mat.title);
      // 3. 성공 시 sync_status 갱신
      mat.sync_status = 'synced';
      mat.last_sync = new Date();
      mat.storage_location = 'both';
      console.log('[SYNC][STATE][SUCCESS]', mat.local_id, {
        sync_status: mat.sync_status,
        storage_location: mat.storage_location
      });
      await HybridStorageService.addMaterial(mat);
      // 4. 큐에서 제거(또는 상태만 변경)
    } catch (err) {
      console.error('[SYNC][ERROR]', mat.local_id, err instanceof Error ? err.message : err);
      // 5. 실패 시 error 상태로
      mat.sync_status = 'error';
      console.log('[SYNC][STATE][FAIL]', mat.local_id, {
        sync_status: mat.sync_status,
        storage_location: mat.storage_location
      });
      await HybridStorageService.addMaterial(mat);
    }
  }
} 