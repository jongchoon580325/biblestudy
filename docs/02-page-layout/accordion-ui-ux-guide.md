
# Accordion UI/UX 구현 가이드

## 1. Accordion UI 개요

### 1.1 정의
Accordion UI는 여러 섹션을 가진 인터페이스에서 한 번에 하나 또는 여러 섹션을 펼치거나 접을 수 있는 상호작용 컴포넌트입니다. 카테고리 관리 시스템에서는 그룹별로 하위 아이템들을 체계적으로 정리하고 보여주는 데 사용됩니다.

### 1.2 주요 특징
- **공간 효율성**: 제한된 화면 공간에서 많은 정보를 체계적으로 표시
- **계층적 구조**: 그룹과 하위 아이템의 관계를 직관적으로 표현
- **선택적 표시**: 사용자가 필요한 정보만 펼쳐서 볼 수 있음
- **상태 관리**: 각 섹션의 펼침/접힘 상태를 독립적으로 관리

### 1.3 사용 시나리오
- 카테고리별 아이템 관리
- FAQ 섹션
- 메뉴 네비게이션
- 설정 패널
- 데이터 그룹핑 및 필터링

## 2. 상태 관리 (Zustand)

### 2.1 Accordion 상태 스토어 설계
```typescript
interface CategoryStore {
  categories: CategoryStructure[]
  expandedGroups: Set<string>  // 펼쳐진 그룹들의 ID 집합
  
  // Accordion 제어 메서드
  toggleGroup: (groupId: string) => void
  expandGroup: (groupId: string) => void
  collapseGroup: (groupId: string) => void
  expandAll: () => void
  collapseAll: () => void
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  expandedGroups: new Set<string>(),

  // 개별 그룹 토글
  toggleGroup: (groupId: string) => {
    const expandedGroups = new Set(get().expandedGroups)
    if (expandedGroups.has(groupId)) {
      expandedGroups.delete(groupId)
    } else {
      expandedGroups.add(groupId)
    }
    set({ expandedGroups })
  },

  // 그룹 펼치기
  expandGroup: (groupId: string) => {
    const expandedGroups = new Set(get().expandedGroups)
    expandedGroups.add(groupId)
    set({ expandedGroups })
  },

  // 그룹 접기
  collapseGroup: (groupId: string) => {
    const expandedGroups = new Set(get().expandedGroups)
    expandedGroups.delete(groupId)
    set({ expandedGroups })
  },

  // 모든 그룹 펼치기
  expandAll: () => {
    const allGroupIds = get().categories.map(group => group.id)
    set({ expandedGroups: new Set(allGroupIds) })
  },

  // 모든 그룹 접기
  collapseAll: () => {
    set({ expandedGroups: new Set() })
  }
}))
```

### 2.2 상태 지속성 (로컬 스토리지)
```typescript
// 페이지 새로고침 후에도 Accordion 상태 유지
const persistAccordionState = (expandedGroups: Set<string>) => {
  localStorage.setItem('accordion_state', JSON.stringify([...expandedGroups]))
}

const loadAccordionState = (): Set<string> => {
  try {
    const saved = localStorage.getItem('accordion_state')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  } catch {
    return new Set()
  }
}

// 스토어에 통합
export const useCategoryStore = create<CategoryStore>((set, get) => ({
  expandedGroups: loadAccordionState(),

  toggleGroup: (groupId: string) => {
    const expandedGroups = new Set(get().expandedGroups)
    if (expandedGroups.has(groupId)) {
      expandedGroups.delete(groupId)
    } else {
      expandedGroups.add(groupId)
    }
    persistAccordionState(expandedGroups)
    set({ expandedGroups })
  },
  // ... 다른 메서드들도 유사하게 persist 호출
}))
```

## 3. 다크모드 Accordion UI 컴포넌트

### 3.1 메인 Accordion 컴포넌트
```typescript
import React from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileText,
  Plus,
  Edit,
  Trash2 
} from 'lucide-react'
import { useCategoryStore } from '../store/categoryStore'

const AccordionUI: React.FC = () => {
  const { categories, expandedGroups, toggleGroup } = useCategoryStore()

  return (
    <div className="space-y-4">
      {categories.map((group) => {
        const isExpanded = expandedGroups.has(group.id)
        
        return (
          <div 
            key={group.id} 
            className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
          >
            {/* Accordion Header */}
            <AccordionHeader
              group={group}
              isExpanded={isExpanded}
              onToggle={() => toggleGroup(group.id)}
            />
            
            {/* Accordion Content */}
            <AccordionContent
              group={group}
              isExpanded={isExpanded}
            />
          </div>
        )
      })}
    </div>
  )
}
```

### 3.2 Accordion Header 컴포넌트
```typescript
interface AccordionHeaderProps {
  group: CategoryStructure
  isExpanded: boolean
  onToggle: () => void
}

const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  group,
  isExpanded,
  onToggle
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors">
      {/* 클릭 가능한 헤더 영역 */}
      <div 
        className="flex items-center space-x-3 flex-1 cursor-pointer select-none"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${group.id}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        {/* 펼침/접힘 아이콘 */}
        <div className="text-gray-400 hover:text-white transition-colors">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 transform transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-5 w-5 transform transition-transform duration-200" />
          )}
        </div>
        
        {/* 폴더 아이콘 (상태에 따라 변경) */}
        <div className="text-blue-400">
          {isExpanded ? (
            <FolderOpen className="h-5 w-5" />
          ) : (
            <Folder className="h-5 w-5" />
          )}
        </div>
        
        {/* 그룹 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-gray-400 truncate">{group.description}</p>
          )}
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-xs text-gray-500">
              아이템 {group.category_items.length}개
            </span>
            {isExpanded && (
              <span className="text-xs text-green-400">펼쳐짐</span>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <ActionButtons group={group} />
    </div>
  )
}
```

### 3.3 Accordion Content 컴포넌트
```typescript
interface AccordionContentProps {
  group: CategoryStructure
  isExpanded: boolean
}

const AccordionContent: React.FC<AccordionContentProps> = ({
  group,
  isExpanded
}) => {
  return (
    <div
      id={`accordion-content-${group.id}`}
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}
      aria-hidden={!isExpanded}
    >
      <div className="border-t border-gray-700 bg-gray-850">
        {group.category_items.length === 0 ? (
          <EmptyContent groupId={group.id} groupName={group.name} />
        ) : (
          <ItemsList items={group.category_items} groupName={group.name} />
        )}
      </div>
    </div>
  )
}
```

### 3.4 빈 콘텐츠 컴포넌트
```typescript
interface EmptyContentProps {
  groupId: string
  groupName: string
}

const EmptyContent: React.FC<EmptyContentProps> = ({ groupId, groupName }) => {
  const { addItem } = useCategoryStore()

  return (
    <div className="p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <FileText className="h-12 w-12 text-gray-600 opacity-50" />
        <div className="space-y-2">
          <p className="text-gray-400 font-medium">아이템이 없습니다</p>
          <p className="text-sm text-gray-500">
            "{groupName}" 그룹에 첫 번째 아이템을 추가해보세요
          </p>
        </div>
        <button
          onClick={() => {
            // 아이템 추가 모달 열기 로직
            console.log('Add item to group:', groupId)
          }}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>첫 아이템 추가</span>
        </button>
      </div>
    </div>
  )
}
```

### 3.5 아이템 목록 컴포넌트
```typescript
interface ItemsListProps {
  items: CategoryItem[]
  groupName: string
}

const ItemsList: React.FC<ItemsListProps> = ({ items, groupName }) => {
  return (
    <div className="divide-y divide-gray-700">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-4 ml-8 hover:bg-gray-800 transition-colors group"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="text-green-400">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate">
                {item.name}
              </h4>
              {item.description && (
                <p className="text-sm text-gray-400 truncate">
                  {item.description}
                </p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  순서: {index + 1}
                </span>
                <span className="text-xs text-blue-400">
                  그룹: {groupName}
                </span>
              </div>
            </div>
          </div>

          {/* 아이템 액션 버튼 */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => console.log('Edit item:', item.id)}
              className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 rounded transition-colors"
              title="아이템 수정"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => console.log('Delete item:', item.id)}
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
              title="아이템 삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

## 4. 애니메이션 및 전환 효과

### 4.1 CSS 애니메이션
```css
/* globals.css */

/* Accordion 펼침/접힘 애니메이션 */
.accordion-content {
  transition: max-height 0.3s ease-in-out, opacity 0.2s ease-in-out;
}

.accordion-content.expanded {
  max-height: 2000px; /* 충분히 큰 값 */
  opacity: 1;
}

.accordion-content.collapsed {
  max-height: 0;
  opacity: 0;
}

/* 아이콘 회전 애니메이션 */
.accordion-icon {
  transition: transform 0.2s ease-in-out;
}

.accordion-icon.expanded {
  transform: rotate(90deg);
}

/* 호버 효과 */
.accordion-header:hover {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
}

/* 포커스 효과 (접근성) */
.accordion-header:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 부드러운 색상 전환 */
.accordion-item {
  transition: all 0.2s ease-in-out;
}

.accordion-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### 4.2 Framer Motion 애니메이션 (선택사항)
```bash
npm install framer-motion
```

```typescript
import { motion, AnimatePresence } from 'framer-motion'

const AnimatedAccordionContent: React.FC<AccordionContentProps> = ({
  group,
  isExpanded
}) => {
  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="border-t border-gray-700 bg-gray-850">
            {/* 콘텐츠 */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const AnimatedAccordionIcon: React.FC<{ isExpanded: boolean }> = ({ isExpanded }) => {
  return (
    <motion.div
      animate={{ rotate: isExpanded ? 90 : 0 }}
      transition={{ duration: 0.2 }}
      className="text-gray-400 hover:text-white"
    >
      <ChevronRight className="h-5 w-5" />
    </motion.div>
  )
}
```

## 5. 접근성 (Accessibility) 고려사항

### 5.1 ARIA 속성
```typescript
const AccessibleAccordion: React.FC = () => {
  return (
    <div role="region" aria-label="카테고리 관리">
      {categories.map((group) => (
        <div key={group.id} className="accordion-item">
          <h3>
            <button
              aria-expanded={isExpanded}
              aria-controls={`accordion-panel-${group.id}`}
              id={`accordion-header-${group.id}`}
              className="accordion-header"
              onClick={() => toggleGroup(group.id)}
            >
              <span className="sr-only">
                {isExpanded ? '접기' : '펼치기'}
              </span>
              {group.name}
            </button>
          </h3>
          
          <div
            id={`accordion-panel-${group.id}`}
            role="region"
            aria-labelledby={`accordion-header-${group.id}`}
            aria-hidden={!isExpanded}
            className="accordion-content"
          >
            {/* 콘텐츠 */}
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 5.2 키보드 네비게이션
```typescript
const handleKeyNavigation = (e: React.KeyboardEvent, groupId: string) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      toggleGroup(groupId)
      break
    case 'ArrowDown':
      e.preventDefault()
      focusNextAccordion(groupId)
      break
    case 'ArrowUp':
      e.preventDefault()
      focusPrevAccordion(groupId)
      break
    case 'Home':
      e.preventDefault()
      focusFirstAccordion()
      break
    case 'End':
      e.preventDefault()
      focusLastAccordion()
      break
  }
}

const focusNextAccordion = (currentId: string) => {
  const currentIndex = categories.findIndex(cat => cat.id === currentId)
  const nextIndex = (currentIndex + 1) % categories.length
  const nextId = categories[nextIndex].id
  document.getElementById(`accordion-header-${nextId}`)?.focus()
}
```

## 6. 반응형 디자인

### 6.1 모바일 최적화
```typescript
const ResponsiveAccordion: React.FC = () => {
  return (
    <div className="space-y-2 md:space-y-4">
      {categories.map((group) => (
        <div key={group.id} className="bg-gray-800 rounded-lg border border-gray-700">
          {/* 모바일에서는 패딩 축소 */}
          <div className="flex items-center justify-between p-3 md:p-4">
            <div 
              className="flex items-center space-x-2 md:space-x-3 flex-1 cursor-pointer"
              onClick={() => toggleGroup(group.id)}
            >
              <ChevronRight 
                className={`h-4 w-4 md:h-5 md:w-5 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`} 
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm md:text-base truncate">
                  {group.name}
                </h3>
                {/* 모바일에서는 설명 숨김 */}
                {group.description && (
                  <p className="hidden md:block text-sm text-gray-400 truncate">
                    {group.description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {group.category_items.length}개
                </p>
              </div>
            </div>

            {/* 모바일에서는 버튼 크기 축소 */}
            <div className="flex items-center space-x-1 md:space-x-2">
              <button className="p-1.5 md:p-2 text-green-400 hover:bg-gray-700 rounded">
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
              </button>
              {/* 다른 버튼들... */}
            </div>
          </div>

          {/* 콘텐츠 영역도 반응형 패딩 */}
          {isExpanded && (
            <div className="border-t border-gray-700 bg-gray-850">
              <div className="p-3 md:p-4 md:ml-8">
                {/* 아이템 목록 */}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

### 6.2 터치 최적화
```typescript
const TouchOptimizedAccordion: React.FC = () => {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (groupId: string) => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    // 스와이프 제스처로 펼침/접힘 제어
    if (isLeftSwipe) {
      collapseGroup(groupId)
    } else if (isRightSwipe) {
      expandGroup(groupId)
    }
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => handleTouchEnd(group.id)}
      className="touch-manipulation" // iOS Safari 터치 최적화
    >
      {/* Accordion 콘텐츠 */}
    </div>
  )
}
```

### 6.3 브레이크포인트별 레이아웃
```typescript
const ResponsiveLayout: React.FC = () => {
  return (
    <div className="w-full max-w-none lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 헤더 영역 */}
      <div className="mb-4 md:mb-6 lg:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
          카테고리 관리
        </h1>
        
        {/* 제어 버튼들 - 모바일에서는 세로 정렬 */}
        <div className="mt-3 md:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm md:text-base">
            모두 펼치기
          </button>
          <button className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg text-sm md:text-base">
            모두 접기
          </button>
        </div>
      </div>

      {/* Accordion 목록 */}
      <div className="space-y-2 md:space-y-3 lg:space-y-4">
        {categories.map((group) => (
          <div 
            key={group.id} 
            className="bg-gray-800 rounded-md md:rounded-lg border border-gray-700"
          >
            {/* 반응형 헤더 */}
            <div className="p-3 md:p-4 lg:p-5">
              {/* 헤더 내용 */}
            </div>
            
            {/* 반응형 콘텐츠 */}
            {isExpanded && (
              <div className="border-t border-gray-700">
                <div className="p-3 md:p-4 lg:p-5 md:ml-4 lg:ml-8">
                  {/* 아이템들 */}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

이제 1단계부터 6단계까지의 완전한 Accordion UI/UX 구현 가이드가 완성되었습니다! 각 단계는 실제 개발에서 바로 적용할 수 있는 구체적인 코드와 설명을 포함하고 있습니다.