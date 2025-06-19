// 타입 직접 정의 (임시)
export interface CategoryItem {
  id: string
  name: string
  order: number
}

export interface CategoryGroup {
  id: string
  name: string
  category_items: CategoryItem[]
}

interface ExportCategory {
  group: string
  item: string
}

interface ImportCategory {
  group: string
  item: string
}

/**
 * 카테고리 데이터를 CSV 형식으로 변환
 */
export function convertToCSV(categories: CategoryGroup[]): string {
  const rows: ExportCategory[] = []
  
  // 카테고리 그룹과 아이템을 순차적으로 정렬하여 배열로 변환
  categories.forEach(group => {
    group.category_items.forEach(item => {
      rows.push({
        group: group.name,
        item: item.name
      })
    })
  })

  // CSV 헤더 생성
  const headers = ['group', 'item']
  
  // CSV 행 데이터 생성
  const csvRows = [
    headers.join(','),
    ...rows.map(row => [row.group, row.item].join(','))
  ]

  return csvRows.join('\n')
}

/**
 * CSV 파일명 생성
 */
export function generateCSVFilename(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}-성경-카테고리.csv`
}

/**
 * CSV 파일 다운로드
 */
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * CSV 파일 파싱
 */
export function parseCSV(csvContent: string): ImportCategory[] {
  const lines = csvContent.split('\n')
  const headers = lines[0].split(',')
  const clean = (s: string) => s.replace(/^\uFEFF/, '').trim().toLowerCase();
  // 헤더 검증 개선
  if (clean(headers[0]) !== 'group' || clean(headers[1]) !== 'item') {
    throw new Error('잘못된 CSV 형식입니다. group과 item 컬럼이 필요합니다.')
  }

  return lines.slice(1).map(line => {
    const [group, item] = line.split(',')
    return { group, item }
  })
}

/**
 * 고유 ID 생성
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * 가져온 데이터를 카테고리 형식으로 변환
 */
export function convertToCategories(importData: ImportCategory[]): CategoryGroup[] {
  const groupMap = new Map<string, CategoryGroup>()
  
  importData.forEach(({ group, item }) => {
    if (!groupMap.has(group)) {
      groupMap.set(group, {
        id: generateId(),
        name: group,
        category_items: []
      })
    }
    
    const categoryGroup = groupMap.get(group)!
    categoryGroup.category_items.push({
      id: generateId(),
      name: item,
      order: categoryGroup.category_items.length
    })
  })

  return Array.from(groupMap.values())
} 