# 성경자료 관리 시스템 PRD (Product Requirements Document)

## 프로젝트 개요

### 기술 스택
- **프론트엔드**: Next.js 14+ (App Router)
- **상태관리**: Zustand
- **스타일링**: TailwindCSS
- **언어**: TypeScript
- **온라인 저장소**: Supabase (PostgreSQL + Storage)
- **오프라인 저장소**: IndexedDB + LocalStorage
- **동기화 엔진**: 커스텀 하이브리드 동기화 시스템
- **파일 처리**: 청킹 기반 대용량 파일 지원
- **보안**: AES-GCM 암호화, SHA-256 체크섬
- **코드 에디터**: Monaco Editor (VS Code 기반)
- **파일 렌더링**: 
  - HTML: iframe + sanitization
  - Markdown: unified + remark + rehype
  - CSV: Papa Parse + 테이블 렌더링
  - PDF: PDF.js
  - 이미지: 고급 이미지 뷰어
  - 미디어: HTML5 audio/video 플레이어

### 프로젝트 목적
성경 자료를 체계적으로 관리하고 공유할 수 있는 **오프라인 우선(Offline-First)** 웹 애플리케이션 개발

### 핵심 아키텍처 특징
- **하이브리드 저장**: 온라인(Supabase) + 오프라인(IndexedDB) 이중 저장
- **지능적 동기화**: 네트워크 상태 기반 자동 동기화
- **충돌 해결**: 4가지 전략 (서버 우선, 클라이언트 우선, 자동 병합, 수동 해결)
- **견고한 에러 처리**: 지수 백오프 재시도 및 실시간 알림

## 디자인 시스템

### 컬러 스키마

#### 다크 모드 (Primary)
```css
--background: #1a1f2e
--surface: #242938
--surface-variant: #2d3448
--primary: #6366f1 (indigo-500)
--primary-variant: #4338ca (indigo-700)
--secondary: #10b981 (emerald-500)
--accent: #f59e0b (amber-500)
--error: #ef4444 (red-500)
--warning: #f97316 (orange-500)
--success: #10b981 (emerald-500)
--text-primary: #f8fafc (slate-50)
--text-secondary: #cbd5e1 (slate-300)
--text-muted: #64748b (slate-500)
--border: #374151 (gray-700)
--border-light: #4b5563 (gray-600)

/* 하이브리드 저장 상태 색상 */
--sync-synced: #10b981 (emerald-500)
--sync-pending: #f59e0b (amber-500)
--sync-error: #ef4444 (red-500)
--sync-conflict: #f97316 (orange-500)
--offline-mode: #6b7280 (gray-500)
```

#### 라이트 모드 (Optional)
```css
--background: #ffffff
--surface: #f8fafc
--surface-variant: #f1f5f9
--primary: #6366f1
--primary-variant: #4338ca
--secondary: #10b981
--accent: #f59e0b
--error: #ef4444
--warning: #f97316
--success: #10b981
--text-primary: #0f172a
--text-secondary: #334155
--text-muted: #64748b
--border: #e2e8f0
--border-light: #cbd5e1

/* 하이브리드 저장 상태 색상 */
--sync-synced: #10b981
--sync-pending: #f59e0b
--sync-error: #ef4444
--sync-conflict: #f97316
--offline-mode: #6b7280
```

### 타이포그래피
- **제목**: font-bold text-xl-2xl
- **부제목**: font-medium text-lg
- **본문**: font-normal text-base
- **캡션**: font-normal text-sm
- **소제목**: font-medium text-sm
- **저장 상태**: font-medium text-xs (동적 색상)

## 데이터베이스 아키텍처 및 하이브리드 저장 시스템

### 저장 구조 개요

#### 하이브리드 저장 전략
본 시스템은 **오프라인 우선(Offline-First)** 아키텍처를 채택하여 네트워크 상태와 무관하게 최적의 사용자 경험을 제공합니다.

```
┌─────────────────────────────────────────────────────────┐
│                   하이브리드 저장 시스템                    │
├─────────────────────┬───────────────────────────────────┤
│     Online Store    │        Offline Store              │
│                     │                                   │
│    ┌─────────────┐  │  ┌─────────────┬─────────────────┐ │
│    │  Supabase   │  │  │ IndexedDB   │ LocalStorage    │ │
│    │             │  │  │             │                 │ │
│    │ - 파일 메타  │  │  │ - 파일 데이터│ - 사용자 설정   │ │
│    │ - 사용자 데이터│ │  │ - 캐시 데이터│ - 임시 상태     │ │
│    │ - 동기화 로그│  │  │ - 큐 데이터  │ - 세션 정보     │ │
│    └─────────────┘  │  └─────────────┴─────────────────┘ │
└─────────────────────┴───────────────────────────────────┘
                     ↕
            ┌─────────────────────────┐
            │   동기화 엔진 (Sync)     │
            │                         │
            │ - 양방향 동기화          │
            │ - 충돌 해결             │
            │ - 자동 재시도           │
            │ - 백그라운드 동기화      │
            └─────────────────────────┘
```

### Supabase 테이블 구조 (개선된 버전)

#### 1. materials (자료 메타데이터) - 개선 필요
```sql
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_type ENUM('bible', 'general') NOT NULL,
  category_id UUID REFERENCES categories(id), -- 추가: 카테고리 외래키
  bible_book VARCHAR(50), -- 성경 책명 (성경자료인 경우)
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_url TEXT, -- Supabase Storage URL
  thumbnail_url TEXT, -- 추가: 썸네일 URL (이미지/PDF용)
  content TEXT, -- 추가: 편집 가능한 파일의 텍스트 내용
  is_editable BOOLEAN DEFAULT FALSE, -- 추가: 편집 가능 여부
  upload_status ENUM('pending', 'uploading', 'completed', 'failed') DEFAULT 'pending',
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  preview_metadata JSONB DEFAULT '{}', -- 추가: 미리보기 관련 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id),
  sync_version INTEGER DEFAULT 1,
  local_id VARCHAR(36), -- 로컬에서 생성된 UUID
  conflict_resolution_data JSONB DEFAULT '{}'
);

-- 인덱스 최적화
CREATE INDEX idx_materials_category_type ON materials(category_type);
CREATE INDEX idx_materials_bible_book ON materials(bible_book);
CREATE INDEX idx_materials_category_id ON materials(category_id);
CREATE INDEX idx_materials_user ON materials(user_id);
CREATE INDEX idx_materials_sync ON materials(sync_version);
CREATE INDEX idx_materials_local_id ON materials(local_id);
CREATE INDEX idx_materials_file_type ON materials(file_type);
CREATE INDEX idx_materials_is_editable ON materials(is_editable);
CREATE INDEX idx_materials_updated_at ON materials(updated_at DESC);

-- 풀텍스트 검색을 위한 인덱스
CREATE INDEX idx_materials_search ON materials USING gin(to_tsvector('korean', title || ' ' || COALESCE(description, '')));
```

#### 2. categories (카테고리 관리) - 새로 추가
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL 친화적 식별자
  type ENUM('bible', 'general', 'system') NOT NULL,
  parent_id UUID REFERENCES categories(id), -- 트리 구조
  sort_order INTEGER DEFAULT 0,
  description TEXT,
  icon VARCHAR(50), -- 아이콘 클래스명
  color VARCHAR(7), -- 헥스 컬러 코드
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  sync_version INTEGER DEFAULT 1
);

-- 트리 구조 최적화를 위한 인덱스
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_active ON categories(is_active);

-- 중복 방지 제약조건
ALTER TABLE categories ADD CONSTRAINT unique_category_name_per_parent 
  UNIQUE(name, parent_id, type);
```

#### 3. bible_books (성경 책 메타데이터) - 새로 추가
```sql
CREATE TABLE bible_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id VARCHAR(10) UNIQUE NOT NULL, -- 'gen', 'exo', 'mat' 등
  name VARCHAR(50) NOT NULL, -- '창세기', '출애굽기'
  english_name VARCHAR(50) NOT NULL, -- 'Genesis', 'Exodus'
  testament ENUM('old', 'new') NOT NULL,
  book_order INTEGER NOT NULL, -- 1-66
  chapter_count INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL, -- '모세오경', '복음서' 등
  abbreviation VARCHAR(10), -- '창', '출'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 성경책 순서를 위한 인덱스
CREATE INDEX idx_bible_books_order ON bible_books(book_order);
CREATE INDEX idx_bible_books_testament ON bible_books(testament);
CREATE INDEX idx_bible_books_category ON bible_books(category);

-- 성경 66권 데이터 삽입
INSERT INTO bible_books (book_id, name, english_name, testament, book_order, chapter_count, category, abbreviation) VALUES
-- 구약 (Old Testament)
('gen', '창세기', 'Genesis', 'old', 1, 50, '모세오경', '창'),
('exo', '출애굽기', 'Exodus', 'old', 2, 40, '모세오경', '출'),
('lev', '레위기', 'Leviticus', 'old', 3, 27, '모세오경', '레'),
('num', '민수기', 'Numbers', 'old', 4, 36, '모세오경', '민'),
('deu', '신명기', 'Deuteronomy', 'old', 5, 34, '모세오경', '신'),
-- ... (전체 66권 데이터)
('rev', '요한계시록', 'Revelation', 'new', 66, 22, '예언서', '계');
```

#### 4. file_versions (편집 히스토리) - 새로 추가
```sql
CREATE TABLE file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL, -- 해당 버전의 파일 내용
  content_diff TEXT, -- 이전 버전과의 차이점 (diff)
  change_summary VARCHAR(255), -- 변경 사항 요약
  file_size BIGINT,
  checksum VARCHAR(64), -- 내용 무결성 검증
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- 복합 기본키 대신 고유 제약조건 사용
  CONSTRAINT unique_material_version UNIQUE(material_id, version_number)
);

-- 버전 관리를 위한 인덱스
CREATE INDEX idx_file_versions_material ON file_versions(material_id);
CREATE INDEX idx_file_versions_created_at ON file_versions(created_at DESC);
CREATE INDEX idx_file_versions_created_by ON file_versions(created_by);

-- 자동 버전 증가 트리거
CREATE OR REPLACE FUNCTION increment_version_number()
RETURNS TRIGGER AS $
BEGIN
  IF NEW.version_number IS NULL THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO NEW.version_number 
    FROM file_versions 
    WHERE material_id = NEW.material_id;
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER set_version_number 
  BEFORE INSERT ON file_versions 
  FOR EACH ROW EXECUTE FUNCTION increment_version_number();
```

#### 5. sync_queue (동기화 큐) - 기존 유지
```sql
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'material', 'category', etc
  entity_id VARCHAR(36) NOT NULL,
  operation ENUM('create', 'update', 'delete') NOT NULL,
  data JSONB NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
CREATE INDEX idx_sync_queue_user ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at);
```

#### 6. backup_history (백업 히스토리) - 새로 추가
```sql
CREATE TABLE backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type ENUM('local', 'server', 'full') NOT NULL,
  backup_size BIGINT,
  file_count INTEGER,
  backup_url TEXT, -- 백업 파일 URL
  status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_backup_history_type ON backup_history(backup_type);
CREATE INDEX idx_backup_history_status ON backup_history(status);
CREATE INDEX idx_backup_history_created_by ON backup_history(created_by);
CREATE INDEX idx_backup_history_started_at ON backup_history(started_at DESC);
```

#### 7. user_preferences (사용자 설정) - 새로 추가
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme ENUM('light', 'dark', 'auto') DEFAULT 'dark',
  language VARCHAR(10) DEFAULT 'ko',
  editor_settings JSONB DEFAULT '{}', -- Monaco Editor 설정
  layout_settings JSONB DEFAULT '{}', -- 레이아웃 설정
  notification_settings JSONB DEFAULT '{}',
  sync_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

### 데이터베이스 관계도 (ERD)
```
bible_books (1) ----< materials (N)
    │
    └── book_id → bible_book

categories (1) ----< materials (N)
    │                   │
    │                   └── (1) ----< file_versions (N)
    │
    └── parent_id (self-reference)

auth.users (1) ----< materials (N)
    │
    ├── user_preferences (1:1)
    ├── backup_history (1:N)
    ├── file_versions (1:N)
    └── sync_queue (1:N)
```

### 뷰(View) 생성 - 성능 최적화
```sql
-- 성경책별 자료 통계 뷰
CREATE VIEW bible_book_stats AS
SELECT 
  bb.id,
  bb.book_id,
  bb.name,
  bb.testament,
  bb.book_order,
  bb.chapter_count,
  bb.category,
  COUNT(m.id) as total_materials,
  COUNT(CASE WHEN m.sync_version > 0 THEN 1 END) as synced_materials,
  COUNT(CASE WHEN m.is_editable = true THEN 1 END) as editable_materials,
  MAX(m.updated_at) as last_updated
FROM bible_books bb
LEFT JOIN materials m ON bb.name = m.bible_book 
  AND m.deleted_at IS NULL
GROUP BY bb.id, bb.book_id, bb.name, bb.testament, bb.book_order, bb.chapter_count, bb.category
ORDER BY bb.book_order;

-- 카테고리별 자료 통계 뷰
CREATE VIEW category_stats AS
WITH RECURSIVE category_tree AS (
  -- 루트 카테고리
  SELECT id, name, parent_id, type, 0 as level, ARRAY[id] as path
  FROM categories 
  WHERE parent_id IS NULL
  
  UNION ALL
  
  -- 하위 카테고리
  SELECT c.id, c.name, c.parent_id, c.type, ct.level + 1, ct.path || c.id
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT 
  ct.*,
  COUNT(m.id) as material_count,
  COUNT(CASE WHEN m.category_type = 'bible' THEN 1 END) as bible_materials,
  COUNT(CASE WHEN m.category_type = 'general' THEN 1 END) as general_materials
FROM category_tree ct
LEFT JOIN materials m ON ct.id = m.category_id AND m.deleted_at IS NULL
GROUP BY ct.id, ct.name, ct.parent_id, ct.type, ct.level, ct.path
ORDER BY ct.path;

-- 전체 자료실 통합 뷰
CREATE VIEW unified_materials AS
SELECT 
  m.id,
  m.title,
  m.description,
  m.category_type,
  CASE 
    WHEN m.category_type = 'bible' THEN m.bible_book
    ELSE c.name
  END as category_display,
  m.file_name,
  m.file_size,
  m.file_type,
  m.file_url,
  m.thumbnail_url,
  m.is_editable,
  m.upload_status,
  m.tags,
  m.created_at,
  m.updated_at,
  m.user_id,
  m.sync_version,
  -- 동기화 상태 계산
  CASE 
    WHEN m.sync_version = 0 THEN 'pending'
    WHEN m.conflict_resolution_data::text != '{}' THEN 'conflict'
    ELSE 'synced'
  END as sync_status,
  -- 파일 타입 그룹화
  CASE 
    WHEN m.file_type IN ('html', 'txt', 'csv', 'md') THEN 'editable'
    WHEN m.file_type = 'pdf' THEN 'document'
    WHEN m.file_type IN ('jpg', 'png', 'gif') THEN 'image'
    WHEN m.file_type IN ('mp3', 'wav') THEN 'audio'
    WHEN m.file_type IN ('mp4', 'mov') THEN 'video'
    ELSE 'other'
  END as file_category
FROM materials m
LEFT JOIN categories c ON m.category_id = c.id
WHERE m.deleted_at IS NULL;

-- 권한 설정
GRANT SELECT ON bible_book_stats TO authenticated;
GRANT SELECT ON category_stats TO authenticated;
GRANT SELECT ON unified_materials TO authenticated;
```

### IndexedDB 스키마 구조

```typescript
interface IndexedDBSchema {
  materials: {
    key: string; // local_id
    value: MaterialRecord;
    indexes: {
      'by-category': string;
      'by-bible-book': string;
      'by-sync-status': string;
      'by-updated-at': Date;
    };
  };
  sync_queue: {
    key: string;
    value: SyncQueueRecord;
    indexes: {
      'by-status': string;
      'by-retry-count': number;
      'by-created-at': Date;
    };
  };
  file_chunks: {
    key: string; // file_id + chunk_index
    value: {
      file_id: string;
      chunk_index: number;
      data: ArrayBuffer;
      checksum: string;
    };
  };
  app_metadata: {
    key: string;
    value: {
      last_sync: Date;
      sync_version: number;
      user_preferences: object;
    };
  };
}
```

## 레이아웃 구조

### 전체 레이아웃
```
┌─────────────────────────────────────────────────────────────┐
│  Header + Logo + Navigation Menu + 동기화 상태              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         Main Content (디바이스 너비의 90% 사용)              │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              Footer + 저장 상태 표시                         │
└─────────────────────────────────────────────────────────────┘
```

### 레이아웃 구성 요소

#### Header 구성 (상단 고정)
- **왼쪽**: 로고 + 앱 제목 "성경자료 관리"
- **중앙**: 네비게이션 메뉴
  - 🏠 HOME
  - 📁 전체자료실  
  - 📄 성경자료실
  - ✅ 일반자료실
  - 📊 데이터관리
- **오른쪽**: 동기화 상태 표시, 사용자 정보, 다크모드 토글

#### Main Content 영역
- **컨테이너 너비**: `width: 90vw` (디바이스 화면 너비의 90%)
- **중앙 정렬**: `margin: 0 auto`
- **반응형 최대 너비**: `max-width: 1400px`
- **여백**: `padding: 2rem 1rem`

#### Footer 구성 (하단)
- **1단**: "Sola Scriptura Biblical Research Archive." (중앙정렬)
- **2단**: "{현재년도} Built with ❤️ by 나 종 춘 | najongchoon@gmail.com" (중앙정렬)
- **저장 상태 표시**: 실시간 저장/동기화 상태 (우측 하단 고정)

### 레이아웃 CSS 구조
```css
.app-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  width: 90vw; /* 디바이스 화면 너비의 90% */
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 0;
}

.main-content {
  flex: 1;
  width: 90vw;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.footer {
  background: var(--surface-variant);
  position: relative;
  width: 90vw; /* 디바이스 화면 너비의 90% */
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 0;
  text-align: center;
}

.save-status-indicator {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 50;
}
```

## 페이지별 상세 명세

### 1. 홈페이지 (`/`)
**목적**: 블랭크 페이지 (사용자 정의 컨텐츠 공간)

#### 구성 요소
- **레이아웃**: 완전한 블랭크 페이지
- **컨테이너**: 90vw 너비의 깔끔한 빈 공간
- **컨텐츠**: 사용자가 필요에 따라 추가할 수 있는 유연한 공간
- **예시 활용 방안**:
  - 개인 성경 연구 노트
  - 일일 말씀 묵상
  - 성경 구절 즐겨찾기
  - 개인 대시보드 위젯
- **개발 구현**:
  ```tsx
  export default function HomePage() {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-500">
          <h1 className="text-2xl font-light mb-4">환영합니다</h1>
          <p>이 공간은 여러분의 성경 연구를 위한 개인 공간입니다.</p>
        </div>
      </div>
    );
  }
  ```

### 2. 전체자료실 (`/all-materials`)
**목적**: 성경자료실과 일반자료실 데이터를 종합적으로 테이블에서 확인하고 열람하는 기능

#### 구성 요소
- **페이지 제목**: "전체목록자료실"
- **부연설명**: "이곳은 모든 자료의 전체 목록을 한눈에 볼 수 있는 공간입니다. 다양한 자료를 효율적으로 관리하세요."
- **동기화 상태 헤더**: 실시간 동기화 현황 및 필터 옵션
- **통합 데이터 테이블**:
  - 성경자료실과 일반자료실의 모든 데이터 통합 표시
  - **테이블 헤더**: `제목 | 구분 | 미리보기 | 파일명 | 관리`
  - **관리 컬럼**: 수정(Edit), 삭제(Trash2) - Lucide 아이콘 사용
  - **새로운 추가**: 
    - 동기화 상태 컬럼 (동기화됨/대기중/충돌/에러)
    - 저장소 위치 표시 (로컬/서버/양쪽)
    - 마지막 동기화 시간
- **고급 검색 및 필터링**:
  - 키워드 검색
  - 자료실 유형별 필터 (성경자료/일반자료/전체)
  - 카테고리별 필터
  - 등록일 범위 설정
  - **새로운 추가**: 동기화 상태별 필터 (동기화됨/대기중/충돌)
- **페이지네이션 및 표시 옵션**
- **총 파일 수 및 통계 표시** (로컬/서버 구분)

#### 테이블 구조 예시
```tsx
interface TableColumn {
  header: string;
  accessor: string;
  width?: string;
}

const columns: TableColumn[] = [
  { header: '제목', accessor: 'title', width: '30%' },
  { header: '구분', accessor: 'category', width: '15%' },
  { header: '미리보기', accessor: 'preview', width: '20%' },
  { header: '파일명', accessor: 'fileName', width: '25%' },
  { header: '관리', accessor: 'actions', width: '10%' }
];

// 관리 컬럼 컴포넌트
const ActionButtons = ({ item }: { item: MaterialRecord }) => (
  <div className="flex items-center space-x-2">
    <button className="p-1 hover:bg-surface-variant rounded">
      <Edit className="w-4 h-4 text-text-secondary hover:text-primary" />
    </button>
    <button className="p-1 hover:bg-surface-variant rounded">
      <Trash2 className="w-4 h-4 text-text-secondary hover:text-error" />
    </button>
  </div>
);
```

### 3. 성경자료실 (`/bible-materials`)
**목적**: 성경 관련 자료 전용 공간

#### 구성 요소

##### 메인 페이지 (책 선택 화면)
- **페이지 제목**: "성경자료실"
- **부연설명**: "구약과 신약 성경 자료를 한눈에 확인할 수 있습니다."
- **동기화 상태 표시**: 성경 자료 동기화 현황
- **성경 책별 그리드**:
  - 구약 (Old Testament): 39권
    - 창세기, 출애굽기, 레위기, 민수기, 신명기, 여호수아, 사사기, 룻기
    - 사무엘상, 사무엘하, 열왕기상, 열왕기하, 역대상, 역대하, 에스라, 느헤미야
    - 에스더, 욥기, 시편, 잠언, 전도서, 아가, 이사야, 예레미야
    - 예레미야애가, 에스겔, 다니엘, 호세아, 요엘, 아모스, 오바댜, 요나
    - 미가, 나훔, 하박국, 스바냐, 학개, 스가랴, 말라기
  - 신약 (New Testament): 27권
    - 마태복음, 마가복음, 누가복음, 요한복음, 사도행전
    - 로마서, 고린도전서, 고린도후서, 갈라디아서, 에베소서, 빌립보서
    - 골로새서, 데살로니가전서, 데살로니가후서, 디모데전서, 디모데후서
    - 디도서, 빌레몬서, 히브리서, 야고보서, 베드로전서, 베드로후서
    - 요한일서, 요한이서, 요한삼서, 유다서, 요한계시록
- **각 책별 자료 개수 표시** (로컬/서버 동기화 상태 포함)

##### 책별 그리드 호버 애니메이션
```css
.bible-book-card {
  @apply bg-surface border border-border rounded-lg p-4 cursor-pointer;
  @apply transition-all duration-300 ease-in-out;
  @apply hover:scale-105 hover:shadow-lg hover:shadow-primary/20;
  @apply hover:border-primary hover:bg-surface-variant;
}

.bible-book-card:hover .book-title {
  @apply text-primary transform translate-y-[-2px];
}

.bible-book-card:hover .book-stats {
  @apply text-secondary;
}

/* 펄스 애니메이션 효과 */
.bible-book-card:hover::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(45deg, transparent, rgba(99, 102, 241, 0.1), transparent);
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}
```

##### 개별 책 상세 페이지 (`/bible-materials/[book]`)
**레이아웃**: 좌우 분할 (30% : 70%)

###### 좌측 영역 (30%) - 자료 등록 폼
```tsx
const MaterialRegistrationForm = ({ selectedBook }: { selectedBook: string }) => {
  return (
    <div className="w-[30%] bg-surface border-r border-border p-6 min-h-screen">
      <h3 className="text-lg font-bold mb-4">{selectedBook} 자료 등록</h3>
      
      {/* 파일 업로드 영역 */}
      <HybridUploadZone 
        onLocalSave={handleLocalSave}
        onServerSync={handleServerSync}
        allowedTypes={['pdf', 'docx', 'txt', 'mp3', 'mp4']}
        enableChunking={true}
      />
      
      {/* 입력 폼 */}
      <form className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium mb-2">제목</label>
          <input type="text" className="w-full p-2 border rounded-md" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">구분</label>
          <input 
            type="text" 
            value={selectedBook} 
            disabled 
            className="w-full p-2 border rounded-md bg-surface-variant"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">설명</label>
          <textarea rows={3} className="w-full p-2 border rounded-md" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">태그</label>
          <input type="text" placeholder="태그를 입력하세요 (쉼표로 구분)" className="w-full p-2 border rounded-md" />
        </div>
        
        <button type="submit" className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-variant">
          자료 등록
        </button>
      </form>
    </div>
  );
};
```

###### 우측 영역 (70%) - 자료 목록
```tsx
const MaterialsList = ({ selectedBook }: { selectedBook: string }) => {
  return (
    <div className="w-[70%] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">{selectedBook} 자료 목록</h3>
        <div className="text-sm text-text-secondary">
          총 {totalCount}개 (로컬: {localCount}, 서버: {serverCount})
        </div>
      </div>
      
      {/* 검색 및 필터 */}
      <div className="flex items-center space-x-4 mb-4">
        <input 
          type="text" 
          placeholder="자료 검색..." 
          className="flex-1 p-2 border rounded-md"
        />
        <select className="p-2 border rounded-md">
          <option value="all">전체</option>
          <option value="synced">동기화됨</option>
          <option value="pending">대기중</option>
          <option value="conflict">충돌</option>
        </select>
      </div>
      
      {/* 자료 목록 테이블 */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-variant">
            <tr>
              <th className="text-left p-3 w-[30%]">제목</th>
              <th className="text-left p-3 w-[15%]">구분</th>
              <th className="text-left p-3 w-[20%]">미리보기</th>
              <th className="text-left p-3 w-[25%]">파일명</th>
              <th className="text-left p-3 w-[10%]">관리</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr key={material.id} className="border-t hover:bg-surface-variant">
                <td className="p-3">{material.title}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    {material.bible_book}
                  </span>
                </td>
                <td className="p-3">
                  <PreviewComponent file={material} />
                </td>
                <td className="p-3 text-sm text-text-secondary">{material.file_name}</td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-surface rounded">
                      <Edit className="w-4 h-4 text-text-secondary hover:text-primary" />
                    </button>
                    <button className="p-1 hover:bg-surface rounded">
                      <Trash2 className="w-4 h-4 text-text-secondary hover:text-error" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

### 4. 일반자료실 (`/general-materials`)
**목적**: 성경 외 일반 자료 관리

#### 구성 요소
- **페이지 제목**: "일반자료실"
- **부연설명**: "일반 자료를 관리하는 공간입니다."
- **동기화 상태 표시**: 일반 자료 동기화 현황
- **파일 업로드 영역**: 드래그 앤 드롭 지원 (하이브리드 저장)
  ```tsx
  <HybridUploadZone 
    onLocalSave={handleLocalSave}
    onServerSync={handleServerSync}
    allowedTypes={['html', 'txt', 'csv', 'md', 'pdf', 'jpg', 'png', 'gif', 'mp3', 'mp4', 'mov']}
    enableChunking={true}
    maxFileSize={100 * 1024 * 1024} // 100MB
  />
  ```
- **검색 및 필터 기능** (동기화 상태 필터 포함)
  - 키워드 검색
  - 파일 타입별 필터 (문서/이미지/오디오/비디오)
  - 동기화 상태별 필터 (동기화됨/대기중/충돌/에러)
  - 등록일 범위 설정
- **자료 목록 테이블** (동기화 상태 컬럼 추가)
  - **테이블 헤더**: `제목 | 구분 | 미리보기 | 파일명 | 관리`
  - **관리 컬럼**: 수정(Edit), 삭제(Trash2) - Lucide 아이콘 사용
  ```tsx
  const columns: TableColumn[] = [
    { header: '제목', accessor: 'title', width: '30%' },
    { header: '구분', accessor: 'category', width: '15%' },
    { header: '미리보기', accessor: 'preview', width: '20%' },
    { header: '파일명', accessor: 'fileName', width: '25%' },
    { header: '관리', accessor: 'actions', width: '10%' }
  ];
  
  const ActionButtons = ({ item }: { item: MaterialRecord }) => (
    <div className="flex items-center space-x-2">
      <button className="p-1 hover:bg-surface-variant rounded">
        <Edit className="w-4 h-4 text-text-secondary hover:text-primary" />
      </button>
      <button className="p-1 hover:bg-surface-variant rounded">
        <Trash2 className="w-4 h-4 text-text-secondary hover:text-error" />
      </button>
    </div>
  );
  ```
- **총 파일 수 표시** (로컬/서버 구분)
  ```tsx
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold">일반 자료 목록</h3>
    <div className="text-sm text-text-secondary">
      총 {totalCount}개 | 로컬: {localCount}개 | 서버: {serverCount}개
    </div>
  </div>
  ```

### 5. 데이터관리 (`/data-management`)
**목적**: 시스템 데이터 관리 (좌우 분할 레이아웃)

#### 레이아웃 구성: 좌측 40% | 우측 60%

##### 좌측 영역 (40%) - 카테고리 관리
```tsx
const CategoryManagement = () => {
  return (
    <div className="w-[40%] bg-surface border-r border-border p-6 min-h-screen">
      <h3 className="text-lg font-bold mb-6">카테고리 관리</h3>
      
      {/* 카테고리 트리 구조 */}
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">성경자료 카테고리</h4>
          <div className="space-y-2">
            <CategoryTreeNode 
              category="구약"
              subcategories={["모세오경", "역사서", "시가서", "예언서"]}
            />
            <CategoryTreeNode 
              category="신약"
              subcategories={["복음서", "역사서", "서신서", "예언서"]}
            />
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">일반자료 카테고리</h4>
          <div className="space-y-2">
            <CategoryTreeNode 
              category="설교자료"
              subcategories={["주일설교", "특별설교", "예배자료"]}
            />
            <CategoryTreeNode 
              category="교육자료"
              subcategories={["주일학교", "성경공부", "교재"]}
            />
          </div>
        </div>
      </div>
      
      {/* 카테고리 추가/수정 폼 */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium mb-3">카테고리 관리</h4>
        <form className="space-y-3">
          <input 
            type="text" 
            placeholder="카테고리명" 
            className="w-full p-2 border rounded-md"
          />
          <select className="w-full p-2 border rounded-md">
            <option value="">상위 카테고리 선택</option>
            <option value="bible">성경자료</option>
            <option value="general">일반자료</option>
          </select>
          <div className="flex space-x-2">
            <button type="submit" className="flex-1 bg-primary text-white py-1 rounded text-sm">
              추가
            </button>
            <button type="button" className="flex-1 bg-secondary text-white py-1 rounded text-sm">
              수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

##### 우측 영역 (60%) - 데이터 관리
```tsx
const DataManagement = () => {
  const [activeTab, setActiveTab] = useState('materials');
  
  return (
    <div className="w-[60%] p-6">
      <h3 className="text-lg font-bold mb-6">데이터 관리</h3>
      
      {/* 탭 네비게이션 */}
      <div className="flex border-b mb-6">
        <button 
          className={`px-4 py-2 border-b-2 ${activeTab === 'materials' ? 'border-primary text-primary' : 'border-transparent'}`}
          onClick={() => setActiveTab('materials')}
        >
          자료실 관리
        </button>
        <button 
          className={`px-4 py-2 border-b-2 ${activeTab === 'backup' ? 'border-primary text-primary' : 'border-transparent'}`}
          onClick={() => setActiveTab('backup')}
        >
          백업/복원
        </button>
        <button 
          className={`px-4 py-2 border-b-2 ${activeTab === 'reset' ? 'border-primary text-primary' : 'border-transparent'}`}
          onClick={() => setActiveTab('reset')}
        >
          데이터 초기화
        </button>
      </div>
      
      {/* 탭 콘텐츠 */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">성경자료실 관리</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-surface-variant p-3 rounded">
                <div className="text-text-secondary">총 자료 수</div>
                <div className="text-xl font-bold">1,247개</div>
              </div>
              <div className="bg-surface-variant p-3 rounded">
                <div className="text-text-secondary">동기화 대기</div>
                <div className="text-xl font-bold text-warning">15개</div>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <button className="px-3 py-1 bg-primary text-white rounded text-sm">
                전체 동기화
              </button>
              <button className="px-3 py-1 bg-secondary text-white rounded text-sm">
                충돌 해결
              </button>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">일반자료실 관리</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-surface-variant p-3 rounded">
                <div className="text-text-secondary">총 자료 수</div>
                <div className="text-xl font-bold">856개</div>
              </div>
              <div className="bg-surface-variant p-3 rounded">
                <div className="text-text-secondary">동기화 대기</div>
                <div className="text-xl font-bold text-warning">8개</div>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <button className="px-3 py-1 bg-primary text-white rounded text-sm">
                전체 동기화
              </button>
              <button className="px-3 py-1 bg-secondary text-white rounded text-sm">
                충돌 해결
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">로컬 데이터 백업</h4>
            <p className="text-sm text-text-secondary mb-3">
              IndexedDB 및 LocalStorage 데이터를 백업합니다.
            </p>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-primary text-white rounded">
                백업 생성
              </button>
              <button className="px-4 py-2 bg-secondary text-white rounded">
                백업 복원
              </button>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Supabase 데이터 백업</h4>
            <p className="text-sm text-text-secondary mb-3">
              서버 데이터를 백업하고 복원합니다.
            </p>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-primary text-white rounded">
                서버 백업
              </button>
              <button className="px-4 py-2 bg-secondary text-white rounded">
                서버 복원
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'reset' && (
        <div className="space-y-6">
          <div className="border border-warning rounded-lg p-4">
            <h4 className="font-medium mb-3 text-warning">⚠️ 데이터 초기화</h4>
            <p className="text-sm text-text-secondary mb-3">
              모든 시스템 데이터를 초기화합니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-warning text-white rounded">
                모든 자료 삭제
              </button>
              <button className="w-full px-4 py-2 bg-error text-white rounded">
                카테고리 초기화
              </button>
              <button className="w-full px-4 py-2 bg-error text-white rounded">
                시스템 전체 초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 페이지 구현 예시
```tsx
export default function DataManagementPage() {
  return (
    <div className="flex min-h-screen">
      <CategoryManagement />
      <DataManagement />
    </div>
  );
}
```

## 고급 미리보기 및 편집 시스템

### 지원 파일 타입
- **편집 가능**: HTML, TXT, CSV, MD (Markdown)
- **렌더링 전용**: PDF, 이미지 (JPG, PNG, GIF), 오디오 (MP3, WAV), 비디오 (MP4, MOV)

### 미리보기 시스템 아키텍처

#### 1. 파일 확장명별 렌더링 엔진

```typescript
interface FileRenderer {
  type: string;
  component: React.ComponentType<FileViewerProps>;
  editable: boolean;
  features: string[];
}

const FILE_RENDERERS: Record<string, FileRenderer> = {
  html: {
    type: 'html',
    component: HTMLRenderer,
    editable: true,
    features: ['edit', 'preview', 'fullscreen', 'source']
  },
  txt: {
    type: 'text',
    component: TextRenderer,
    editable: true,
    features: ['edit', 'preview', 'fullscreen', 'source']
  },
  csv: {
    type: 'csv',
    component: CSVRenderer,
    editable: true,
    features: ['edit', 'preview', 'fullscreen', 'table']
  },
  md: {
    type: 'markdown',
    component: MarkdownRenderer,
    editable: true,
    features: ['edit', 'preview', 'fullscreen', 'source']
  },
  pdf: {
    type: 'pdf',
    component: PDFRenderer,
    editable: false,
    features: ['preview', 'fullscreen', 'zoom', 'download']
  },
  // 이미지 파일들
  jpg: { type: 'image', component: ImageRenderer, editable: false, features: ['preview', 'fullscreen', 'zoom'] },
  png: { type: 'image', component: ImageRenderer, editable: false, features: ['preview', 'fullscreen', 'zoom'] },
  gif: { type: 'image', component: ImageRenderer, editable: false, features: ['preview', 'fullscreen', 'zoom'] },
  // 미디어 파일들
  mp3: { type: 'audio', component: AudioRenderer, editable: false, features: ['preview', 'fullscreen', 'controls'] },
  mp4: { type: 'video', component: VideoRenderer, editable: false, features: ['preview', 'fullscreen', 'controls'] },
  mov: { type: 'video', component: VideoRenderer, editable: false, features: ['preview', 'fullscreen', 'controls'] }
};
```

#### 2. 통합 미리보기 컴포넌트

```tsx
interface UnifiedPreviewProps {
  file: MaterialRecord;
  mode: 'preview' | 'edit' | 'fullscreen';
  onModeChange: (mode: 'preview' | 'edit' | 'fullscreen') => void;
  onSave?: (content: string) => Promise<void>;
}

const UnifiedPreview = ({ file, mode, onModeChange, onSave }: UnifiedPreviewProps) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const fileExtension = file.file_name.split('.').pop()?.toLowerCase() || '';
  const renderer = FILE_RENDERERS[fileExtension];
  
  if (!renderer) {
    return <UnsupportedFileType fileName={file.file_name} />;
  }

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className={`preview-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* 미리보기 헤더 */}
      <PreviewHeader 
        file={file}
        renderer={renderer}
        mode={mode}
        onModeChange={onModeChange}
        onFullscreenToggle={handleFullscreenToggle}
        isFullscreen={isFullscreen}
      />
      
      {/* 미리보기 콘텐츠 */}
      <div className="preview-content">
        {mode === 'edit' && renderer.editable ? (
          <SplitViewEditor 
            file={file}
            content={content}
            onChange={setContent}
            onSave={onSave}
          />
        ) : (
          <renderer.component 
            file={file}
            content={content}
            mode={mode}
          />
        )}
      </div>
      
      {/* 전체화면 모드 종료 버튼 */}
      {isFullscreen && (
        <button 
          className="fullscreen-exit-btn"
          onClick={handleFullscreenToggle}
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
```

#### 3. 분할 뷰 에디터 (편집 모드)

```tsx
interface SplitViewEditorProps {
  file: MaterialRecord;
  content: string;
  onChange: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
}

const SplitViewEditor = ({ file, content, onChange, onSave }: SplitViewEditorProps) => {
  const [editorContent, setEditorContent] = useState(content);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const fileExtension = file.file_name.split('.').pop()?.toLowerCase() || '';

  // Monaco Editor 설정
  const editorOptions = {
    theme: 'vs-dark',
    fontSize: 14,
    minimap: { enabled: false },
    wordWrap: 'on' as const,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    language: getEditorLanguage(fileExtension)
  };

  // 자동 저장 (5초 간격)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (editorContent !== content) {
        handleAutoSave();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [editorContent]);

  const handleAutoSave = async () => {
    if (!onSave) return;
    
    setIsAutoSaving(true);
    try {
      await onSave(editorContent);
      onChange(editorContent);
    } catch (error) {
      console.error('자동 저장 실패:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const getEditorLanguage = (extension: string): string => {
    const languageMap: Record<string, string> = {
      html: 'html',
      txt: 'plaintext',
      csv: 'csv',
      md: 'markdown'
    };
    return languageMap[extension] || 'plaintext';
  };

  return (
    <div className="split-view-editor h-full flex">
      {/* 좌측: 소스 편집창 */}
      <div className="editor-panel w-1/2 border-r border-border">
        <div className="editor-header bg-surface-variant p-2 border-b flex items-center justify-between">
          <h4 className="text-sm font-medium">소스 편집</h4>
          <div className="flex items-center space-x-2">
            {isAutoSaving && (
              <span className="text-xs text-secondary flex items-center">
                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                저장 중...
              </span>
            )}
            <button 
              className="px-3 py-1 bg-primary text-white rounded text-xs"
              onClick={() => onSave?.(editorContent)}
            >
              저장
            </button>
          </div>
        </div>
        
        <MonacoEditor
          height="calc(100% - 48px)"
          language={getEditorLanguage(fileExtension)}
          value={editorContent}
          onChange={(value) => setEditorContent(value || '')}
          options={editorOptions}
          theme="vs-dark"
        />
      </div>
      
      {/* 우측: 실시간 미리보기 */}
      <div className="preview-panel w-1/2">
        <div className="preview-header bg-surface-variant p-2 border-b">
          <h4 className="text-sm font-medium">실시간 미리보기</h4>
        </div>
        
        <div className="preview-content h-full overflow-auto p-4">
          <LivePreview 
            content={editorContent}
            fileType={fileExtension}
          />
        </div>
      </div>
    </div>
  );
};
```

#### 4. 파일 타입별 렌더러 구현

##### HTML 렌더러
```tsx
const HTMLRenderer = ({ content }: { content: string }) => {
  const [sanitizedHTML, setSanitizedHTML] = useState<string>('');
  
  useEffect(() => {
    // HTML 콘텐츠 sanitization
    const sanitized = DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'table', 'tr', 'td', 'th'],
      ALLOWED_ATTR: ['class', 'id', 'href', 'src', 'alt', 'title']
    });
    setSanitizedHTML(sanitized);
  }, [content]);

  return (
    <div className="html-renderer">
      <iframe
        srcDoc={sanitizedHTML}
        className="w-full h-full border-0"
        sandbox="allow-same-origin"
        title="HTML Preview"
      />
    </div>
  );
};
```

##### Markdown 렌더러
```tsx
const MarkdownRenderer = ({ content }: { content: string }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  
  useEffect(() => {
    // Unified를 사용한 Markdown to HTML 변환
    unified()
      .use(remarkParse)
      .use(remarkGfm) // GitHub Flavored Markdown
      .use(remarkRehype)
      .use(rehypeHighlight) // 코드 하이라이팅
      .use(rehypeStringify)
      .process(content)
      .then(result => {
        setHtmlContent(String(result));
      });
  }, [content]);

  return (
    <div 
      className="markdown-renderer prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
```

##### CSV 렌더러
```tsx
const CSVRenderer = ({ content }: { content: string }) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  
  useEffect(() => {
    Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setHeaders(results.meta.fields || []);
        setCsvData(results.data);
      }
    });
  }, [content]);

  return (
    <div className="csv-renderer">
      <div className="mb-4 text-sm text-text-secondary">
        {csvData.length}행 × {headers.length}열
      </div>
      
      <div className="overflow-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-surface-variant">
              {headers.map((header, index) => (
                <th key={index} className="border border-border p-2 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-surface-variant">
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="border border-border p-2">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

##### PDF 렌더러
```tsx
const PDFRenderer = ({ file }: { file: MaterialRecord }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  return (
    <div className="pdf-renderer">
      <div className="pdf-controls bg-surface-variant p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            className="px-2 py-1 bg-primary text-white rounded disabled:opacity-50"
          >
            이전
          </button>
          <span className="text-sm">
            {pageNumber} / {numPages}
          </span>
          <button 
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            className="px-2 py-1 bg-primary text-white rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button onClick={() => setScale(scale - 0.1)} className="px-2 py-1 bg-secondary text-white rounded">
            축소
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(scale + 0.1)} className="px-2 py-1 bg-secondary text-white rounded">
            확대
          </button>
        </div>
      </div>
      
      <div className="pdf-content overflow-auto">
        <Document 
          file={file.file_url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          className="flex justify-center"
        >
          <Page 
            pageNumber={pageNumber}
            scale={scale}
            className="border border-border"
          />
        </Document>
      </div>
    </div>
  );
};
```

##### 이미지 렌더러
```tsx
const ImageRenderer = ({ file }: { file: MaterialRecord }) => {
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div className="image-renderer relative overflow-hidden">
      <div className="image-controls bg-surface-variant p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button onClick={() => setZoom(zoom - 0.1)} className="px-2 py-1 bg-secondary text-white rounded">
            축소
          </button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(zoom + 0.1)} className="px-2 py-1 bg-secondary text-white rounded">
            확대
          </button>
          <button onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }} className="px-2 py-1 bg-primary text-white rounded">
            원본 크기
          </button>
        </div>
      </div>
      
      <div className="image-content flex items-center justify-center h-full overflow-auto">
        <img 
          src={file.file_url}
          alt={file.file_name}
          style={{
            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
            cursor: zoom > 1 ? 'move' : 'default'
          }}
          className="max-w-none transition-transform"
          draggable={false}
        />
      </div>
    </div>
  );
};
```

##### 오디오/비디오 렌더러
```tsx
const MediaRenderer = ({ file, type }: { file: MaterialRecord; type: 'audio' | 'video' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  const MediaComponent = type === 'video' ? 'video' : 'audio';

  return (
    <div className="media-renderer">
      <div className="media-controls bg-surface-variant p-2 mb-4">
        <h4 className="font-medium">{file.file_name}</h4>
        <p className="text-sm text-text-secondary">
          {type === 'video' ? '비디오' : '오디오'} 파일
        </p>
      </div>
      
      <div className="media-content flex items-center justify-center">
        <MediaComponent
          ref={mediaRef}
          src={file.file_url}
          controls
          className={type === 'video' ? 'max-w-full max-h-full' : 'w-full'}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
};

const AudioRenderer = ({ file }: { file: MaterialRecord }) => (
  <MediaRenderer file={file} type="audio" />
);

const VideoRenderer = ({ file }: { file: MaterialRecord }) => (
  <MediaRenderer file={file} type="video" />
);
```

#### 5. 미리보기 헤더 컴포넌트

```tsx
interface PreviewHeaderProps {
  file: MaterialRecord;
  renderer: FileRenderer;
  mode: 'preview' | 'edit' | 'fullscreen';
  onModeChange: (mode: 'preview' | 'edit' | 'fullscreen') => void;
  onFullscreenToggle: () => void;
  isFullscreen: boolean;
}

const PreviewHeader = ({ 
  file, 
  renderer, 
  mode, 
  onModeChange, 
  onFullscreenToggle, 
  isFullscreen 
}: PreviewHeaderProps) => {
  return (
    <div className="preview-header bg-surface border-b border-border p-4 flex items-center justify-between">
      <div className="file-info">
        <h3 className="font-medium">{file.title}</h3>
        <p className="text-sm text-text-secondary">{file.file_name}</p>
      </div>
      
      <div className="preview-actions flex items-center space-x-2">
        {/* 미리보기 모드 버튼 */}
        <button 
          className={`px-3 py-1 rounded text-sm ${mode === 'preview' ? 'bg-primary text-white' : 'bg-surface-variant'}`}
          onClick={() => onModeChange('preview')}
        >
          <Eye className="w-4 h-4 mr-1 inline" />
          미리보기
        </button>
        
        {/* 편집 모드 버튼 (편집 가능한 파일만) */}
        {renderer.editable && (
          <button 
            className={`px-3 py-1 rounded text-sm ${mode === 'edit' ? 'bg-primary text-white' : 'bg-surface-variant'}`}
            onClick={() => onModeChange('edit')}
          >
            <Edit className="w-4 h-4 mr-1 inline" />
            편집
          </button>
        )}
        
        {/* 전체화면 버튼 */}
        <button 
          className="px-3 py-1 bg-surface-variant rounded text-sm"
          onClick={onFullscreenToggle}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 mr-1 inline" />
          ) : (
            <Maximize className="w-4 h-4 mr-1 inline" />
          )}
          {isFullscreen ? '축소' : '확대'}
        </button>
        
        {/* 다운로드 버튼 */}
        <button className="px-3 py-1 bg-surface-variant rounded text-sm">
          <Download className="w-4 h-4 mr-1 inline" />
          다운로드
        </button>
      </div>
    </div>
  );
};
```

### 전체화면 모드 스타일

```css
/* 전체화면 모드 스타일 */
.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: var(--background);
}

.fullscreen-exit-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  items-center: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.fullscreen-exit-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

/* 분할 뷰 에디터 스타일 */
.split-view-editor {
  height: calc(100vh - 200px);
}

.fullscreen-mode .split-view-editor {
  height: calc(100vh - 60px);
}

/* 미리보기 컨테이너 애니메이션 */
.preview-container {
  transition: all 0.3s ease;
}

/* 에디터 테마 커스터마이징 */
.monaco-editor {
  border-radius: 0;
}

.monaco-editor .margin {
  background-color: var(--surface-variant) !important;
}
```

### 미리보기 시스템 통합

#### 테이블에서 미리보기 호출
```tsx
// 기존 PreviewComponent 업데이트
const PreviewComponent = ({ file }: PreviewComponentProps) => {
  const [showPreview, setShowPreview] = useState(false);
  
  const getPreviewContent = () => {
    const fileType = file.file_type.toLowerCase();
    
    // 파일 타입별 아이콘 (기존 코드 유지)
    // ...
  };

  const handlePreviewClick = () => {
    setShowPreview(true);
  };

  return (
    <div className="flex items-center space-x-2">
      <button onClick={handlePreviewClick} className="hover:scale-110 transition-transform">
        {getPreviewContent()}
      </button>
      <span className="text-xs text-text-secondary">
        {file.file_type.toUpperCase()}
      </span>
      
      {/* 미리보기 모달 */}
      {showPreview && (
        <PreviewModal 
          file={file}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};
```

이 고급 미리보기 시스템으로 **VS Code 수준의 편집 기능**과 **전문적인 파일 뷰어**를 제공할 수 있습니다.

### 1. Header
```tsx
interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={`sticky top-0 z-100 bg-surface border-b border-border ${className}`}>
      <div className="w-[90vw] max-w-[1400px] mx-auto py-4 flex items-center justify-between">
        {/* 왼쪽: 로고 + 앱 제목 */}
        <div className="flex items-center space-x-3">
          <BookIcon className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold text-primary">성경자료 관리</h1>
        </div>
        
        {/* 중앙: 네비게이션 메뉴 */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink href="/" icon={<HomeIcon />}>HOME</NavLink>
          <NavLink href="/all-materials" icon={<FolderIcon />}>전체자료실</NavLink>
          <NavLink href="/bible-materials" icon={<BookOpenIcon />}>성경자료실</NavLink>
          <NavLink href="/general-materials" icon={<CheckSquareIcon />}>일반자료실</NavLink>
          <NavLink href="/data-management" icon={<BarChartIcon />}>데이터관리</NavLink>
        </nav>
        
        {/* 오른쪽: 동기화 상태 + 사용자 정보 + 다크모드 */}
        <div className="flex items-center space-x-4">
          <SyncStatusIndicator />
          <NetworkStatusDisplay />
          <UserProfile name="나 종 춘" />
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
};
```

### 2. Footer
```tsx
interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-surface-variant ${className}`}>
      <div className="w-[90vw] max-w-[1400px] mx-auto py-8 text-center space-y-2">
        {/* 1단: Sola Scriptura Biblical Research Archive */}
        <div className="text-lg font-medium text-text-primary">
          Sola Scriptura Biblical Research Archive.
        </div>
        
        {/* 2단: 년도 + Built with + 개발자 정보 */}
        <div className="text-sm text-text-secondary">
          {currentYear} Built with ❤️ by 나 종 춘 | 
          <a 
            href="mailto:najongchoon@gmail.com" 
            className="ml-1 hover:underline transition-colors"
            style={{ color: '#f5ab55' }}
          >
            najongchoon@gmail.com
          </a>
        </div>
      </div>
      
      {/* 저장 상태 표시 (우측 하단 고정) */}
      <SaveStatusIndicator className="fixed bottom-4 right-4 z-50" />
    </footer>
  );
};
```

### 3. 반응형 네비게이션 (모바일)
```tsx
const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* 햄버거 메뉴 버튼 (모바일만 표시) */}
      <button 
        className="md:hidden p-2 rounded-md hover:bg-surface-variant"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MenuIcon className="w-6 h-6" />
      </button>
      
      {/* 모바일 메뉴 오버레이 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-surface p-6 shadow-xl">
            <nav className="space-y-4">
              <MobileNavLink href="/" icon={<HomeIcon />}>HOME</MobileNavLink>
              <MobileNavLink href="/all-materials" icon={<FolderIcon />}>전체자료실</MobileNavLink>
              <MobileNavLink href="/bible-materials" icon={<BookOpenIcon />}>성경자료실</MobileNavLink>
              <MobileNavLink href="/general-materials" icon={<CheckSquareIcon />}>일반자료실</MobileNavLink>
              <MobileNavLink href="/data-management" icon={<BarChartIcon />}>데이터관리</MobileNavLink>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
```

### 3. 페이지 타이틀 섹션
```tsx
interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  syncStatus?: 'synced' | 'syncing' | 'offline' | 'error';
  showSyncButton?: boolean;
}
```

### 4. 통계 카드
```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'orange' | 'green';
  syncStatus?: 'synced' | 'pending' | 'error';
  localValue?: string | number; // 로컬 저장 수치
  serverValue?: string | number; // 서버 저장 수치
}
```

### 5. 하이브리드 파일 업로드 컴포넌트
```tsx
interface HybridUploadProps {
  onLocalSave: (file: File) => Promise<string>; // local_id 반환
  onServerSync: (localId: string) => Promise<void>;
  maxFileSize?: number;
  allowedTypes?: string[];
  enableChunking?: boolean;
  chunkSize?: number;
}
```

### 6. 동기화 상태 표시 컴포넌트
```tsx
interface SyncStatusProps {
  status: 'synced' | 'pending' | 'syncing' | 'error' | 'conflict';
  lastSync?: Date;
  pendingCount?: number;
  onManualSync?: () => void;
  onResolveConflict?: () => void;
}
```

### 7. 통합 데이터 테이블 컴포넌트
```tsx
interface TableColumn {
  header: string;
  accessor: string;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface UnifiedTableProps {
  columns: TableColumn[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  showSyncStatus?: boolean;
}

const UnifiedTable = ({ columns, data, onEdit, onDelete, showSyncStatus = true }: UnifiedTableProps) => {
  // 기본 컬럼 정의 (모든 자료실에서 공통 사용)
  const defaultColumns: TableColumn[] = [
    { 
      header: '제목', 
      accessor: 'title', 
      width: '30%',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          {showSyncStatus && (
            <SyncStatusBadge status={row.sync_status} />
          )}
        </div>
      )
    },
    { 
      header: '구분', 
      accessor: 'category', 
      width: '15%',
      render: (value, row) => (
        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
          {row.category_type === 'bible' ? row.bible_book : value}
        </span>
      )
    },
    { 
      header: '미리보기', 
      accessor: 'preview', 
      width: '20%',
      render: (value, row) => <PreviewComponent file={row} />
    },
    { 
      header: '파일명', 
      accessor: 'file_name', 
      width: '25%',
      render: (value) => (
        <span className="text-sm text-text-secondary truncate">{value}</span>
      )
    },
    { 
      header: '관리', 
      accessor: 'actions', 
      width: '10%',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <button 
            className="p-1 hover:bg-surface-variant rounded transition-colors"
            onClick={() => onEdit?.(row)}
          >
            <Edit className="w-4 h-4 text-text-secondary hover:text-primary" />
          </button>
          <button 
            className="p-1 hover:bg-surface-variant rounded transition-colors"
            onClick={() => onDelete?.(row)}
          >
            <Trash2 className="w-4 h-4 text-text-secondary hover:text-error" />
          </button>
        </div>
      )
    }
  ];

  const tableColumns = columns.length > 0 ? columns : defaultColumns;

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-surface-variant">
          <tr>
            {tableColumns.map((column, index) => (
              <th 
                key={index}
                className="text-left p-3 font-medium"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index} className="border-t hover:bg-surface-variant transition-colors">
              {tableColumns.map((column, colIndex) => (
                <td key={colIndex} className="p-3">
                  {column.render 
                    ? column.render(row[column.accessor], row)
                    : row[column.accessor]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="p-8 text-center text-text-secondary">
          등록된 자료가 없습니다.
        </div>
      )}
    </div>
  );
};
```

### 8. 성경 책별 그리드 컴포넌트
```tsx
interface BibleBook {
  name: string;
  chapter_count: number;
  local_materials: number;
  server_materials: number;
  sync_status: 'synced' | 'pending' | 'conflict';
}

interface BibleBooksGridProps {
  books: BibleBook[];
  onBookClick: (bookName: string) => void;
}

const BibleBooksGrid = ({ books, onBookClick }: BibleBooksGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {books.map((book) => (
        <div
          key={book.name}
          className="bible-book-card relative overflow-hidden"
          onClick={() => onBookClick(book.name)}
        >
          <div className="book-title text-sm font-medium mb-2 transition-all duration-300">
            {book.name}
          </div>
          
          <div className="book-stats text-xs text-text-secondary space-y-1 transition-all duration-300">
            <div>총 {book.chapter_count}장</div>
            <div>자료: {book.local_materials + book.server_materials}개</div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>로컬: {book.local_materials}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>서버: {book.server_materials}</span>
            </div>
          </div>
          
          {/* 동기화 상태 표시 */}
          <div className="absolute top-2 right-2">
            <SyncStatusDot status={book.sync_status} />
          </div>
        </div>
      ))}
    </div>
  );
};

// 동기화 상태 점 표시
const SyncStatusDot = ({ status }: { status: string }) => {
  const colors = {
    synced: 'bg-green-500',
    pending: 'bg-yellow-500',
    conflict: 'bg-red-500'
  };
  
  return (
    <div className={`w-3 h-3 rounded-full ${colors[status]} opacity-80`} />
  );
};
```

### 9. 미리보기 컴포넌트
```tsx
interface PreviewComponentProps {
  file: {
    file_type: string;
    file_name: string;
    file_url?: string;
    thumbnail?: string;
  };
}

const PreviewComponent = ({ file }: PreviewComponentProps) => {
  const getPreviewContent = () => {
    const fileType = file.file_type.toLowerCase();
    
    if (fileType.includes('image')) {
      return (
        <img 
          src={file.thumbnail || file.file_url} 
          alt={file.file_name}
          className="w-12 h-12 object-cover rounded border"
        />
      );
    }
    
    if (fileType.includes('pdf')) {
      return (
        <div className="w-12 h-12 bg-red-100 rounded border flex items-center justify-center">
          <FileText className="w-6 h-6 text-red-600" />
        </div>
      );
    }
    
    if (fileType.includes('audio')) {
      return (
        <div className="w-12 h-12 bg-purple-100 rounded border flex items-center justify-center">
          <Volume2 className="w-6 h-6 text-purple-600" />
        </div>
      );
    }
    
    if (fileType.includes('video')) {
      return (
        <div className="w-12 h-12 bg-blue-100 rounded border flex items-center justify-center">
          <Play className="w-6 h-6 text-blue-600" />
        </div>
      );
    }
    
    return (
      <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
        <File className="w-6 h-6 text-gray-600" />
      </div>
    );
  };

  return (
    <div className="flex items-center space-x-2">
      {getPreviewContent()}
      <span className="text-xs text-text-secondary">
        {file.file_type.toUpperCase()}
      </span>
    </div>
  );
};
```

### 10. 동기화 상태 배지 컴포넌트
```tsx
interface SyncStatusBadgeProps {
  status: 'synced' | 'pending' | 'syncing' | 'conflict' | 'error';
  size?: 'sm' | 'md';
}

const SyncStatusBadge = ({ status, size = 'sm' }: SyncStatusBadgeProps) => {
  const configs = {
    synced: { 
      color: 'bg-green-100 text-green-800', 
      icon: <Check className="w-3 h-3" />, 
      text: '동기화됨' 
    },
    pending: { 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: <Clock className="w-3 h-3" />, 
      text: '대기중' 
    },
    syncing: { 
      color: 'bg-blue-100 text-blue-800', 
      icon: <RefreshCw className="w-3 h-3 animate-spin" />, 
      text: '동기화중' 
    },
    conflict: { 
      color: 'bg-red-100 text-red-800', 
      icon: <AlertTriangle className="w-3 h-3" />, 
      text: '충돌' 
    },
    error: { 
      color: 'bg-gray-100 text-gray-800', 
      icon: <X className="w-3 h-3" />, 
      text: '에러' 
    }
  };

  const config = configs[status];
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full ${config.color} ${sizeClass}`}>
      {config.icon}
      <span>{config.text}</span>
    </span>
  );
};
```

## 상태 관리 (Zustand) - 하이브리드 저장 통합

### 스토어 구조
```typescript
interface AppState {
  // UI 상태
  isDarkMode: boolean;
  sidebarCollapsed: boolean;
  
  // 사용자 상태
  user: User | null;
  
  // 하이브리드 저장 상태
  networkStatus: 'online' | 'offline';
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime: Date | null;
  pendingSyncCount: number;
  
  // 자료 상태 (하이브리드)
  materials: MaterialRecord[]; // 로컬 + 서버 통합 데이터
  localMaterials: MaterialRecord[]; // 로컬 전용 데이터
  filteredMaterials: MaterialRecord[];
  searchQuery: string;
  selectedCategory: string;
  syncFilter: 'all' | 'synced' | 'pending' | 'conflict' | 'error';
  
  // 업로드 상태 (하이브리드)
  uploadProgress: Map<string, UploadProgress>; // 파일별 진행률
  uploadingFiles: File[];
  localSaveProgress: Map<string, number>; // 로컬 저장 진행률
  serverSyncProgress: Map<string, number>; // 서버 동기화 진행률
  
  // 동기화 관련 상태
  syncQueue: SyncOperation[];
  conflicts: ConflictData[];
  syncErrors: SyncError[];
  
  // 저장소 상태
  localStorageUsage: number;
  serverStorageUsage: number;
  
  // 액션들
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setSyncFilter: (filter: string) => void;
  filterMaterials: () => void;
  
  // 하이브리드 저장 액션들
  saveToLocal: (data: MaterialData) => Promise<string>;
  syncToServer: (localId: string) => Promise<void>;
  uploadFiles: (files: File[]) => Promise<void>;
  forceSyncAll: () => Promise<void>;
  resolveConflict: (conflictId: string, resolution: ConflictResolution) => Promise<void>;
  
  // 네트워크 상태 액션들
  setNetworkStatus: (status: 'online' | 'offline') => void;
  updateSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  
  // 알림 액션들
  addNotification: (notification: NotificationData) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// 하이브리드 저장 관련 타입들
interface MaterialRecord {
  local_id: string;
  server_id?: string;
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
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  sync_status: 'synced' | 'pending' | 'syncing' | 'conflict' | 'error';
  sync_version: number;
  last_sync?: Date;
  is_deleted: boolean;
  storage_location: 'local' | 'server' | 'both';
}

interface UploadProgress {
  localSave: number; // 0-100
  serverSync: number; // 0-100
  status: 'saving_local' | 'local_saved' | 'syncing_server' | 'completed' | 'error';
  error?: string;
}

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity_type: 'material' | 'category';
  local_id: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count: number;
  created_at: Date;
  error?: string;
}

interface ConflictData {
  id: string;
  local_data: MaterialRecord;
  server_data: MaterialRecord;
  conflict_fields: string[];
  created_at: Date;
}
```

## 반응형 디자인

### 브레이크포인트
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### 컨테이너 너비 전략
- **모든 디바이스**: `width: 90vw` (화면 너비의 90% 사용)
- **최대 너비**: `max-width: 1400px` (대형 화면에서 과도한 확장 방지)
- **중앙 정렬**: `margin: 0 auto`

### 반응형 행동

#### Mobile (< 768px)
- **Header**: 
  - 로고 + 햄버거 메뉴 + 필수 상태 표시
  - 네비게이션 메뉴는 오버레이 형태로 표시
- **Main Content**: 
  - 90vw 너비 유지
  - 패딩 축소 (`padding: 1rem 0.5rem`)
- **Footer**: 
  - 텍스트 크기 조정
  - 이메일 링크 줄바꿈 적용

#### Tablet (768px - 1024px)
- **Header**: 
  - 축약된 네비게이션 메뉴 표시
  - 동기화 상태 간소화 표시
- **Main Content**: 
  - 90vw 너비 유지
  - 표준 패딩 (`padding: 1.5rem 1rem`)

#### Desktop (> 1024px)
- **Header**: 
  - 전체 네비게이션 메뉴 표시
  - 완전한 동기화 상태 대시보드
- **Main Content**: 
  - 90vw 너비 유지 (최대 1400px)
  - 충분한 패딩 (`padding: 2rem 1rem`)

### 하이브리드 저장 관련 반응형 요소
- **동기화 상태 표시**: 화면 크기에 따른 정보 표시 수준 조절
- **업로드 진행률**: 모바일에서는 간소화된 표시
- **알림 시스템**: 화면 크기에 따른 알림 위치 및 크기 조절
- **저장 상태 표시**: 모바일에서는 아이콘만, 데스크톱에서는 상세 정보

### 반응형 CSS 구현
```css
/* 기본 컨테이너 */
.main-content {
  width: 90vw;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 태블릿 */
@media (max-width: 1024px) {
  .main-content {
    padding: 1.5rem 1rem;
  }
  
  .header nav {
    display: none; /* 햄버거 메뉴로 대체 */
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0.5rem;
  }
  
  .footer {
    padding: 1.5rem 5vw;
    font-size: 0.875rem;
  }
  
  .footer a {
    display: block;
    margin-top: 0.5rem;
  }
}
```

## 접근성 (Accessibility)

### 요구사항
- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 지원
- 적절한 색상 대비
- Focus 표시
- **새로운 추가**: 
  - 동기화 상태에 대한 음성 안내
  - 오프라인 모드 스크린 리더 알림
  - 충돌 해결 프로세스 키보드 지원

## 성능 최적화

### 기존 최적화 전략
- Next.js App Router 활용
- 이미지 최적화 (next/image)
- 코드 스플리팅
- 메모이제이션 (React.memo, useMemo)
- 가상화된 리스트 (긴 목록용)

### 하이브리드 저장 최적화 전략

#### 1. 파일 청킹 시스템
```typescript
// 대용량 파일 청킹 처리
const CHUNK_SIZE = 1024 * 1024; // 1MB 청크
const MAX_CONCURRENT_CHUNKS = 3; // 동시 업로드 청크 수

class FileChunkManager {
  async saveFileInChunks(file: File): Promise<string> {
    const chunks = Math.ceil(file.size / CHUNK_SIZE);
    const localId = generateUUID();
    
    // 병렬 청킹 처리
    const chunkPromises = [];
    for (let i = 0; i < chunks; i += MAX_CONCURRENT_CHUNKS) {
      const batchEnd = Math.min(i + MAX_CONCURRENT_CHUNKS, chunks);
      const batchPromises = [];
      
      for (let j = i; j < batchEnd; j++) {
        batchPromises.push(this.processChunk(file, j, localId));
      }
      
      chunkPromises.push(Promise.all(batchPromises));
    }
    
    await Promise.all(chunkPromises);
    return localId;
  }
}
```

#### 2. 지능적 동기화 스케줄링
```typescript
class IntelligentSyncScheduler {
  private syncPriorities = {
    immediate: ['create', 'delete'], // 즉시 동기화
    frequent: ['update'], // 빈번한 동기화
    background: ['metadata_update'] // 백그라운드 동기화
  };

  async scheduleSync(operation: SyncOperation): Promise<void> {
    const priority = this.calculatePriority(operation);
    const delay = this.getSyncDelay(priority);
    
    if (delay === 0) {
      await this.executeSync(operation);
    } else {
      this.scheduleDelayedSync(operation, delay);
    }
  }
  
  private calculatePriority(operation: SyncOperation): 'immediate' | 'frequent' | 'background' {
    const userActivity = this.userActivityMonitor.getRecentActivity();
    const networkQuality = this.networkMonitor.getConnectionQuality();
    const operationType = operation.type;
    
    if (this.syncPriorities.immediate.includes(operationType)) return 'immediate';
    if (userActivity === 'active' && networkQuality === 'good') return 'frequent';
    return 'background';
  }
}
```

#### 3. 메모리 효율적 저장
```typescript
// IndexedDB 최적화
class OptimizedIndexedDB {
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  private cacheUsage = 0;

  async saveWithLRU(key: string, data: any): Promise<void> {
    const dataSize = this.calculateSize(data);
    
    // LRU 캐시 정리
    if (this.cacheUsage + dataSize > this.MAX_CACHE_SIZE) {
      await this.evictLRUItems(dataSize);
    }
    
    await this.saveToIndexedDB(key, data);
    this.cacheUsage += dataSize;
  }
  
  private async evictLRUItems(requiredSpace: number): Promise<void> {
    const items = await this.getAllItemsSortedByAccess();
    let freedSpace = 0;
    
    for (const item of items) {
      if (freedSpace >= requiredSpace) break;
      
      await this.deleteItem(item.key);
      freedSpace += item.size;
      this.cacheUsage -= item.size;
    }
  }
}
```

#### 4. 네트워크 최적화
```typescript
// 연결 품질 기반 동기화 조절
class AdaptiveSyncManager {
  private connectionQuality: 'poor' | 'fair' | 'good' | 'excellent' = 'good';

  async adaptSyncBehavior(): Promise<void> {
    const quality = await this.assessConnectionQuality();
    
    switch (quality) {
      case 'poor':
        this.setSyncSettings({
          batchSize: 1,
          retryDelay: 30000,
          enableCompression: true
        });
        break;
      case 'fair':
        this.setSyncSettings({
          batchSize: 3,
          retryDelay: 15000,
          enableCompression: true
        });
        break;
      case 'good':
        this.setSyncSettings({
          batchSize: 5,
          retryDelay: 5000,
          enableCompression: false
        });
        break;
      case 'excellent':
        this.setSyncSettings({
          batchSize: 10,
          retryDelay: 1000,
          enableCompression: false
        });
        break;
    }
  }
}
```

## 폴더 구조 (하이브리드 저장 통합)
```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx                 # 홈페이지 (블랭크 페이지)
│   │   ├── all-materials/
│   │   ├── bible-materials/
│   │   ├── general-materials/
│   │   └── data-management/
│   │       ├── sync-management/     # 동기화 관리
│   │       ├── storage-management/  # 저장소 관리
│   │       ├── backup-restore/      # 백업/복원
│   │       └── file-upload/         # 파일 업로드 (통합)
│   ├── globals.css
│   ├── layout.tsx
│   └── loading.tsx
├── components/
│   ├── ui/                          # 기본 UI 컴포넌트
│   ├── layout/                      # 레이아웃 컴포넌트
│   │   ├── Header.tsx               # 상단 헤더 (로고+메뉴+동기화상태)
│   │   ├── Footer.tsx               # 하단 푸터 (회사정보+개발자정보)
│   │   ├── MobileNavigation.tsx     # 모바일 네비게이션
│   │   └── MainContainer.tsx        # 90vw 메인 컨테이너
│   ├── materials/                   # 자료 관련 컴포넌트
│   ├── preview/                     # 고급 미리보기 시스템
│   │   ├── UnifiedPreview.tsx       # 통합 미리보기 컴포넌트
│   │   ├── SplitViewEditor.tsx      # 분할 뷰 에디터 (좌:소스, 우:미리보기)
│   │   ├── PreviewHeader.tsx        # 미리보기 헤더 (모드 전환, 전체화면)
│   │   ├── PreviewModal.tsx         # 미리보기 모달 창
│   │   ├── renderers/               # 파일 타입별 렌더러
│   │   │   ├── HTMLRenderer.tsx     # HTML 렌더러 (iframe + sanitization)
│   │   │   ├── MarkdownRenderer.tsx # Markdown 렌더러 (unified + remark)
│   │   │   ├── CSVRenderer.tsx      # CSV 렌더러 (Papa Parse + 테이블)
│   │   │   ├── TextRenderer.tsx     # 텍스트 렌더러
│   │   │   ├── PDFRenderer.tsx      # PDF 렌더러 (PDF.js)
│   │   │   ├── ImageRenderer.tsx    # 이미지 렌더러 (줌, 패닝)
│   │   │   ├── AudioRenderer.tsx    # 오디오 렌더러
│   │   │   ├── VideoRenderer.tsx    # 비디오 렌더러
│   │   │   └── UnsupportedFileType.tsx # 지원하지 않는 파일 타입
│   │   ├── editor/                  # 편집기 관련
│   │   │   ├── MonacoEditor.tsx     # Monaco Editor 래퍼
│   │   │   ├── LivePreview.tsx      # 실시간 미리보기
│   │   │   └── EditorSettings.tsx   # 에디터 설정
│   │   └── fullscreen/              # 전체화면 모드
│   │       ├── FullscreenProvider.tsx
│   │       └── FullscreenControls.tsx
│   ├── upload/                      # 업로드 컴포넌트 (데이터관리로 통합)
│   │   ├── HybridUploadZone.tsx
│   │   ├── UploadProgress.tsx
│   │   └── FileManager.tsx
│   ├── sync/                        # 동기화 관련 컴포넌트
│   │   ├── SyncStatusDisplay.tsx
│   │   ├── ConflictResolver.tsx
│   │   ├── SyncQueue.tsx
│   │   └── NetworkStatus.tsx
│   └── notifications/               # 알림 시스템
│       ├── NotificationCenter.tsx
│       ├── SyncNotifications.tsx
│       └── ToastManager.tsx
├── stores/                          # Zustand 스토어
│   ├── app-store.ts                 # 메인 앱 상태
│   ├── sync-store.ts                # 동기화 상태
│   ├── upload-store.ts              # 업로드 상태
│   └── notification-store.ts        # 알림 상태
├── services/                        # 하이브리드 저장 서비스
│   ├── storage/
│   │   ├── HybridStorageService.ts  # 메인 저장 서비스
│   │   ├── OfflineStorageService.ts # IndexedDB 관리
│   │   ├── OnlineStorageService.ts  # Supabase 관리
│   │   └── FileChunkService.ts      # 파일 청킹
│   ├── sync/
│   │   ├── SyncEngine.ts            # 동기화 엔진
│   │   ├── ConflictResolver.ts      # 충돌 해결
│   │   ├── NetworkMonitor.ts        # 네트워크 모니터링
│   │   └── SyncScheduler.ts         # 동기화 스케줄러
│   ├── security/
│   │   ├── EncryptionService.ts     # 암호화
│   │   └── DataIntegrityService.ts  # 데이터 무결성
│   └── notifications/
│       └── NotificationService.ts   # 알림 서비스
├── hooks/                           # 커스텀 훅
│   ├── useHybridStorage.ts
│   ├── useSyncStatus.ts
│   ├── useNetworkStatus.ts
│   ├── useAutoSave.ts
│   ├── useResponsiveLayout.ts       # 90vw 반응형 레이아웃
│   ├── useConflictResolver.ts
│   ├── useFilePreview.ts            # 파일 미리보기 훅
│   ├── useFullscreen.ts             # 전체화면 모드 훅
│   ├── useCodeEditor.ts             # Monaco Editor 훅
│   └── useFileRenderer.ts           # 파일 렌더러 선택 훅
├── types/                           # TypeScript 타입 정의
│   ├── storage.types.ts             # 저장 관련 타입
│   ├── sync.types.ts                # 동기화 관련 타입
│   ├── layout.types.ts              # 레이아웃 관련 타입
│   └── material.types.ts            # 자료 관련 타입
├── utils/                           # 유틸리티 함수
│   ├── storage-utils.ts
│   ├── sync-utils.ts
│   ├── encryption-utils.ts
│   ├── layout-utils.ts              # 90vw 레이아웃 유틸
│   ├── checksum-utils.ts
│   ├── file-utils.ts                # 파일 타입 감지, 확장자 처리
│   ├── preview-utils.ts             # 미리보기 관련 유틸리티
│   ├── editor-utils.ts              # 에디터 설정 및 언어 감지
│   └── sanitize-utils.ts            # HTML sanitization
└── constants/                       # 상수 정의
    ├── storage-constants.ts
    ├── sync-constants.ts
    ├── layout-constants.ts          # 레이아웃 관련 상수
    ├── bible-books.ts               # 성경 66권 데이터
    ├── file-types.ts                # 지원 파일 타입 정의
    ├── editor-languages.ts          # Monaco Editor 언어 매핑
    └── app-constants.ts

### 성경 책 데이터 구조 예시
```typescript
// constants/bible-books.ts
export interface BibleBook {
  id: string;
  name: string;
  english_name: string;
  testament: 'old' | 'new';
  order: number;
  chapter_count: number;
  category: string;
}

export const OLD_TESTAMENT_BOOKS: BibleBook[] = [
  // 모세오경 (Torah)
  { id: 'gen', name: '창세기', english_name: 'Genesis', testament: 'old', order: 1, chapter_count: 50, category: '모세오경' },
  { id: 'exo', name: '출애굽기', english_name: 'Exodus', testament: 'old', order: 2, chapter_count: 40, category: '모세오경' },
  { id: 'lev', name: '레위기', english_name: 'Leviticus', testament: 'old', order: 3, chapter_count: 27, category: '모세오경' },
  { id: 'num', name: '민수기', english_name: 'Numbers', testament: 'old', order: 4, chapter_count: 36, category: '모세오경' },
  { id: 'deu', name: '신명기', english_name: 'Deuteronomy', testament: 'old', order: 5, chapter_count: 34, category: '모세오경' },
  
  // 역사서 (Historical Books)
  { id: 'jos', name: '여호수아', english_name: 'Joshua', testament: 'old', order: 6, chapter_count: 24, category: '역사서' },
  { id: 'jdg', name: '사사기', english_name: 'Judges', testament: 'old', order: 7, chapter_count: 21, category: '역사서' },
  { id: 'rut', name: '룻기', english_name: 'Ruth', testament: 'old', order: 8, chapter_count: 4, category: '역사서' },
  { id: '1sa', name: '사무엘상', english_name: '1 Samuel', testament: 'old', order: 9, chapter_count: 31, category: '역사서' },
  { id: '2sa', name: '사무엘하', english_name: '2 Samuel', testament: 'old', order: 10, chapter_count: 24, category: '역사서' },
  { id: '1ki', name: '열왕기상', english_name: '1 Kings', testament: 'old', order: 11, chapter_count: 22, category: '역사서' },
  { id: '2ki', name: '열왕기하', english_name: '2 Kings', testament: 'old', order: 12, chapter_count: 25, category: '역사서' },
  { id: '1ch', name: '역대상', english_name: '1 Chronicles', testament: 'old', order: 13, chapter_count: 29, category: '역사서' },
  { id: '2ch', name: '역대하', english_name: '2 Chronicles', testament: 'old', order: 14, chapter_count: 36, category: '역사서' },
  { id: 'ezr', name: '에스라', english_name: 'Ezra', testament: 'old', order: 15, chapter_count: 10, category: '역사서' },
  { id: 'neh', name: '느헤미야', english_name: 'Nehemiah', testament: 'old', order: 16, chapter_count: 13, category: '역사서' },
  { id: 'est', name: '에스더', english_name: 'Esther', testament: 'old', order: 17, chapter_count: 10, category: '역사서' },
  
  // 시가서 (Wisdom Books)
  { id: 'job', name: '욥기', english_name: 'Job', testament: 'old', order: 18, chapter_count: 42, category: '시가서' },
  { id: 'psa', name: '시편', english_name: 'Psalms', testament: 'old', order: 19, chapter_count: 150, category: '시가서' },
  { id: 'pro', name: '잠언', english_name: 'Proverbs', testament: 'old', order: 20, chapter_count: 31, category: '시가서' },
  { id: 'ecc', name: '전도서', english_name: 'Ecclesiastes', testament: 'old', order: 21, chapter_count: 12, category: '시가서' },
  { id: 'sng', name: '아가', english_name: 'Song of Songs', testament: 'old', order: 22, chapter_count: 8, category: '시가서' },
  
  // 대예언서 (Major Prophets)
  { id: 'isa', name: '이사야', english_name: 'Isaiah', testament: 'old', order: 23, chapter_count: 66, category: '대예언서' },
  { id: 'jer', name: '예레미야', english_name: 'Jeremiah', testament: 'old', order: 24, chapter_count: 52, category: '대예언서' },
  { id: 'lam', name: '예레미야애가', english_name: 'Lamentations', testament: 'old', order: 25, chapter_count: 5, category: '대예언서' },
  { id: 'ezk', name: '에스겔', english_name: 'Ezekiel', testament: 'old', order: 26, chapter_count: 48, category: '대예언서' },
  { id: 'dan', name: '다니엘', english_name: 'Daniel', testament: 'old', order: 27, chapter_count: 12, category: '대예언서' },
  
  // 소예언서 (Minor Prophets)
  { id: 'hos', name: '호세아', english_name: 'Hosea', testament: 'old', order: 28, chapter_count: 14, category: '소예언서' },
  { id: 'jol', name: '요엘', english_name: 'Joel', testament: 'old', order: 29, chapter_count: 3, category: '소예언서' },
  { id: 'amo', name: '아모스', english_name: 'Amos', testament: 'old', order: 30, chapter_count: 9, category: '소예언서' },
  { id: 'oba', name: '오바댜', english_name: 'Obadiah', testament: 'old', order: 31, chapter_count: 1, category: '소예언서' },
  { id: 'jon', name: '요나', english_name: 'Jonah', testament: 'old', order: 32, chapter_count: 4, category: '소예언서' },
  { id: 'mic', name: '미가', english_name: 'Micah', testament: 'old', order: 33, chapter_count: 7, category: '소예언서' },
  { id: 'nam', name: '나훔', english_name: 'Nahum', testament: 'old', order: 34, chapter_count: 3, category: '소예언서' },
  { id: 'hab', name: '하박국', english_name: 'Habakkuk', testament: 'old', order: 35, chapter_count: 3, category: '소예언서' },
  { id: 'zep', name: '스바냐', english_name: 'Zephaniah', testament: 'old', order: 36, chapter_count: 3, category: '소예언서' },
  { id: 'hag', name: '학개', english_name: 'Haggai', testament: 'old', order: 37, chapter_count: 2, category: '소예언서' },
  { id: 'zec', name: '스가랴', english_name: 'Zechariah', testament: 'old', order: 38, chapter_count: 14, category: '소예언서' },
  { id: 'mal', name: '말라기', english_name: 'Malachi', testament: 'old', order: 39, chapter_count: 4, category: '소예언서' }
];

export const NEW_TESTAMENT_BOOKS: BibleBook[] = [
  // 복음서 (Gospels)
  { id: 'mat', name: '마태복음', english_name: 'Matthew', testament: 'new', order: 40, chapter_count: 28, category: '복음서' },
  { id: 'mrk', name: '마가복음', english_name: 'Mark', testament: 'new', order: 41, chapter_count: 16, category: '복음서' },
  { id: 'luk', name: '누가복음', english_name: 'Luke', testament: 'new', order: 42, chapter_count: 24, category: '복음서' },
  { id: 'jhn', name: '요한복음', english_name: 'John', testament: 'new', order: 43, chapter_count: 21, category: '복음서' },
  
  // 역사서 (Acts)
  { id: 'act', name: '사도행전', english_name: 'Acts', testament: 'new', order: 44, chapter_count: 28, category: '역사서' },
  
  // 바울서신 (Pauline Epistles)
  { id: 'rom', name: '로마서', english_name: 'Romans', testament: 'new', order: 45, chapter_count: 16, category: '바울서신' },
  { id: '1co', name: '고린도전서', english_name: '1 Corinthians', testament: 'new', order: 46, chapter_count: 16, category: '바울서신' },
  { id: '2co', name: '고린도후서', english_name: '2 Corinthians', testament: 'new', order: 47, chapter_count: 13, category: '바울서신' },
  { id: 'gal', name: '갈라디아서', english_name: 'Galatians', testament: 'new', order: 48, chapter_count: 6, category: '바울서신' },
  { id: 'eph', name: '에베소서', english_name: 'Ephesians', testament: 'new', order: 49, chapter_count: 6, category: '바울서신' },
  { id: 'php', name: '빌립보서', english_name: 'Philippians', testament: 'new', order: 50, chapter_count: 4, category: '바울서신' },
  { id: 'col', name: '골로새서', english_name: 'Colossians', testament: 'new', order: 51, chapter_count: 4, category: '바울서신' },
  { id: '1th', name: '데살로니가전서', english_name: '1 Thessalonians', testament: 'new', order: 52, chapter_count: 5, category: '바울서신' },
  { id: '2th', name: '데살로니가후서', english_name: '2 Thessalonians', testament: 'new', order: 53, chapter_count: 3, category: '바울서신' },
  { id: '1ti', name: '디모데전서', english_name: '1 Timothy', testament: 'new', order: 54, chapter_count: 6, category: '바울서신' },
  { id: '2ti', name: '디모데후서', english_name: '2 Timothy', testament: 'new', order: 55, chapter_count: 4, category: '바울서신' },
  { id: 'tit', name: '디도서', english_name: 'Titus', testament: 'new', order: 56, chapter_count: 3, category: '바울서신' },
  { id: 'phm', name: '빌레몬서', english_name: 'Philemon', testament: 'new', order: 57, chapter_count: 1, category: '바울서신' },
  
  // 일반서신 (General Epistles)
  { id: 'heb', name: '히브리서', english_name: 'Hebrews', testament: 'new', order: 58, chapter_count: 13, category: '일반서신' },
  { id: 'jas', name: '야고보서', english_name: 'James', testament: 'new', order: 59, chapter_count: 5, category: '일반서신' },
  { id: '1pe', name: '베드로전서', english_name: '1 Peter', testament: 'new', order: 60, chapter_count: 5, category: '일반서신' },
  { id: '2pe', name: '베드로후서', english_name: '2 Peter', testament: 'new', order: 61, chapter_count: 3, category: '일반서신' },
  { id: '1jn', name: '요한일서', english_name: '1 John', testament: 'new', order: 62, chapter_count: 5, category: '일반서신' },
  { id: '2jn', name: '요한이서', english_name: '2 John', testament: 'new', order: 63, chapter_count: 1, category: '일반서신' },
  { id: '3jn', name: '요한삼서', english_name: '3 John', testament: 'new', order: 64, chapter_count: 1, category: '일반서신' },
  { id: 'jud', name: '유다서', english_name: 'Jude', testament: 'new', order: 65, chapter_count: 1, category: '일반서신' },
  
  // 예언서 (Prophecy)
  { id: 'rev', name: '요한계시록', english_name: 'Revelation', testament: 'new', order: 66, chapter_count: 22, category: '예언서' }
];

export const ALL_BIBLE_BOOKS = [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS];

// 헬퍼 함수들
export const getBibleBookById = (id: string): BibleBook | undefined => 
  ALL_BIBLE_BOOKS.find(book => book.id === id);

export const getBibleBooksByTestament = (testament: 'old' | 'new'): BibleBook[] =>
  ALL_BIBLE_BOOKS.filter(book => book.testament === testament);

export const getBibleBooksByCategory = (category: string): BibleBook[] =>
  ALL_BIBLE_BOOKS.filter(book => book.category === category);
```
```

## 보안 및 데이터 무결성

### 기존 보안 요구사항
- 파일 업로드 검증
- XSS 방지
- CSRF 토큰

### 하이브리드 저장 보안 강화

#### 1. 클라이언트 사이드 암호화
```typescript
class ClientSideEncryption {
  private encryptionKey: CryptoKey;

  async encryptBeforeStorage(data: any): Promise<EncryptedData> {
    const plaintext = JSON.stringify(data);
    const encodedText = new TextEncoder().encode(plaintext);
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      this.encryptionKey,
      encodedText
    );

    return {
      data: Array.from(new Uint8Array(encryptedData)),
      iv: Array.from(iv),
      timestamp: Date.now()
    };
  }
}
```

#### 2. 데이터 무결성 검증
```typescript
class DataIntegrityVerifier {
  async createDataChecksum(data: any): Promise<string> {
    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async verifyDataIntegrity(data: any, expectedChecksum: string): Promise<boolean> {
    const actualChecksum = await this.createDataChecksum(data);
    return actualChecksum === expectedChecksum;
  }
}
```

#### 3. 안전한 동기화 프로토콜
```typescript
class SecureSyncProtocol {
  async secureSyncData(operation: SyncOperation): Promise<SecureSyncResult> {
    // 1. 데이터 체크섬 생성
    const checksum = await this.integrityVerifier.createDataChecksum(operation.data);
    
    // 2. 타임스탬프 기반 리플레이 공격 방지
    const timestamp = Date.now();
    const nonce = crypto.getRandomValues(new Uint8Array(16));
    
    // 3. 서명 생성
    const signature = await this.createOperationSignature(operation, checksum, timestamp, nonce);
    
    // 4. 서버로 안전한 전송
    return await this.sendSecureOperation({
      operation,
      checksum,
      timestamp,
      nonce,
      signature
    });
  }
}
```

## 구현 우선순위 (하이브리드 저장 통합)

### Phase 1 (MVP) - 기본 하이브리드 저장
1. **Header + Footer 레이아웃 구현**
   - 90vw 컨테이너 시스템
   - 반응형 네비게이션 메뉴
   - 현재 년도 표시 로직
   - 이메일 링크 (#f5ab55 컬러)
2. **홈페이지 블랭크 페이지** 구현
3. **다크모드 테마 시스템**
4. **오프라인 저장 시스템** (IndexedDB + LocalStorage)
5. **온라인 저장 시스템** (Supabase 연동)
6. **기본 동기화 로직** (단방향)
7. **기본 자료실 페이지들** (로컬 데이터 표시)

### Phase 2 - 고급 동기화 및 충돌 해결
1. **양방향 동기화 시스템**
2. **충돌 감지 및 해결 메커니즘**
3. **기본 미리보기 시스템** (파일 타입별 렌더러)
4. **네트워크 상태 모니터링**
5. **자동 재시도 시스템** (지수 백오프)
6. **실시간 알림 시스템**
7. **데이터관리 내 파일 업로드** (드래그 앤 드롭)
8. **동기화 상태 UI 컴포넌트들**

### Phase 3 - 고급 편집기 및 최적화
1. **Monaco Editor 통합** (VS Code 기반 편집기)
2. **분할 뷰 에디터** (좌:소스편집 | 우:실시간미리보기)
3. **파일 타입별 고급 렌더러**:
   - HTML: iframe + sanitization
   - Markdown: unified + remark + rehype
   - CSV: Papa Parse + 인터랙티브 테이블
   - PDF: PDF.js 통합
   - 이미지: 줌, 패닝 기능
   - 미디어: HTML5 플레이어
4. **전체화면 모드** (Fullscreen API)
5. **실시간 자동 저장** (5초 간격)
6. **파일 청킹 시스템** (대용량 파일 지원)
7. **지능적 동기화 스케줄링**
3. **데이터 압축 및 최적화**
4. **백그라운드 동기화**
5. **성능 모니터링 및 분석**
6. **사용자 권한 시스템**
7. **고급 검색 기능** (동기화 상태 포함)

### Phase 4 - 보안 및 엔터프라이즈
1. **고급 편집기 기능 완성**:
   - 코드 하이라이팅 (Prism.js/highlight.js)
   - 코드 폴딩 및 인덴트 가이드
   - 다중 커서 및 고급 편집 기능
   - 테마 시스템 (다크/라이트 모드)
2. **클라이언트 사이드 암호화**
3. **데이터 무결성 검증**
4. **감사 로그 시스템**
5. **백업 및 복원 기능**
6. **다중 사용자 협업** (실시간 편집)
7. **API 버전 관리**
8. **성능 최적화 완성**

### 미리보기 시스템 구현 체크리스트

#### 기본 미리보기 (Phase 2)
- [ ] 파일 타입 감지 시스템
- [ ] 기본 렌더러 구현 (HTML, TXT, CSV, MD)
- [ ] 미리보기 모달 창
- [ ] 파일 다운로드 기능

#### 고급 편집기 (Phase 3)
- [ ] Monaco Editor 통합
- [ ] 분할 뷰 레이아웃 (50:50)
- [ ] 실시간 미리보기 동기화
- [ ] 자동 저장 시스템 (5초 간격)
- [ ] 편집 가능 파일 감지 (HTML/TXT/CSV/MD)
- [ ] 전체화면 모드 구현

#### 고급 렌더러 (Phase 3)
- [ ] HTML: DOMPurify sanitization + iframe
- [ ] Markdown: unified + remark-gfm + 코드 하이라이팅
- [ ] CSV: Papa Parse + 인터랙티브 테이블 + 정렬/필터
- [ ] PDF: PDF.js + 페이지 네비게이션 + 줌
- [ ] 이미지: 줌 인/아웃 + 패닝 + 원본 크기
- [ ] 오디오/비디오: HTML5 플레이어 + 커스텀 컨트롤

#### 전체화면 모드 (Phase 3)
- [ ] Fullscreen API 구현
- [ ] ESC 키 지원
- [ ] 우상단 X 버튼
- [ ] 전체화면 상태 관리
- [ ] 반응형 레이아웃 조정

### 레이아웃 구현 체크리스트

#### Header 구현 요구사항
- [ ] 90vw 너비 컨테이너 적용
- [ ] 왼쪽: 로고 + "성경자료 관리" 타이틀
- [ ] 중앙: 네비게이션 메뉴 (HOME, 전체자료실, 성경자료실, 일반자료실, 데이터관리)
- [ ] 오른쪽: 동기화 상태 + 사용자 정보 + 다크모드 토글
- [ ] 모바일 반응형: 햄버거 메뉴 구현

#### Footer 구현 요구사항
- [ ] 중앙 정렬 적용
- [ ] 1단: "Sola Scriptura Biblical Research Archive."
- [ ] 2단: 현재 년도 동적 표시
- [ ] 개발자 정보: "Built with ❤️ by 나 종 춘"
- [ ] 이메일 링크: najongchoon@gmail.com (#f5ab55 컬러)
- [ ] 우측 하단: 저장 상태 표시기 (fixed position)

#### 반응형 레이아웃 요구사항
- [ ] 모든 페이지 90vw 너비 적용
- [ ] 최대 너비 1400px 제한
- [ ] 모바일 네비게이션 오버레이
- [ ] 태블릿/모바일 패딩 조정

## 기술적 고려사항 (하이브리드 저장 통합)

### 성능
- 큰 파일 목록에 대한 가상화
- 이미지 lazy loading
- API 응답 캐싱
- **새로운 추가**:
  - **청킹 기반 파일 처리**: 1MB 단위 청킹으로 메모리 효율성
  - **LRU 캐시 관리**: IndexedDB 용량 제한 관리
  - **배치 동기화**: 네트워크 효율성을 위한 배치 처리
  - **지연 로딩**: 대용량 데이터셋의 지연 로딩

### 보안
- 파일 업로드 검증
- XSS 방지
- CSRF 토큰
- **새로운 추가**:
  - **AES-GCM 암호화**: 민감한 로컬 데이터 암호화
  - **SHA-256 체크섬**: 데이터 무결성 검증
  - **안전한 키 관리**: Web Crypto API 활용
  - **리플레이 공격 방지**: 타임스탬프 및 nonce 기반

### 신뢰성
- **새로운 추가**:
  - **지수 백오프 재시도**: 네트워크 실패 시 지능적 재시도
  - **트랜잭션 무결성**: 부분 실패 시 롤백 메커니즘
  - **데이터 복구**: 손상된 데이터 자동 복구 시스템
  - **동기화 검증**: 동기화 완료 후 데이터 일관성 검증

### SEO
- 메타 태그 최적화
- 구조화된 데이터
- 사이트맵 생성
- **하이브리드 저장은 SEO에 영향 없음** (클라이언트 사이드 동작)

## 모니터링 및 분석

### 동기화 성능 메트릭
```typescript
interface SyncMetrics {
  totalSyncOperations: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  networkRetries: number;
  conflictResolutions: number;
  dataTransferVolume: number;
  offlineUsageDuration: number;
}

class SyncAnalytics {
  async trackSyncOperation(operation: SyncOperation, result: SyncResult): Promise<void> {
    const metrics = {
      operation_type: operation.type,
      duration: result.duration,
      success: result.success,
      retry_count: operation.retry_count,
      data_size: operation.data_size,
      network_quality: this.networkMonitor.getConnectionQuality(),
      timestamp: new Date()
    };

    await this.analyticsService.track('sync_operation', metrics);
  }
}
```

이 통합된 PRD는 **견고하고 확장 가능한 하이브리드 저장 시스템**을 바탕으로 한 성경자료 관리 시스템의 완전한 설계도입니다. 오프라인 우선 아키텍처로 사용자 경험을 극대화하면서도, 데이터 안정성과 일관성을 보장하는 시스템을 구축할 수 있습니다.