# Bible Category 관리 PRD (Product Requirements Document)

## 1. 목적
- 본 프로젝트의 데이터관리 페이지 내 카테고리 관리 기능을 일관성 있게 구현하기 위한 구조, 상태관리, 주요 코드, UX, 데이터 구조, 동작 플로우를 상세히 문서화한다.

---

## 2. 전체 구조 및 UX
- **2단계 구조**: 그룹 카테고리(상위)와 하위 카테고리(아이템)
- 그룹별 펼침/접힘(Accordion) UI, 각 항목별 아이콘(폴더, 편집, 삭제 등) 사용
- 카테고리 추가/수정/삭제 시 실시간 반영
- 카테고리명 입력 시 자동 포커스, 중복/빈값 방지
- 삭제/초기화 등은 커스텀 모달(ConfirmModal)로 확인
- Tailwind CSS, Lucide 아이콘, 반응형 UI 적용

---

## 3. 데이터 구조
```ts
export interface Category {
  id: string; // 고유값 (UUID)
  name: string;
  type: 'group' | 'item'; // 그룹/하위카테고리 구분
  parentId?: string;     // 하위카테고리는 그룹 id 참조
  order: number;         // 그룹/하위 내 정렬 순서
  created_at: string;    // ISO 날짜
  updated_at: string;    // ISO 날짜
  sync_status?: 'synced' | 'pending' | 'error'; // 동기화 상태
}
```

---

## 4. 상태관리
- **zustand 등 store 미사용**
- React useState/useEffect 등 내장 훅 기반 로컬 상태관리
- 카테고리 목록, 로딩, 모달 상태 등은 컴포넌트 단위로 관리
- 예시:
```tsx
const [categories, setCategories] = useState<Category[]>([]);
const [catLoading, setCatLoading] = useState(false);
const [catModal, setCatModal] = useState<null | { type: 'add'|'edit'|'delete'|'clear', target?: Category, parentId?: string }>(null);
const [catInput, setCatInput] = useState('');
const [catType, setCatType] = useState<'group'|'item'>('group');
const [expanded, setExpanded] = useState<string[]>([]); // 펼침 그룹 id 목록
```

---

## 5. 저장소 구조 및 동기화
- **IndexedDB**: 클라이언트 영구 저장소, CRUD 및 정렬/검색 지원
- **Supabase**: 서버 동기화(수동 트리거), 테이블 구조는 Category와 동일하게 설계
- 동기화 트리거:
  1. 사용자가 '홈' 페이지에 진입할 때(앱 최초 진입 또는 홈 메뉴 클릭 시)
  2. 데이터관리 페이지에서 'Supabase 동기화 실행' 버튼을 수동으로 클릭할 때
- 위 두 경우에만 Supabase와 카테고리 데이터 동기화가 실행됨
- 동기화 로직:
  - IndexedDB의 카테고리 데이터 중 sync_status가 'pending' 또는 'error'인 항목만 Supabase와 동기화
  - 동기화 성공 시 sync_status를 'synced'로 갱신, 실패 시 'error'로 유지
  - 동기화 중에는 로딩/진행 상태 및 결과 메시지를 UI에 한 줄로 표시
- 실시간/자동 동기화는 도입하지 않으며, 사용자가 명확히 인지하고 제어할 수 있는 구조를 유지
- 네트워크 불안정/오프라인 시에는 동기화 시도 없이 로컬에만 반영, 온라인 복귀 후 트리거 시 동기화 재시도
- 예외/에러 발생 시 사용자에게 즉시 메시지로 안내, 재시도는 사용자가 직접 트리거

---

## 6. 주요 컴포넌트/로직
- **카테고리 관리 메인**: 그룹/하위카테고리 목록, 펼침/접힘, 추가/수정/삭제 버튼
- **카테고리 추가/수정 모달**: 이름 입력, 자동 포커스, 중복/빈값 방지
- **ConfirmModal**: 삭제/초기화 등 확인용, 이모지/컬러/애니메이션 적용
- **핸들러**: 추가/수정/삭제/초기화/동기화 등은 useState 기반 함수로 구현

---

## 7. 동작 플로우 예시
1. **그룹 추가**: '그룹 추가' 클릭 → 모달 → 이름 입력 → 추가 → 리스트 실시간 반영
2. **하위카테고리 추가**: 그룹 펼침 → '하위 추가' 클릭 → 모달 → 이름 입력 → 추가
3. **수정/삭제**: 각 항목별 편집/삭제 버튼 → 모달/확인 → 반영
4. **초기화**: '카테고리 초기화' 클릭 → ConfirmModal → 확인 시 전체 삭제
5. **동기화**: 변경 시 IndexedDB에만 저장, 동기화 트리거 시 Supabase에 push

---

## 8. 코드 예시 (핵심 부분)
```tsx
// 상태관리
const [categories, setCategories] = useState<Category[]>([]);
const [catLoading, setCatLoading] = useState(false);
// ...

// 카테고리 목록 fetch
async function fetchCategories() {
  setCatLoading(true);
  const all = await CategoryService.getAll();
  setCategories(all);
  setCatLoading(false);
}
useEffect(() => { fetchCategories(); }, []);

// 추가/수정/삭제/초기화/동기화 핸들러
async function handleAddCategory() { /* ... */ }
async function handleEditCategory() { /* ... */ }
async function handleDeleteCategory() { /* ... */ }
async function handleClearCategories() { /* ... */ }
async function handleSyncCategories() { /* IndexedDB의 pending/error만 Supabase로 push */ }
```

---

## 9. 기타 구현/협업 주의사항
- IndexedDB/Supabase 구조 및 동기화 정책은 자료실과 동일하게 설계
- id는 UUID, order는 자동 지정, 날짜는 ISO 문자열
- 카테고리명 중복/빈값 방지, 입력시 자동 포커스
- UI/UX는 Tailwind CSS, Lucide 아이콘, 커스텀 모달 적극 활용
- 코드/컴포넌트 분리, props/타입 명확화
- 커밋/문서화/코드 품질 규칙은 기존 프로젝트 가이드라인 준수

---

## 10. Supabase 동기화 확장 계획
- 테이블 구조: Category 타입과 100% 동일하게 설계 (id, name, type, parentId, order, created_at, updated_at, sync_status)
- 동기화 실패/충돌 시 UX: 자료실과 동일하게 에러 메시지, 재시도 버튼 등 제공
- 향후 다중 사용자 협업, 실시간 동기화(WebSocket 등) 확장 가능

--- 