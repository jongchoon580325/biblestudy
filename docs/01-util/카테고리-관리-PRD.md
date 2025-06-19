# 카테고리 관리 PRD (Product Requirements Document)

## 1. 목적
- 협업자가 현재와 동일한 카테고리 관리 UI/로직을 구현할 수 있도록 구조, 상태관리, 주요 코드, UX, 데이터 구조, 동작 플로우를 상세히 문서화한다.

---

## 2. 전체 구조 및 UX
- **그룹 카테고리**와 **하위 카테고리**(2단계 구조)로 구성
- 그룹별 펼침/접힘(Accordion) UI, 각 항목별 아이콘(폴더, 편집, 삭제 등) 사용
- 카테고리 추가/수정/삭제 시 실시간 반영
- 카테고리명 입력 시 자동 포커스, 중복/빈값 방지
- 삭제/초기화 등은 귀여운 커스텀 모달(ConfirmModal)로 확인

---

## 3. 데이터 구조
```ts
// src/types/index.ts
export interface Category {
  id: string;
  name: string;
  type: 'group' | 'item'; // 그룹/하위카테고리 구분
  parentId?: string;     // 하위카테고리는 그룹 id 참조
  order: number;         // 그룹/하위 내 정렬 순서
}
```

---

## 4. 상태관리 (Zustand)
```ts
// src/store/categoryStore.ts
import { create } from 'zustand';
import { Category } from '@/types';
import { indexedDBService } from '@/services/indexedDBService';
import { nanoid } from 'nanoid';

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'order'> & { id?: string }) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  loading: false,
  fetchCategories: async () => {
    set({ loading: true });
    const result = await indexedDBService.getAllCategories();
    set({ categories: result, loading: false });
  },
  addCategory: async (category) => {
    const cats = get().categories;
    const siblings = cats.filter(
      (cat) =>
        cat.type === category.type &&
        (category.type === 'group' ? true : cat.parentId === category.parentId)
    );
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map((c) => c.order)) : 0;
    const newCategory: Category = {
      ...category,
      id: category.id || nanoid(),
      order: maxOrder + 1,
    };
    await indexedDBService.addCategory(newCategory);
    await get().fetchCategories();
  },
  updateCategory: async (id, updates) => {
    await indexedDBService.updateCategory(id, updates);
    await get().fetchCategories();
  },
  deleteCategory: async (id) => {
    await indexedDBService.deleteCategory(id);
    await get().fetchCategories();
  },
  clearCategories: async () => {
    await indexedDBService.clearCategories();
    await get().fetchCategories();
  },
}));
```

---

## 5. 주요 컴포넌트 구조

### 5.1 카테고리 관리 메인
- 그룹/하위카테고리 목록, 펼침/접힘, 추가/수정/삭제 버튼
- Zustand store에서 categories, loading, CRUD 메서드 사용

### 5.2 카테고리 추가/수정 모달
- 카테고리명 입력, 자동 포커스, 중복/빈값 방지
- 순서(order) 입력 없음, 저장 시 자동 지정
- props: isOpen, onClose, onSubmit, type, parentId, initialData, categories

### 5.3 귀여운 ConfirmModal
- 삭제/초기화 등 확인용, 이모지/애니메이션/컬러 적용
- props: isOpen, title, message, onConfirm, onCancel

---

## 6. 동작 플로우 예시
1. **그룹 추가**: '그룹 추가' 클릭 → 모달 → 이름 입력 → 추가 → 리스트 실시간 반영
2. **하위카테고리 추가**: 그룹 펼침 → '하위 추가' 클릭 → 모달 → 이름 입력 → 추가
3. **수정/삭제**: 각 항목별 편집/삭제 버튼 → 모달/확인 → 반영
4. **초기화**: '카테고리 초기화' 클릭 → ConfirmModal → 확인 시 전체 삭제

---

## 7. 코드 예시 (카테고리 관리 주요 부분)
```tsx
import { useCategoryStore } from '@/store/categoryStore';
// ...
const {
  categories, loading, fetchCategories, addCategory, updateCategory, deleteCategory, clearCategories
} = useCategoryStore();

useEffect(() => { fetchCategories(); }, [fetchCategories]);

const groupCategories = categories.filter(cat => cat.type === 'group').sort((a, b) => a.order - b.order);
const getSubCategories = (groupId: string) =>
  categories.filter(cat => cat.type === 'item' && cat.parentId === groupId).sort((a, b) => a.order - b.order);

// 추가/수정/삭제/초기화 핸들러는 store 메서드 사용
```

---

## 8. 기타 구현/협업 주의사항
- IndexedDB는 클라이언트에서만 접근 가능 (SSR 불가)
- id는 nanoid 등으로 고유하게 생성, order는 자동 지정
- 카테고리명 중복/빈값 방지, 입력시 자동 포커스
- UI/UX는 Tailwind CSS, Lucide 아이콘, 애니메이션 등 적극 활용
- ConfirmModal 등 커스텀 모달로 alert/confirm 대체
- 코드/컴포넌트 분리, props/타입 명확화

---

## 9. 참고
- `/src/store/categoryStore.ts`, `/src/components/CategoryModal.tsx`, `/src/components/ConfirmModal.tsx` 등 실제 코드 참고
- 추가 문의/협업은 PR/이슈/슬랙 등으로 소통 