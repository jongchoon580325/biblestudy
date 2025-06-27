// 전체자료실(통합 테이블) 페이지
'use client';
import React, { useState, useMemo } from 'react';
import TableForm from '../../components/tableform';
import type { Material } from '../../components/inputtableform';
import { Search } from 'lucide-react';

// mock 데이터: 성경자료실/일반자료실
const bibleMaterials: Material[] = [
  {
    local_id: 'b1',
    title: '창세기 요약문서',
    description: '창세기 개요',
    category_type: 'bible',
    bible_book: '창세기',
    file_name: 'genesis-summary.pdf',
    file_size: 123456,
    file_type: 'pdf',
    is_editable: false,
    tags: ['요약','구약'],
    sync_status: 'synced',
    storage_location: 'local',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    local_id: 'b2',
    title: '마태복음 강의',
    description: '신약 마태복음 강의자료',
    category_type: 'bible',
    bible_book: '마태복음',
    file_name: 'matthew-lecture.pptx',
    file_size: 234567,
    file_type: 'pptx',
    is_editable: false,
    tags: ['강의','신약'],
    sync_status: 'synced',
    storage_location: 'local',
    created_at: new Date(),
    updated_at: new Date(),
  },
];
const generalMaterials: Material[] = [
  {
    local_id: 'g1',
    title: '2024년 행사 안내',
    description: '교회 행사 일정',
    category_type: 'general',
    file_name: 'event-2024.pdf',
    file_size: 345678,
    file_type: 'pdf',
    is_editable: false,
    tags: ['행사'],
    sync_status: 'synced',
    storage_location: 'local',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    local_id: 'g2',
    title: '공지사항',
    description: '공지 모음',
    category_type: 'general',
    file_name: 'notice.txt',
    file_size: 4567,
    file_type: 'txt',
    is_editable: false,
    tags: ['공지'],
    sync_status: 'synced',
    storage_location: 'local',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export default function AllMaterials() {
  // 통합 데이터
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'bible'|'general'>('all');
  const allMaterials = useMemo(() => [...bibleMaterials, ...generalMaterials], []);

  // 필터/검색 적용
  const filtered = useMemo(() => {
    return allMaterials.filter(mat => {
      const matchType = filter === 'all' ? true : mat.category_type === filter;
      const q = search.trim().toLowerCase();
      const matchTitle = mat.title.toLowerCase().includes(q);
      return matchType && matchTitle;
    });
  }, [search, filter, allMaterials]);

  // 카운트
  const bibleCount = allMaterials.filter(m => m.category_type === 'bible').length;
  const generalCount = allMaterials.filter(m => m.category_type === 'general').length;
  const totalCount = allMaterials.length;

  return (
    <main className="w-full max-w-[1200px] mx-auto py-8 min-h-[70vh]">
      {/* 상단: 검색/필터/카운트 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="제목 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-2 py-1 rounded border border-gray-300 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <select
            className="px-2 py-1 rounded border border-gray-300 bg-gray-50 text-gray-900 text-sm"
            value={filter}
            onChange={e => setFilter(e.target.value as 'all'|'bible'|'general')}
          >
            <option value="all">전체</option>
            <option value="bible">성경자료실</option>
            <option value="general">일반자료실</option>
          </select>
        </div>
        <div className="flex gap-4 text-sm font-semibold text-gray-600">
          <span>성경자료실: <span className="text-blue-500">{bibleCount}</span>개</span>
          <span>일반자료실: <span className="text-emerald-500">{generalCount}</span>개</span>
          <span>총합: <span className="text-indigo-500">{totalCount}</span>개</span>
        </div>
      </div>
      {/* 테이블 */}
      <TableForm materials={filtered} />
    </main>
  );
} 