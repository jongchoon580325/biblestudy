// Bible Category 타입 정의 (PRD 기반)
export type CategoryType = 'group' | 'item';

export interface Category {
  id: string; // 고유값 (UUID)
  name: string;
  type: CategoryType; // 그룹/하위카테고리 구분
  parentId?: string;  // 하위카테고리는 그룹 id 참조
  order: number;      // 그룹/하위 내 정렬 순서
  created_at: string; // ISO 날짜
  updated_at: string; // ISO 날짜
  sync_status?: 'synced' | 'pending' | 'error'; // 동기화 상태(옵션)
} 