### 6.3 카테고리 관리 메인 컴포넌트 (Accordion UI)
`components/CategoryManager.tsx` 파일 생성:
```typescript
import React, { useState, useEffect } from 'react'
import { useCategoryStore } from '../store/categoryStore'
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Folder, 
  FolderOpen, 
  FileText, 
  Edit, 
  Trash2, 
  RotateCcw,
  Loader2 
} from 'lucide-react'
import CategoryModal from './CategoryModal'
import ConfirmModal from './ConfirmModal'

const CategoryManager: React.FC = () => {
  const {
    categories,
    loading,
    expandedGroups,
    fetchCategories,
    addGroup,
    updateGroup,
    deleteGroup,
    addItem,
    updateItem,
    deleteItem,
    toggleGroup,
    clearCategories
  } = useCategoryStore()

  // 모달 상태
  const [categoryModal, setCategoryModal] = useState<{
    isOpen: boolean
    type: 'group' | 'item'
    mode: 'create' | 'edit'
    groupId?: string
    groupName?: string
    itemId?: string
    initialData?: { name: string; description?: string }
  }>({
    isOpen: false,
    type: 'group',
    mode: 'create'
  })

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type: 'delete' | 'clear'
  } | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // 그룹 추가
  const handleAddGroup = () => {
    setCategoryModal({
      isOpen: true,
      type: 'group',
      mode: 'create'
    })
  }

  // 아이템 추가
  const handleAddItem = (groupId: string, groupName: string) => {
    setCategoryModal({
      isOpen: true,
      type: 'item',
      mode: 'create',
      groupId,
      groupName
    })
  }

  // 그룹 수정
  const handleEditGroup = (group: any) => {
    setCategoryModal({
      isOpen: true,
      type: 'group',
      mode: 'edit',
      groupId: group.id,
      initialData: { name: group.name, description: group.description }
    })
  }

  // 아이템 수정
  const handleEditItem = (item: any, groupName: string) => {
    setCategoryModal({
      isOpen: true,
      type: 'item',
      mode: 'edit',
      groupId: item.group_id,
      groupName,
      itemId: item.id,
      initialData: { name: item.name, description: item.description }
    })
  }

  // 모달 제출 처리
  const handleModalSubmit = async (name: string, description?: string) => {
    const { type, mode, groupId, itemId } = categoryModal

    if (mode === 'create') {
      if (type === 'group') {
        await addGroup(name, description)
      } else if (type === 'item' && groupId) {
        await addItem(groupId, name, description)
      }
    } else if (mode === 'edit') {
      if (type === 'group' && groupId) {
        await updateGroup(groupId, { name, description })
      } else if (type === 'item' && itemId) {
        await updateItem(itemId, { name, description })
      }
    }
  }

  // 삭제 확인
  const handleDeleteGroup = (group: any) => {
    setConfirmModal({
      isOpen: true,
      title: '🗑️ 그룹 삭제',
      message: `"${group.name}" 그룹과 모든 하위 아이템이 영구적으로 삭제됩니다.\n\n정말 삭제하시겠습니까?`,
      onConfirm: async () => {
        await deleteGroup(group.id)
        setConfirmModal(null)
      },
      type: 'delete'
    })
  }

  const handleDeleteItem = (item: any) => {
    setConfirmModal({
      isOpen: true,
      title: '🗑️ 아이템 삭제',
      message: `"${item.name}" 아이템을 영구적으로 삭제합니다.\n\n정말 삭제하시겠습니까?`,
      onConfirm: async () => {
        await deleteItem(item.id)
        setConfirmModal(null)
      },
      type: 'delete'
    })
  }

  // 전체 초기화 확인
  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: '🔄 카테고리 초기화',
      message: '모든 카테고리가 영구적으로 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다. 정말 진행하시겠습니까?',
      onConfirm: async () => {
        await clearCategories()
        setConfirmModal(null)
      },
      type: 'clear'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>카테고리 로딩 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">📁 카테고리 관리</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleAddGroup}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>그룹 추가</span>
            </button>
            {categories.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>초기화</span>
              </button>
            )}
          </div>
        </div>

        {/* 카테고리 목록 */}
        <div className="space-y-4">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Folder className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">카테고리가 없습니다.</p>
              <p className="text-sm">첫 번째 그룹을 추가해보세요.</p>
            </div>
          ) : (
            categories.map((group) => {
              const isExpanded = expandedGroups.has(group.id)
              return (
                <div key={group.id} className="bg-gray-800 rounded-lg border border-gray-700">
                  {/* 그룹 헤더 */}
                  <div className="flex items-center justify-between p-4">
                    <div 
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <button className="text-gray-400 hover:text-white transition-colors">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                      
                      {isExpanded ? (
                        <FolderOpen className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Folder className="h-5 w-5 text-blue-400" />
                      )}
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-gray-400">{group.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          아이템 {group.category_items.length}개
                        </p>
                      </div>
                    </div>

                    {/* 그룹 액션 버튼 */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddItem(group.id, group.name)}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded transition-colors"
                        title="아이템 추가"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 rounded transition-colors"
                        title="그룹 수정"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                        title="그룹 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* 아이템 목록 (Accordion) */}
                  {isExpanded && (
                    <div className="border-t border-gray-700 bg-gray-850">
                      {group.category_items.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>아이템이 없습니다.</p>
                          <button
                            onClick={() => handleAddItem(group.id, group.name)}
                            className="mt-2 text-green-400 hover:text-green-300 text-sm"
                          >
                            첫 번째 아이템 추가하기
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-700">
                          {group.category_items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 ml-8">
                              <div className="flex items-center space-x-3 flex-1">
                                <FileText className="h-4 w-4 text-green-400" />
                                <div>
                                  <h4 className="font-medium text-white">{item.name}</h4>
                                # Next.js + Supabase 2단계 카테고리 시스템 구축 가이드 (다크모드 + Accordion UI)

## 1. 프로젝트 설정 및 설치

### 1.1 Next.js 프로젝트 생성
```bash
npx create-next-app@latest my-category-app --typescript --tailwind --app
cd my-category-app
```

### 1.2 필요한 패키지 설치
```bash
npm install @supabase/supabase-js zustand nanoid lucide-react
npm install -D typescript @types/react @types/node
```

### 1.3 환경변수 설정
`.env.local` 파일을 프로젝트 루트에 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Supabase 데이터베이스 테이블 설계

### 2.1 테이블 구조 설계

#### 2.1.1 category_groups 테이블 (그룹 카테고리)
이 테이블은 최상위 카테고리 그룹을 저장합니다 (예: 구약, 신약).

| 컬럼명 | 데이터 타입 | 제약조건 | 기본값 | 설명 |
|--------|-------------|----------|--------|------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | 고유 식별자 |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE | - | 그룹 이름 (예: "구약") |
| `description` | TEXT | NULL 허용 | NULL | 그룹 설명 (선택사항) |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | 생성 일시 |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | 수정 일시 |

**제약조건:**
- `UNIQUE(name)`: 그룹 이름 중복 방지
- `PRIMARY KEY(id)`: 기본키 설정

#### 2.1.2 category_items 테이블 (아이템 카테고리)
이 테이블은 각 그룹에 속하는 하위 카테고리 아이템을 저장합니다 (예: 창세기, 출애굽기).

| 컬럼명 | 데이터 타입 | 제약조건 | 기본값 | 설명 |
|--------|-------------|----------|--------|------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | 고유 식별자 |
| `group_id` | UUID | FOREIGN KEY, NOT NULL | - | 그룹 테이블 참조 |
| `name` | VARCHAR(255) | NOT NULL | - | 아이템 이름 (예: "창세기") |
| `description` | TEXT | NULL 허용 | NULL | 아이템 설명 (선택사항) |
| `order_index` | INTEGER | NOT NULL | 0 | 정렬 순서 |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | 생성 일시 |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | 수정 일시 |

**제약조건:**
- `PRIMARY KEY(id)`: 기본키 설정
- `FOREIGN KEY(group_id) REFERENCES category_groups(id) ON DELETE CASCADE`: 외래키, 그룹 삭제 시 관련 아이템 자동 삭제
- `UNIQUE(group_id, name)`: 같은 그룹 내에서 아이템 이름 중복 방지

**관계:**
- `category_groups` : `category_items` = 1 : N (일대다 관계)

### 2.2 SQL 테이블 생성 스크립트
Supabase Dashboard의 SQL Editor에서 다음 쿼리를 순서대로 실행:

#### 2.2.1 기본 테이블 생성
```sql
-- 1. 그룹 카테고리 테이블 생성
CREATE TABLE IF NOT EXISTS category_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- 제약조건
  CONSTRAINT uq_category_groups_name UNIQUE (name),
  CONSTRAINT ck_category_groups_name_length CHECK (LENGTH(TRIM(name)) > 0)
);

-- 2. 아이템 카테고리 테이블 생성
CREATE TABLE IF NOT EXISTS category_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- 외래키 제약조건
  CONSTRAINT fk_category_items_group_id 
    FOREIGN KEY (group_id) 
    REFERENCES category_groups(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  -- 유니크 제약조건
  CONSTRAINT uq_category_items_group_name UNIQUE (group_id, name),
  
  -- 체크 제약조건
  CONSTRAINT ck_category_items_name_length CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT ck_category_items_order_index CHECK (order_index >= 0)
);
```

#### 2.2.2 인덱스 생성 (성능 최적화)
```sql
-- 성능 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_category_groups_name 
  ON category_groups(name);

CREATE INDEX IF NOT EXISTS idx_category_groups_created_at 
  ON category_groups(created_at);

CREATE INDEX IF NOT EXISTS idx_category_items_group_id 
  ON category_items(group_id);

CREATE INDEX IF NOT EXISTS idx_category_items_group_order 
  ON category_items(group_id, order_index);

CREATE INDEX IF NOT EXISTS idx_category_items_name 
  ON category_items(name);

CREATE INDEX IF NOT EXISTS idx_category_items_created_at 
  ON category_items(created_at);
```

#### 2.2.3 트리거 생성 (자동 updated_at 업데이트)
```sql
-- updated_at 자동 업데이트를 위한 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- category_groups 테이블용 트리거
CREATE TRIGGER update_category_groups_updated_at 
  BEFORE UPDATE ON category_groups 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- category_items 테이블용 트리거
CREATE TRIGGER update_category_items_updated_at 
  BEFORE UPDATE ON category_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 샘플 데이터 삽입
```sql
-- 샘플 그룹 데이터 삽입
INSERT INTO category_groups (name, description) VALUES 
('구약', '구약성경 책들'),
('신약', '신약성경 책들')
ON CONFLICT (name) DO NOTHING;

-- 샘플 아이템 데이터 삽입
WITH groups AS (
  SELECT id, name FROM category_groups WHERE name IN ('구약', '신약')
)
INSERT INTO category_items (group_id, name, description, order_index)
SELECT 
  g.id,
  items.name,
  items.description,
  items.order_index
FROM groups g
CROSS JOIN (
  VALUES 
    ('창세기', '천지창조와 족장들의 이야기', 1),
    ('출애굽기', '이집트 탈출과 십계명', 2),
    ('레위기', '제사법과 성결법', 3),
    ('민수기', '광야 40년의 여정', 4),
    ('신명기', '모세의 고별설교', 5)
) AS items(name, description, order_index)
WHERE g.name = '구약'

UNION ALL

SELECT 
  g.id,
  items.name,
  items.description,
  items.order_index
FROM groups g
CROSS JOIN (
  VALUES 
    ('마태복음', '예수의 생애와 가르침', 1),
    ('마가복음', '예수의 행적 중심', 2),
    ('누가복음', '의사 누가의 기록', 3),
    ('요한복음', '예수의 신성 강조', 4)
) AS items(name, description, order_index)
WHERE g.name = '신약'
ON CONFLICT (group_id, name) DO NOTHING;
```

### 2.4 데이터 검증 쿼리
```sql
-- 테이블 구조 확인
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('category_groups', 'category_items')
ORDER BY table_name, ordinal_position;

-- 제약조건 확인
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('category_groups', 'category_items')
ORDER BY tc.table_name, tc.constraint_type;

-- 인덱스 확인
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('category_groups', 'category_items')
ORDER BY tablename, indexname;

-- 데이터 확인
SELECT 
  cg.name AS group_name,
  COUNT(ci.id) AS item_count
FROM category_groups cg
LEFT JOIN category_items ci ON cg.id = ci.group_id
GROUP BY cg.id, cg.name
ORDER BY cg.name;
```

### 2.5 RLS (Row Level Security) 설정
```sql
-- 1. RLS 활성화
ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_items ENABLE ROW LEVEL SECURITY;

-- 2. 읽기 권한 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "Allow public read access on category_groups" 
  ON category_groups FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access on category_items" 
  ON category_items FOR SELECT 
  USING (true);

-- 3. 쓰기 권한 정책 (개발 단계에서는 모든 사용자에게 허용)
-- 프로덕션에서는 더 엄격한 정책으로 변경 필요

-- category_groups 테이블 쓰기 권한
CREATE POLICY "Allow public insert on category_groups" 
  ON category_groups FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update on category_groups" 
  ON category_groups FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow public delete on category_groups" 
  ON category_groups FOR DELETE 
  USING (true);

-- category_items 테이블 쓰기 권한
CREATE POLICY "Allow public insert on category_items" 
  ON category_items FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update on category_items" 
  ON category_items FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow public delete on category_items" 
  ON category_items FOR DELETE 
  USING (true);
```

### 2.6 실시간(Realtime) 기능 활성화
Supabase Dashboard에서 실시간 기능을 활성화하려면:

1. **Database > Replication** 메뉴로 이동
2. 다음 테이블들을 Realtime에 추가:
   - `category_groups`
   - `category_items`

또는 SQL로 실행:
```sql
-- Realtime 기능 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE category_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE category_items;
```

### 2.7 테이블 관계도

```
┌─────────────────────────────────┐
│        category_groups          │
├─────────────────────────────────┤
│ id (UUID, PK)                   │
│ name (VARCHAR, UNIQUE, NOT NULL)│
│ description (TEXT, NULL)        │
│ created_at (TIMESTAMPTZ)        │
│ updated_at (TIMESTAMPTZ)        │
└─────────────────┬───────────────┘
                  │ 1:N
                  │
┌─────────────────▼───────────────┐
│        category_items           │
├─────────────────────────────────┤
│ id (UUID, PK)                   │
│ group_id (UUID, FK, NOT NULL)   │
│ name (VARCHAR, NOT NULL)        │
│ description (TEXT, NULL)        │
│ order_index (INTEGER)           │
│ created_at (TIMESTAMPTZ)        │
│ updated_at (TIMESTAMPTZ)        │
│                                 │
│ UNIQUE(group_id, name)          │
└─────────────────────────────────┘
```

### 2.8 데이터 타입 상세 설명

#### UUID (Universally Unique Identifier)
- **장점**: 전역적으로 고유, 분산 시스템에서 안전
- **단점**: 저장 공간이 INTEGER보다 큼 (16바이트)
- **사용 이유**: Supabase 권장사항, 보안성 향상

#### TIMESTAMPTZ (Timestamp with Time Zone)
- **장점**: 시간대 정보 포함, 글로벌 서비스에 적합
- **형식**: `2024-01-15 14:30:00+09:00`
- **자동 변환**: 사용자 시간대에 맞게 자동 표시

#### VARCHAR(255) vs TEXT
- **VARCHAR(255)**: 제한된 길이, 인덱싱 효율적
- **TEXT**: 무제한 길이, 긴 텍스트에 적합
- **선택 기준**: name은 VARCHAR, description은 TEXT

### 2.9 백업 및 복원 스크립트

#### 데이터 백업
```sql
-- 전체 데이터를 JSON 형태로 백업
COPY (
  SELECT json_build_object(
    'groups', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'name', name,
          'description', description,
          'created_at', created_at,
          'items', (
            SELECT json_agg(
              json_build_object(
                'id', ci.id,
                'name', ci.name,
                'description', ci.description,
                'order_index', ci.order_index,
                'created_at', ci.created_at
              )
            )
            FROM category_items ci 
            WHERE ci.group_id = cg.id
            ORDER BY ci.order_index
          )
        )
      )
      FROM category_groups cg
      ORDER BY cg.name
    )
  )
) TO '/tmp/category_backup.json';
```

#### 테이블 초기화 (주의: 모든 데이터 삭제)
```sql
-- 주의: 이 명령은 모든 데이터를 삭제합니다!
TRUNCATE category_items, category_groups RESTART IDENTITY CASCADE;
```

## 3. TypeScript 타입 정의

### 3.1 타입 정의 파일 생성
`types/category.ts` 파일 생성:
```typescript
export interface Category {
  id: string
  name: string
  type: 'group' | 'item'  // 그룹/하위카테고리 구분
  parentId?: string       // 하위카테고리는 그룹 id 참조
  order: number          // 그룹/하위 내 정렬 순서
  created_at: string
  updated_at: string
}

export interface CategoryGroup {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  category_items?: CategoryItem[]
}

export interface CategoryItem {
  id: string
  group_id: string
  name: string
  description?: string
  order_index: number
  created_at: string
  updated_at: string
  category_groups?: CategoryGroup
}

export interface CategoryStructure extends CategoryGroup {
  category_items: CategoryItem[]
}
```

## 4. Supabase 클라이언트 설정

### 4.1 Supabase 클라이언트 생성
`lib/supabase.ts` 파일 생성:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 5. Zustand 상태관리 설정

### 5.1 카테고리 스토어 생성
`store/categoryStore.ts` 파일 생성:
```typescript
import { create } from 'zustand'
import { categoryGroupApi, categoryItemApi, getCategoryStructure } from '../lib/categoryApi'
import { CategoryStructure, CategoryGroup, CategoryItem } from '../types/category'
import { nanoid } from 'nanoid'

interface CategoryStore {
  categories: CategoryStructure[]
  loading: boolean
  expandedGroups: Set<string>
  
  // 데이터 로드
  fetchCategories: () => Promise<void>
  
  // 그룹 관리
  addGroup: (name: string, description?: string) => Promise<void>
  updateGroup: (id: string, updates: Partial<CategoryGroup>) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  
  // 아이템 관리
  addItem: (groupId: string, name: string, description?: string) => Promise<void>
  updateItem: (id: string, updates: Partial<CategoryItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  
  // UI 상태 관리
  toggleGroup: (groupId: string) => void
  expandGroup: (groupId: string) => void
  collapseGroup: (groupId: string) => void
  clearCategories: () => Promise<void>
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  loading: false,
  expandedGroups: new Set<string>(),

  fetchCategories: async () => {
    try {
      set({ loading: true })
      const data = await getCategoryStructure()
      set({ categories: data, loading: false })
    } catch (error) {
      console.error('카테고리 로드 실패:', error)
      set({ loading: false })
    }
  },

  addGroup: async (name: string, description?: string) => {
    try {
      await categoryGroupApi.create(name, description || '')
      await get().fetchCategories()
    } catch (error) {
      console.error('그룹 추가 실패:', error)
      throw error
    }
  },

  updateGroup: async (id: string, updates: Partial<CategoryGroup>) => {
    try {
      await categoryGroupApi.update(id, updates)
      await get().fetchCategories()
    } catch (error) {
      console.error('그룹 수정 실패:', error)
      throw error
    }
  },

  deleteGroup: async (id: string) => {
    try {
      await categoryGroupApi.delete(id)
      // 삭제된 그룹을 확장 목록에서도 제거
      const expandedGroups = new Set(get().expandedGroups)
      expandedGroups.delete(id)
      set({ expandedGroups })
      await get().fetchCategories()
    } catch (error) {
      console.error('그룹 삭제 실패:', error)
      throw error
    }
  },

  addItem: async (groupId: string, name: string, description?: string) => {
    try {
      const categories = get().categories
      const group = categories.find(g => g.id === groupId)
      const maxOrder = group?.category_items.length || 0
      
      await categoryItemApi.create(groupId, name, description || '', maxOrder + 1)
      await get().fetchCategories()
      
      // 아이템 추가 후 해당 그룹 자동 확장
      get().expandGroup(groupId)
    } catch (error) {
      console.error('아이템 추가 실패:', error)
      throw error
    }
  },

  updateItem: async (id: string, updates: Partial<CategoryItem>) => {
    try {
      await categoryItemApi.update(id, updates)
      await get().fetchCategories()
    } catch (error) {
      console.error('아이템 수정 실패:', error)
      throw error
    }
  },

  deleteItem: async (id: string) => {
    try {
      await categoryItemApi.delete(id)
      await get().fetchCategories()
    } catch (error) {
      console.error('아이템 삭제 실패:', error)
      throw error
    }
  },

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

  clearCategories: async () => {
    try {
      // 모든 그룹 삭제 (CASCADE로 아이템도 함께 삭제됨)
      const categories = get().categories
      await Promise.all(categories.map(group => categoryGroupApi.delete(group.id)))
      set({ expandedGroups: new Set() })
      await get().fetchCategories()
    } catch (error) {
      console.error('카테고리 초기화 실패:', error)
      throw error
    }
  }
}))
```

## 6. React 컴포넌트 구현 (다크모드 + Accordion UI)

### 6.1 카테고리 모달 컴포넌트
`components/CategoryModal.tsx` 파일 생성:
```typescript
import React, { useState, useEffect } from 'react'
import { X, Folder, FileText } from 'lucide-react'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, description?: string) => Promise<void>
  type: 'group' | 'item'
  parentGroupName?: string
  initialData?: { name: string; description?: string }
  title?: string
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  parentGroupName,
  initialData,
  title
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '')
      setDescription(initialData?.description || '')
    }
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setLoading(true)
      await onSubmit(name.trim(), description.trim() || undefined)
      setName('')
      setDescription('')
      onClose()
    } catch (error) {
      console.error('저장 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {type === 'group' ? (
              <Folder className="h-5 w-5 text-blue-400" />
            ) : (
              <FileText className="h-5 w-5 text-green-400" />
            )}
            <h2 className="text-xl font-semibold text-white">
              {title || (type === 'group' ? '그룹 카테고리' : '아이템 카테고리')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {type === 'item' && parentGroupName && (
          <div className="mb-4 text-sm text-gray-400">
            그룹: <span className="text-blue-400">{parentGroupName}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              카테고리명
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'group' ? '예: 구약' : '예: 창세기'}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              설명 (선택사항)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="카테고리에 대한 설명을 입력하세요"
              rows={3}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '저장 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryModal
```

### 6.2 확인 모달 컴포넌트
`components/ConfirmModal.tsx` 파일 생성:
```typescript
import React from 'react'
import { AlertTriangle, Trash2, RotateCcw } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'delete' | 'clear' | 'warning'
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="h-8 w-8 text-red-400" />
      case 'clear':
        return <RotateCcw className="h-8 w-8 text-orange-400" />
      default:
        return <AlertTriangle className="h-8 w-8 text-yellow-400" />
    }
  }

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700'
      case 'clear':
        return 'bg-orange-600 hover:bg-orange-700'
      default:
        return 'bg-yellow-600 hover:bg-yellow-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700 animate-in fade-in duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="animate-bounce">
            {getIcon()}
          </div>
          
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
          
          <p className="text-gray-300 text-sm leading-relaxed">
            {message}
          </p>
          
          <div className="flex justify-center space-x-3 pt-4 w-full">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2 text-white rounded-lg transition-colors ${getConfirmButtonColor()}`}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
```
`lib/categoryApi.ts` 파일 생성:
```typescript
import { supabase } from './supabase'
import { CategoryGroup, CategoryItem, CategoryStructure } from '../types/category'

// 그룹 카테고리 관련 함수
export const categoryGroupApi = {
  // 모든 그룹 조회
  async getAll(): Promise<CategoryGroup[]> {
    const { data, error } = await supabase
      .from('category_groups')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // 그룹 생성
  async create(name: string, description: string = ''): Promise<CategoryGroup> {
    const { data, error } = await supabase
      .from('category_groups')
      .insert([{ name, description }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // 그룹 수정
  async update(id: string, updates: Partial<CategoryGroup>): Promise<CategoryGroup> {
    const { data, error } = await supabase
      .from('category_groups')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // 그룹 삭제
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('category_groups')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// 아이템 카테고리 관련 함수
export const categoryItemApi = {
  // 특정 그룹의 아이템들 조회
  async getByGroupId(groupId: string): Promise<CategoryItem[]> {
    const { data, error } = await supabase
      .from('category_items')
      .select(`
        *,
        category_groups (
          id,
          name
        )
      `)
      .eq('group_id', groupId)
      .order('order_index')
    
    if (error) throw error
    return data || []
  },

  // 모든 아이템 조회 (그룹 정보 포함)
  async getAll(): Promise<CategoryItem[]> {
    const { data, error } = await supabase
      .from('category_items')
      .select(`
        *,
        category_groups (
          id,
          name
        )
      `)
      .order('order_index')
    
    if (error) throw error
    return data || []
  },

  // 아이템 생성
  async create(
    groupId: string, 
    name: string, 
    description: string = '', 
    orderIndex: number = 0
  ): Promise<CategoryItem> {
    const { data, error } = await supabase
      .from('category_items')
      .insert([{ 
        group_id: groupId, 
        name, 
        description, 
        order_index: orderIndex 
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // 아이템 수정
  async update(id: string, updates: Partial<CategoryItem>): Promise<CategoryItem> {
    const { data, error } = await supabase
      .from('category_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // 아이템 삭제
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('category_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// 전체 카테고리 구조 조회 (그룹과 아이템을 함께)
export const getCategoryStructure = async (): Promise<CategoryStructure[]> => {
  const { data, error } = await supabase
    .from('category_groups')
    .select(`
      *,
      category_items (
        id,
        name,
        description,
        order_index
      )
    `)
    .order('name')
  
  if (error) throw error
  
  // 각 그룹의 아이템들을 order_index로 정렬
  return (data || []).map(group => ({
    ...group,
    category_items: (group.category_items || []).sort((a, b) => a.order_index - b.order_index)
  }))
}
```

## 6. React 컴포넌트 구현

### 6.1 카테고리 관리 메인 컴포넌트
`components/CategoryManager.tsx` 파일 생성:
```typescript
import React, { useState, useEffect } from 'react'
import { categoryGroupApi, categoryItemApi, getCategoryStructure } from '../lib/categoryApi'
import { CategoryStructure } from '../types/category'

interface GroupFormData {
  name: string
  description: string
}

interface ItemFormData {
  name: string
  description: string
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<CategoryStructure[]>([])
  const [selectedGroup, setSelectedGroup] = useState<CategoryStructure | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 폼 상태
  const [groupForm, setGroupForm] = useState<GroupFormData>({ name: '', description: '' })
  const [itemForm, setItemForm] = useState<ItemFormData>({ name: '', description: '' })

  // 데이터 로드
  const loadCategories = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await getCategoryStructure()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // 그룹 추가
  const handleAddGroup = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    try {
      await categoryGroupApi.create(groupForm.name, groupForm.description)
      setGroupForm({ name: '', description: '' })
      await loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : '그룹 추가 중 오류가 발생했습니다.')
    }
  }

  // 아이템 추가
  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!selectedGroup) {
      setError('그룹을 먼저 선택해주세요.')
      return
    }

    try {
      await categoryItemApi.create(
        selectedGroup.id, 
        itemForm.name, 
        itemForm.description
      )
      setItemForm({ name: '', description: '' })
      await loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : '아이템 추가 중 오류가 발생했습니다.')
    }
  }

  // 그룹 삭제
  const handleDeleteGroup = async (groupId: string): Promise<void> => {
    if (!confirm('이 그룹과 모든 하위 항목이 삭제됩니다. 계속하시겠습니까?')) return
    
    try {
      await categoryGroupApi.delete(groupId)
      await loadCategories()
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '그룹 삭제 중 오류가 발생했습니다.')
    }
  }

  // 아이템 삭제
  const handleDeleteItem = async (itemId: string): Promise<void> => {
    if (!confirm('이 항목을 삭제하시겠습니까?')) return
    
    try {
      await categoryItemApi.delete(itemId)
      await loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : '아이템 삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) return <div className="p-4">로딩 중...</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">카테고리 관리</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 그룹 관리 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">그룹 카테고리 관리</h2>
          
          <form onSubmit={handleAddGroup} className="mb-4">
            <div className="mb-3">
              <input
                type="text"
                placeholder="그룹 이름 (예: 구약)"
                value={groupForm.name}
                onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                placeholder="설명 (선택사항)"
                value={groupForm.description}
                onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                rows={2}
              />
            </div>
            <button 
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              그룹 추가
            </button>
          </form>

          <div className="space-y-2">
            {categories.map(group => (
              <div 
                key={group.id}
                className={`p-3 border rounded cursor-pointer ${
                  selectedGroup?.id === group.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedGroup(group)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-600">
                      아이템 {group.category_items.length}개
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteGroup(group.id)
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 아이템 관리 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            아이템 카테고리 관리
            {selectedGroup && (
              <span className="text-sm text-gray-600 ml-2">
                ({selectedGroup.name})
              </span>
            )}
          </h2>

          {selectedGroup ? (
            <>
              <form onSubmit={handleAddItem} className="mb-4">
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="아이템 이름 (예: 창세기)"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    placeholder="설명 (선택사항)"
                    value={itemForm.description}
                    onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={2}
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  아이템 추가
                </button>
              </form>

              <div className="space-y-2">
                {selectedGroup.category_items.map(item => (
                  <div key={item.id} className="p-3 border border-gray-300 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500">
              왼쪽에서 그룹을 선택하여 아이템을 관리하세요.
            </p>
          )}
        </div>
      </div>

      {/* 전체 구조 미리보기 */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">카테고리 구조 미리보기</h2>
        <div className="space-y-4">
          {categories.map(group => (
            <div key={group.id} className="border border-gray-200 rounded p-4">
              <h3 className="font-bold text-lg text-blue-600">{group.name}</h3>
              {group.description && (
                <p className="text-gray-600 mb-2">{group.description}</p>
              )}
              <div className="ml-4 space-y-1">
                {group.category_items.map(item => (
                  <div key={item.id} className="text-gray-700">
                    • {item.name}
                    {item.description && (
                      <span className="text-sm text-gray-500 ml-2">
                        - {item.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategoryManager
```

                                  {item.description && (
                                    <p className="text-sm text-gray-400">{item.description}</p>
                                  )}
                                </div>
                              </div>

                              {/* 아이템 액션 버튼 */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditItem(item, group.name)}
                                  className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 rounded transition-colors"
                                  title="아이템 수정"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item)}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                                  title="아이템 삭제"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 카테고리 모달 */}
      <CategoryModal
        isOpen={categoryModal.isOpen}
        onClose={() => setCategoryModal({ ...categoryModal, isOpen: false })}
        onSubmit={handleModalSubmit}
        type={categoryModal.type}
        parentGroupName={categoryModal.groupName}
        initialData={categoryModal.initialData}
        title={
          categoryModal.mode === 'edit' 
            ? `${categoryModal.type === 'group' ? '그룹' : '아이템'} 수정`
            : `${categoryModal.type === 'group' ? '그룹' : '아이템'} 추가`
        }
      />

      {/* 확인 모달 */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
          type={confirmModal.type}
        />
      )}
    </div>
  )
}

export default CategoryManager
```

## 7. 페이지 구현

### 7.1 메인 관리 페이지
`app/category-admin/page.tsx` 파일 생성:
```typescript
'use client'

import CategoryManager from '../../components/CategoryManager'

export default function CategoryAdminPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <CategoryManager />
    </div>
  )
}
```

### 7.2 카테고리 선택 컴포넌트 (다크모드)
`components/CategorySelector.tsx` 파일 생성:
```typescript
import React, { useState, useEffect } from 'react'
import { getCategoryStructure } from '../lib/categoryApi'
import { CategoryStructure, CategoryItem } from '../types/category'
import { ChevronDown, Folder, FileText } from 'lucide-react'

interface CategorySelectorProps {
  onSelect: (group: CategoryStructure | null, item: CategoryItem | null) => void
  selectedGroup?: CategoryStructure | null
  selectedItem?: CategoryItem | null
  className?: string
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  onSelect, 
  selectedGroup, 
  selectedItem,
  className = ''
}) => {
  const [categories, setCategories] = useState<CategoryStructure[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadCategories = async (): Promise<void> => {
      try {
        const data = await getCategoryStructure()
        setCategories(data)
      } catch (error) {
        console.error('카테고리 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 그룹 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Folder className="inline h-4 w-4 mr-1" />
          그룹 선택
        </label>
        <div className="relative">
          <select
            value={selectedGroup?.id || ''}
            onChange={(e) => {
              const group = categories.find(g => g.id === e.target.value) || null
              onSelect(group, null)
            }}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" className="text-gray-400">그룹을 선택하세요</option>
            {categories.map(group => (
              <option key={group.id} value={group.id} className="text-white">
                {group.name} ({group.category_items.length}개)
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* 아이템 선택 */}
      {selectedGroup && (
        <div className="animate-in slide-in-from-top duration-200">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            아이템 선택
          </label>
          <div className="relative">
            <select
              value={selectedItem?.id || ''}
              onChange={(e) => {
                const item = selectedGroup.category_items.find(i => i.id === e.target.value) || null
                onSelect(selectedGroup, item)
              }}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white appearance-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="" className="text-gray-400">아이템을 선택하세요</option>
              {selectedGroup.category_items.map(item => (
                <option key={item.id} value={item.id} className="text-white">
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  )
}

export default CategorySelector
```

### 7.3 카테고리 사용 예시 페이지
`app/category-example/page.tsx` 파일 생성:
```typescript
'use client'

import React, { useState } from 'react'
import CategorySelector from '../../components/CategorySelector'
import { CategoryStructure, CategoryItem } from '../../types/category'
import { CheckCircle, Circle } from 'lucide-react'

export default function CategoryExamplePage() {
  const [selectedGroup, setSelectedGroup] = useState<CategoryStructure | null>(null)
  const [selectedItem, setSelectedItem] = useState<CategoryItem | null>(null)

  const handleCategorySelect = (group: CategoryStructure | null, item: CategoryItem | null): void => {
    setSelectedGroup(group)
    setSelectedItem(item)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">📋 카테고리 선택 예시</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 카테고리 선택 영역 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-blue-400">카테고리 선택</h2>
            <CategorySelector
              onSelect={handleCategorySelect}
              selectedGroup={selectedGroup}
              selectedItem={selectedItem}
            />
          </div>

          {/* 선택 결과 영역 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-green-400">선택 결과</h2>
            
            <div className="space-y-4">
              {/* 그룹 선택 상태 */}
              <div className="flex items-start space-x-3">
                {selectedGroup ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-300">선택된 그룹:</p>
                  {selectedGroup ? (
                    <div className="mt-1">
                      <p className="text-blue-400 font-medium">{selectedGroup.name}</p>
                      {selectedGroup.description && (
                        <p className="text-sm text-gray-500">{selectedGroup.description}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        총 {selectedGroup.category_items.length}개 아이템
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-1">그룹을 선택해주세요</p>
                  )}
                </div>
              </div>

              {/* 아이템 선택 상태 */}
              <div className="flex items-start space-x-3">
                {selectedItem ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-300">선택된 아이템:</p>
                  {selectedItem ? (
                    <div className="mt-1">
                      <p className="text-green-400 font-medium">{selectedItem.name}</p>
                      {selectedItem.description && (
                        <p className="text-sm text-gray-500">{selectedItem.description}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-1">
                      {selectedGroup ? '아이템을 선택해주세요' : '먼저 그룹을 선택해주세요'}
                    </p>
                  )}
                </div>
              </div>

              {/* 완료 상태 */}
              {selectedGroup && selectedItem && (
                <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                  <p className="text-green-400 font-medium">✅ 선택 완료!</p>
                  <p className="text-sm text-gray-300 mt-1">
                    {selectedGroup.name} → {selectedItem.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 선택 데이터 JSON 미리보기 */}
        {(selectedGroup || selectedItem) && (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-purple-400">🔍 선택 데이터 (JSON)</h3>
            <pre className="bg-gray-900 p-4 rounded text-sm text-gray-300 overflow-auto">
              {JSON.stringify(
                {
                  selectedGroup: selectedGroup ? {
                    id: selectedGroup.id,
                    name: selectedGroup.name,
                    description: selectedGroup.description
                  } : null,
                  selectedItem: selectedItem ? {
                    id: selectedItem.id,
                    name: selectedItem.name,
                    description: selectedItem.description,
                    group_id: selectedItem.group_id
                  } : null
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
```

## 8. Tailwind CSS 다크모드 설정

### 8.1 tailwind.config.js 업데이트
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 다크모드 활성화
  theme: {
    extend: {
      colors: {
        gray: {
          850: '#1f2937', // 커스텀 그레이 색상
        }
      },
      animation: {
        'in': 'fadeIn 0.2s ease-in-out',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
```

### 8.2 글로벌 CSS 설정
`app/globals.css` 파일 업데이트:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 다크모드 기본 설정 */
html {
  @apply dark;
}

body {
  @apply bg-gray-900 text-white;
}

/* 커스텀 스크롤바 (다크모드) */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}

/* 선택 영역 스타일 */
::selection {
  @apply bg-blue-600 text-white;
}

/* 포커스 아웃라인 제거 */
button:focus {
  outline: none;
}

/* 애니메이션 클래스 */
.animate-in {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-from-top {
  animation: slideInFromTop 0.2s ease-out;
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 모달 배경 블러 효과 */
.modal-backdrop {
  backdrop-filter: blur(4px);
}
```
```typescript
import React, { useState, useEffect } from 'react'
import { getCategoryStructure } from '../lib/categoryApi'
import { CategoryStructure, CategoryItem } from '../types/category'

interface CategorySelectorProps {
  onSelect: (group: CategoryStructure | null, item: CategoryItem | null) => void
  selectedGroup?: CategoryStructure | null
  selectedItem?: CategoryItem | null
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  onSelect, 
  selectedGroup, 
  selectedItem 
}) => {
  const [categories, setCategories] = useState<CategoryStructure[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadCategories = async (): Promise<void> => {
      try {
        const data = await getCategoryStructure()
        setCategories(data)
      } catch (error) {
        console.error('카테고리 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (loading) return <div>카테고리 로딩 중...</div>

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          그룹 선택
        </label>
        <select
          value={selectedGroup?.id || ''}
          onChange={(e) => {
            const group = categories.find(g => g.id === e.target.value) || null
            onSelect(group, null)
          }}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">그룹을 선택하세요</option>
          {categories.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {selectedGroup && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            아이템 선택
          </label>
          <select
            value={selectedItem?.id || ''}
            onChange={(e) => {
              const item = selectedGroup.category_items.find(i => i.id === e.target.value) || null
              onSelect(selectedGroup, item)
            }}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">아이템을 선택하세요</option>
            {selectedGroup.category_items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export default CategorySelector
```

## 7. 페이지 구현

### 7.1 메인 관리 페이지
`pages/category-admin.tsx` 파일 생성:
```typescript
import { NextPage } from 'next'
import CategoryManager from '../components/CategoryManager'

const CategoryAdmin: NextPage = () => {
  return (
    <div>
      <CategoryManager />
    </div>
  )
}

export default CategoryAdmin
```

### 7.2 카테고리 사용 예시 페이지
`pages/category-example.tsx` 파일 생성:
```typescript
import React, { useState } from 'react'
import { NextPage } from 'next'
import CategorySelector from '../components/CategorySelector'
import { CategoryStructure, CategoryItem } from '../types/category'

const CategoryExample: NextPage = () => {
  const [selectedGroup, setSelectedGroup] = useState<CategoryStructure | null>(null)
  const [selectedItem, setSelectedItem] = useState<CategoryItem | null>(null)

  const handleCategorySelect = (group: CategoryStructure | null, item: CategoryItem | null): void => {
    setSelectedGroup(group)
    setSelectedItem(item)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">카테고리 선택 예시</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">카테고리 선택</h2>
          <CategorySelector
            onSelect={handleCategorySelect}
            selectedGroup={selectedGroup}
            selectedItem={selectedItem}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">선택 결과</h2>
          {selectedGroup ? (
            <div className="space-y-2">
              <p><strong>선택된 그룹:</strong> {selectedGroup.name}</p>
              {selectedGroup.description && (
                <p><strong>그룹 설명:</strong> {selectedGroup.description}</p>
              )}
              {selectedItem ? (
                <>
                  <p><strong>선택된 아이템:</strong> {selectedItem.name}</p>
                  {selectedItem.description && (
                    <p><strong>아이템 설명:</strong> {selectedItem.description}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">아이템을 선택하세요.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">그룹을 선택하세요.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryExample
```if (!selectedGroup) {
      setError('그룹을 먼저 선택해주세요.')
      return
    }

    try {
      await categoryItemApi.create(
        selectedGroup.id, 
        itemForm.name, 
        itemForm.description
      )
      setItemForm({ name: '', description: '' })
      await loadCategories()
    } catch (err) {
      setError(err.message)
    }
  }

  // 그룹 삭제
  const handleDeleteGroup = async (groupId) => {
    if (!confirm('이 그룹과 모든 하위 항목이 삭제됩니다. 계속하시겠습니까?')) return
    
    try {
      await categoryGroupApi.delete(groupId)
      await loadCategories()
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // 아이템 삭제
  const handleDeleteItem = async (itemId) => {
    if (!confirm('이 항목을 삭제하시겠습니까?')) return
    
    try {
      await categoryItemApi.delete(itemId)
      await loadCategories()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="p-4">로딩 중...</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">카테고리 관리</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 그룹 관리 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">그룹 카테고리 관리</h2>
          
          <form onSubmit={handleAddGroup} className="mb-4">
            <div className="mb-3">
              <input
                type="text"
                placeholder="그룹 이름 (예: 구약)"
                value={groupForm.name}
                onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                placeholder="설명 (선택사항)"
                value={groupForm.description}
                onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                rows="2"
              />
            </div>
            <button 
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              그룹 추가
            </button>
          </form>

          <div className="space-y-2">
            {categories.map(group => (
              <div 
                key={group.id}
                className={`p-3 border rounded cursor-pointer ${
                  selectedGroup?.id === group.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedGroup(group)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-600">
                      아이템 {group.category_items.length}개
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteGroup(group.id)
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 아이템 관리 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            아이템 카테고리 관리
            {selectedGroup && (
              <span className="text-sm text-gray-600 ml-2">
                ({selectedGroup.name})
              </span>
            )}
          </h2>

          {selectedGroup ? (
            <>
              <form onSubmit={handleAddItem} className="mb-4">
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="아이템 이름 (예: 창세기)"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    placeholder="설명 (선택사항)"
                    value={itemForm.description}
                    onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="2"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  아이템 추가
                </button>
              </form>

              <div className="space-y-2">
                {selectedGroup.category_items.map(item => (
                  <div key={item.id} className="p-3 border border-gray-300 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500">
              왼쪽에서 그룹을 선택하여 아이템을 관리하세요.
            </p>
          )}
        </div>
      </div>

      {/* 전체 구조 미리보기 */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">카테고리 구조 미리보기</h2>
        <div className="space-y-4">
          {categories.map(group => (
            <div key={group.id} className="border border-gray-200 rounded p-4">
              <h3 className="font-bold text-lg text-blue-600">{group.name}</h3>
              {group.description && (
                <p className="text-gray-600 mb-2">{group.description}</p>
              )}
              <div className="ml-4 space-y-1">
                {group.category_items.map(item => (
                  <div key={item.id} className="text-gray-700">
                    • {item.name}
                    {item.description && (
                      <span className="text-sm text-gray-500 ml-2">
                        - {item.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategoryManager
```

## 8. TypeScript 설정 파일

### 8.1 tsconfig.json 설정
프로젝트 루트에 `tsconfig.json` 파일 생성 또는 수정:
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 8.2 next-env.d.ts 파일
프로젝트 루트에 `next-env.d.ts` 파일 생성:
```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
```

## 9. 사용 방법

### 9.1 개발 서버 실행
```bash
npm run dev
```

### 9.2 사용 순서
1. `http://localhost:3000/category-admin`에서 카테고리 관리
2. **그룹 추가** 버튼으로 새 그룹 생성 (예: "구약", "신약")
3. 그룹 행의 **➕** 버튼으로 하위 아이템 추가 (예: "창세기", "출애굽기")
4. **🔽** 아이콘으로 그룹 펼침/접힘 제어
5. `http://localhost:3000/category-example`에서 카테고리 선택 테스트

### 9.3 주요 UI/UX 특징
- **다크모드**: 기본 다크 테마로 눈의 피로감 최소화
- **Accordion UI**: 그룹별 펼침/접힘으로 깔끔한 정보 구조화
- **모달 중심**: 추가/수정은 모달로, 삭제는 확인 모달로 안전한 UX
- **실시간 반영**: 모든 CRUD 작업 후 즉시 UI 업데이트
- **아이콘 활용**: Lucide 아이콘으로 직관적인 액션 표시

### 9.4 실제 사용 예시 (Zustand Store 활용)
```typescript
// 다른 컴포넌트에서 카테고리 데이터 사용
import { useCategoryStore } from '../store/categoryStore'

const MyComponent: React.FC = () => {
  const { categories, loading, fetchCategories, addGroup, expandGroup } = useCategoryStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleQuickAdd = async () => {
    try {
      await addGroup('새 그룹', '자동 생성된 그룹')
      // 추가 후 자동으로 해당 그룹 펼치기
      expandGroup(newGroupId)
    } catch (error) {
      console.error('그룹 추가 실패:', error)
    }
  }

  if (loading) return <div className="text-white">로딩 중...</div>

  return (
    <div className="bg-gray-900 text-white">
      {categories.map(group => (
        <div key={group.id} className="mb-4">
          <h2 className="text-xl font-bold">{group.name}</h2>
          <ul className="ml-4">
            {group.category_items.map(item => (
              <li key={item.id} className="text-gray-300">{item.name}</li>
            ))}
          </ul>
        </div>
      ))}
      <button 
        onClick={handleQuickAdd}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        빠른 그룹 추가
      </button>
    </div>
  )
}
```

### 9.5 커스텀 훅 활용 예시
`hooks/useCategories.ts` 파일 생성:
```typescript
import { useState, useEffect } from 'react'
import { useCategoryStore } from '../store/categoryStore'
import { CategoryStructure } from '../types/category'

interface UseCategoriesOptions {
  autoFetch?: boolean
  expandFirstGroup?: boolean
}

interface UseCategoriesReturn {
  categories: CategoryStructure[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getGroupById: (id: string) => CategoryStructure | undefined
  getItemsByGroupId: (groupId: string) => CategoryItem[]
}

export const useCategories = (options: UseCategoriesOptions = {}): UseCategoriesReturn => {
  const { autoFetch = true, expandFirstGroup = false } = options
  const { 
    categories, 
    loading, 
    fetchCategories, 
    expandGroup 
  } = useCategoryStore()
  
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (autoFetch) {
      fetchCategories().catch(err => {
        setError(err.message)
      })
    }
  }, [autoFetch, fetchCategories])

  useEffect(() => {
    if (expandFirstGroup && categories.length > 0) {
      expandGroup(categories[0].id)
    }
  }, [expandFirstGroup, categories, expandGroup])

  const getGroupById = (id: string) => {
    return categories.find(group => group.id === id)
  }

  const getItemsByGroupId = (groupId: string) => {
    const group = getGroupById(groupId)
    return group?.category_items || []
  }

  const refetch = async () => {
    try {
      setError(null)
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
    }
  }

  return {
    categories,
    loading,
    error,
    refetch,
    getGroupById,
    getItemsByGroupId
  }
}

// 사용 예시
const ExampleComponent: React.FC = () => {
  const { categories, loading, error, getGroupById } = useCategories({
    autoFetch: true,
    expandFirstGroup: true
  })

  if (loading) return <div className="text-white">로딩 중...</div>
  if (error) return <div className="text-red-400">오류: {error}</div>

  return (
    <div className="bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">카테고리 목록</h1>
      {categories.map(category => (
        <div key={category.id} className="mb-4 p-4 bg-gray-800 rounded">
          <h2 className="text-lg font-semibold">{category.name}</h2>
          <p className="text-gray-400">{category.description}</p>
          <div className="mt-2">
            {category.category_items.map(item => (
              <span key={item.id} className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-sm mr-2 mb-1">
                {item.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## 10. 고급 기능 구현

### 10.1 드래그 앤 드롭 순서 변경 (선택사항)
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

`components/DraggableCategoryList.tsx`:
```typescript
import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

// 드래그 가능한 아이템 컴포넌트
const SortableItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <button
        className="p-2 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  )
}

// 사용 예시
const DraggableCategoryList: React.FC = () => {
  // ... 구현 내용
}
```

### 10.2 검색 및 필터링 기능
`components/CategorySearch.tsx`:
```typescript
import React, { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { useCategoryStore } from '../store/categoryStore'

const CategorySearch: React.FC = () => {
  const { categories } = useCategoryStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories

    return categories.map(group => ({
      ...group,
      category_items: group.category_items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    })).filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      group.category_items.length > 0
    )
  }, [categories, searchTerm])

  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="카테고리 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {searchTerm && (
        <div className="mt-2 text-sm text-gray-400">
          검색 결과: {filteredCategories.length}개 그룹, {' '}
          {filteredCategories.reduce((acc, group) => acc + group.category_items.length, 0)}개 아이템
        </div>
      )}
    </div>
  )
}
```: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<CategoryStructure[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCategoryStructure()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  }
}

// 사용 예시
const ExampleComponent: React.FC = () => {
  const { categories, loading, error, refetch } = useCategories()

  if (loading) return <div>로딩 중...</div>
  if (error) return <div>오류: {error}</div>

  return (
    <div>
      <button onClick={refetch}>새로고침</button>
      {categories.map(category => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  )
}
```

## 10. 고급 기능 구현

### 10.1 실시간 업데이트 (Supabase Realtime)
`hooks/useRealtimeCategories.ts` 파일 생성:
```typescript
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getCategoryStructure } from '../lib/categoryApi'
import { CategoryStructure } from '../types/category'

export const useRealtimeCategories = (): {
  categories: CategoryStructure[]
  loading: boolean
} => {
  const [categories, setCategories] = useState<CategoryStructure[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // 초기 데이터 로드
    const loadInitialData = async (): Promise<void> => {
      try {
        const data = await getCategoryStructure()
        setCategories(data)
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()

    // 실시간 구독 설정
    const groupsSubscription = supabase
      .channel('category_groups_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'category_groups' },
        (payload) => {
          console.log('그룹 변경 감지:', payload)
          loadInitialData() // 변경 시 전체 데이터 다시 로드
        }
      )
      .subscribe()

    const itemsSubscription = supabase
      .channel('category_items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'category_items' },
        (payload) => {
          console.log('아이템 변경 감지:', payload)
          loadInitialData() // 변경 시 전체 데이터 다시 로드
        }
      )
      .subscribe()

    // 클린업
    return () => {
      supabase.removeChannel(groupsSubscription)
      supabase.removeChannel(itemsSubscription)
    }
  }, [])

  return { categories, loading }
}
```

### 10.2 검색 기능 추가
`components/CategorySearch.tsx` 파일 생성:
```typescript
import React, { useState, useMemo } from 'react'
import { CategoryStructure, CategoryItem } from '../types/category'

interface CategorySearchProps {
  categories: CategoryStructure[]
  onItemSelect: (group: CategoryStructure, item: CategoryItem) => void
}

interface SearchResult {
  group: CategoryStructure
  item: CategoryItem
  matchType: 'group' | 'item'
}

const CategorySearch: React.FC<CategorySearchProps> = ({ categories, onItemSelect }) => {
  const [searchTerm, setSearchTerm] = useState<string>('')

  const searchResults = useMemo((): SearchResult[] => {
    if (!searchTerm.trim()) return []

    const results: SearchResult[] = []
    const term = searchTerm.toLowerCase()

    categories.forEach(group => {
      // 그룹 이름 검색
      if (group.name.toLowerCase().includes(term)) {
        group.category_items.forEach(item => {
          results.push({
            group,
            item,
            matchType: 'group'
          })
        })
      }

      // 아이템 이름 검색
      group.category_items.forEach(item => {
        if (item.name.toLowerCase().includes(term)) {
          results.push({
            group,
            item,
            matchType: 'item'
          })
        }
      })
    })

    return results
  }, [categories, searchTerm])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="카테고리 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={`${result.group.id}-${result.item.id}-${index}`}
                onClick={() => onItemSelect(result.group, result.item)}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="text-sm text-gray-600">
                  {result.group.name} / <span className="font-medium">{result.item.name}</span>
                </div>
                {result.matchType === 'group' && (
                  <div className="text-xs text-blue-600">그룹명 일치</div>
                )}
                {result.matchType === 'item' && (
                  <div className="text-xs text-green-600">아이템명 일치</div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {searchTerm && searchResults.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
            <div className="text-gray-500 text-center">검색 결과가 없습니다.</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategorySearch
```

## 11. 주의사항 및 팁

### 11.1 TypeScript 관련 팁
- 엄격한 타입 체크를 위해 `strict: true` 설정 유지
- `null` 체크를 위해 옵셔널 체이닝(`?.`) 활용
- API 응답 타입을 명확히 정의하여 런타임 오류 방지
- 컴포넌트 props에 대한 인터페이스 정의 필수

### 11.2 에러 처리
- 네트워크 오류 시 재시도 로직 구현
- 사용자에게 친화적인 에러 메시지 표시
- 로딩 상태 관리로 UX 개선
- TypeScript를 활용한 컴파일 타임 오류 방지

### 11.3 성능 최적화
- `React.memo()`로 불필요한 리렌더링 방지
- `useMemo`와 `useCallback`으로 최적화
- 대용량 데이터의 경우 페이지네이션 구현
- Supabase의 실시간 구독 기능 활용 고려

### 11.4 보안
- RLS 정책을 프로덕션 환경에 맞게 조정
- 환경변수 보안 관리
- 입력값 검증 및 SQL 인젝션 방지
- TypeScript 타입 시스템을 통한 데이터 검증

이제 완전한 TypeScript 기반 2단계 카테고리 시스템이 구축되었습니다. 타입 안정성과 개발자 경험이 크게 향상되었으며, 실시간 업데이트와 검색 기능까지 포함된 완성도 높은 시스템입니다.