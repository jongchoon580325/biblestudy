# 성경자료 관리 시스템 PRD (Product Requirements Document)

## 프로젝트 개요

### 기술 스택
- **프론트엔드**: Next.js 14+ (App Router)
- **상태관리**: Zustand
- **스타일링**: TailwindCSS
- **언어**: TypeScript

### 프로젝트 목적
성경 자료를 체계적으로 관리하고 공유할 수 있는 웹 애플리케이션 개발

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
```

### 타이포그래피
- **제목**: font-bold text-xl-2xl
- **부제목**: font-medium text-lg
- **본문**: font-normal text-base
- **캡션**: font-normal text-sm
- **소제목**: font-medium text-sm

## 레이아웃 구조

### 전체 레이아웃
```
┌─────────────────────────────────────┐
│              Header                 │
├─────────┬───────────────────────────┤
│         │                           │
│ Sidebar │        Main Content       │
│         │                           │
│         │                           │
├─────────┴───────────────────────────┤
│              Footer                 │
└─────────────────────────────────────┘
```

### 사이드바 구성
- **로고 및 앱 제목**: "성경자료 관리"
- **네비게이션 메뉴**:
  - 🏠 HOME
  - 📁 전체자료실
  - 📄 성경자료실
  - ✅ 일반자료실
  - ⬆️ 자료업로드
  - 📊 데이터관리 (확장 가능)
- **성경 구절 카드**: 하단에 랜덤 성경 구절 표시
- **사용자 정보**: "Edit by 나 종 춘"

## 페이지별 상세 명세

### 1. 홈페이지 (`/`)
**목적**: 대시보드 및 주요 기능 접근점

#### 구성 요소
- **페이지 제목**: "성경을 연구하고 성경의 지혜를 나누세요"
- **부연설명**: "하나님의 말씀을 연구하고 나누는 것은 모든 일의 원동력입니다."
- **CTA 버튼**: "연구 시작하기"
- **성경 구절 카드**: 중앙 강조 표시
- **통계 카드들**:
  - 등록 자료 현황 (1,247개)
  - 내 자료실 (2,856개)
  - 총 방문자 (15,432명)
  - 즐겨찾기 (8,921개)
- **주요 기능 버튼들**:
  - 자료실 검색
  - 즐겨찾는 자료
  - 연구 도구
  - 협업 공간
- **최근 활동** 섹션
- **Footer**: "© 2025 Biblical Research Archive. All rights reserved. Manager by 나 종 춘"

### 2. 전체자료실 (`/all-materials`)
**목적**: 성경자료실과 일반자료실 데이터를 종합적으로 테이블에서 확인하고 열람하는 기능

#### 구성 요소
- **페이지 제목**: "전체목록자료실"
- **부연설명**: "이곳은 모든 자료의 전체 목록을 한눈에 볼 수 있는 공간입니다. 다양한 자료를 효율적으로 관리하세요."
- **통합 데이터 테이블**:
  - 성경자료실과 일반자료실의 모든 데이터 통합 표시
  - 자료 구분 태그 (성경자료/일반자료)
  - 제목, 구분, 파일사이즈, 등록일자, 관리 컬럼
- **고급 검색 및 필터링**:
  - 키워드 검색
  - 자료실 유형별 필터 (성경자료/일반자료/전체)
  - 카테고리별 필터
  - 등록일 범위 설정
- **일괄 관리 기능**:
  - 다중 선택 및 일괄 삭제
  - 일괄 카테고리 변경
  - 데이터 내보내기 (CSV/Excel)
- **페이지네이션 및 표시 옵션**
- **총 파일 수 및 통계 표시**

### 3. 성경자료실 (`/bible-materials`)
**목적**: 성경 관련 자료 전용 공간

#### 구성 요소
- **페이지 제목**: "성경자료실"
- **부연설명**: "구약과 신약 성경 자료를 한눈에 확인할 수 있습니다."
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
- **각 책별 자료 개수 표시**

### 4. 일반자료실 (`/general-materials`)
**목적**: 성경 외 일반 자료 관리

#### 구성 요소
- **페이지 제목**: "일반자료실"
- **부연설명**: "일반 자료를 관리하는 공간입니다."
- **파일 업로드 영역**: 드래그 앤 드롭 지원
- **검색 및 필터 기능**
- **자료 목록 테이블**
- **총 파일 수 표시**

### 5. 자료업로드 (`/upload`)
**목적**: 새로운 자료 업로드

#### 구성 요소
- **페이지 제목**: "자료 업로드"
- **부연설명**: "이곳 유용한 자료를 쉽고 빠르게 업로드를 할 수 있습니다. 첨부는 후 설명첨부를 할 지 자료업로드에서 바로 확인할 수 있습니다."
- **파일 선택 드롭다운**: "여러 개의 파일을 선택할 수 있고 최고 파일을 선택해주세요."
- **고급 드래그 앤 드롭 업로드 영역**:
  - **시각적 디자인**: 점선 테두리, 그라데이션 배경, 호버 효과
  - **인터랙션**: 드래그 오버 시 색상 변화 및 애니메이션
  - **아이콘**: 클라우드 업로드 아이콘과 함께 직관적인 UI
  - **다중 파일 지원**: 여러 파일 동시 업로드
  - **파일 타입 제한**: 허용되는 파일 확장자 표시
  - **크기 제한**: 최대 파일 크기 안내
  - **미리보기**: 선택된 파일 목록과 썸네일 표시
  - **진행 상황**: 개별 파일별 업로드 진행률 표시
  - **오류 처리**: 실패한 파일에 대한 명확한 오류 메시지
- **파일 정보 입력 폼**:
  - 제목, 설명, 카테고리 설정
  - 태그 시스템
- **업로드 상태 관리**:
  - 실시간 업로드 진행 상태
  - 성공/실패 알림
  - 업로드 완료 후 자동 리다이렉트 옵션

### 6. 데이터관리 (`/data-management`)
**목적**: 시스템 데이터 관리 (확장 가능한 섹션)

#### 하위 페이지들
- **카테고리 관리**: 그룹 및 하위 카테고리 설정
- **성경자료실/일반자료실**: 각각의 관리 패널
- **데이터 초기화**: 시스템 데이터 관리

## 공통 컴포넌트

### 1. Header
- 앱 제목
- 사용자 정보
- 다크모드 토글
- 알림 아이콘

### 2. Sidebar
- 네비게이션 메뉴
- 성경 구절 카드
- 사용자 프로필

### 3. 페이지 타이틀 섹션
```tsx
interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}
```

### 4. 통계 카드
```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'orange' | 'green';
}
```

### 5. 파일 업로드 영역
- 드래그 앤 드롭 지원
- 파일 타입 제한
- 업로드 진행 상황 표시

### 6. 데이터 테이블
- 정렬 기능
- 페이지네이션
- 검색 필터
- 액션 버튼들

## 상태 관리 (Zustand)

### 스토어 구조
```typescript
interface AppState {
  // UI 상태
  isDarkMode: boolean;
  sidebarCollapsed: boolean;
  
  // 사용자 상태
  user: User | null;
  
  // 자료 상태
  materials: Material[];
  filteredMaterials: Material[];
  searchQuery: string;
  selectedCategory: string;
  
  // 업로드 상태
  uploadProgress: number;
  uploadingFiles: File[];
  
  // 액션들
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  filterMaterials: () => void;
  uploadFiles: (files: File[]) => Promise<void>;
}
```

## 반응형 디자인

### 브레이크포인트
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### 반응형 행동
- **Mobile**: 사이드바 오버레이 형태
- **Tablet**: 사이드바 접기/펼치기
- **Desktop**: 고정 사이드바

## 접근성 (Accessibility)

### 요구사항
- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 지원
- 적절한 색상 대비
- Focus 표시

## 성능 최적화

### 최적화 전략
- Next.js App Router 활용
- 이미지 최적화 (next/image)
- 코드 스플리팅
- 메모이제이션 (React.memo, useMemo)
- 가상화된 리스트 (긴 목록용)

## 폴더 구조
```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx                 # 홈페이지
│   │   ├── all-materials/
│   │   ├── bible-materials/
│   │   ├── general-materials/
│   │   ├── upload/
│   │   └── data-management/
│   ├── globals.css
│   ├── layout.tsx
│   └── loading.tsx
├── components/
│   ├── ui/                          # 기본 UI 컴포넌트
│   ├── layout/                      # 레이아웃 컴포넌트
│   ├── materials/                   # 자료 관련 컴포넌트
│   └── upload/                      # 업로드 관련 컴포넌트
├── stores/                          # Zustand 스토어
├── types/                           # TypeScript 타입 정의
├── utils/                           # 유틸리티 함수
└── constants/                       # 상수 정의
```

## 구현 우선순위

### Phase 1 (MVP)
1. 기본 레이아웃 및 라우팅
2. 다크모드 테마 시스템
3. 홈페이지 대시보드
4. 기본 자료실 페이지들

### Phase 2
1. 파일 업로드 기능
2. 검색 및 필터링
3. 성경 책별 자료 관리

### Phase 3
1. 데이터 관리 기능
2. 사용자 권한 시스템
3. 고급 검색 기능

## 기술적 고려사항

### 성능
- 큰 파일 목록에 대한 가상화
- 이미지 lazy loading
- API 응답 캐싱

### 보안
- 파일 업로드 검증
- XSS 방지
- CSRF 토큰

### SEO
- 메타 태그 최적화
- 구조화된 데이터
- 사이트맵 생성