// 전체자료실(블랭크) 페이지
import TableFormAdvanced from '../../components/tableform-advanced';

// 목업 material 데이터
const mockMaterial = {
  local_id: '1',
  title: '예시 자료',
  description: '이것은 자료 설명입니다.',
  tags: ['성경', '자료'],
  sync_status: 'synced' as const,
  file_type: 'md',
  file_name: 'sample.md',
  bible_book: '창세기',
  is_editable: true,
  category_type: 'bible' as const,
  file_size: 12345,
  storage_location: 'local' as const,
  created_at: new Date(),
  updated_at: new Date()
};

export default function AllMaterials() {
  return (
    <main />
  );
} 