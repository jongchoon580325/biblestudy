// 전체자료실(통합 테이블) 페이지
'use client';
import React, { useState, useMemo } from 'react';
import TableForm from '../../components/tableform';
import { Search } from 'lucide-react';

export default function AllMaterials() {
  // 통합 데이터
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'bible'|'general'>('all');
  const filtered = useMemo(() => [], []);

  // 카운트
  const bibleCount = 0;
  const generalCount = 0;
  const totalCount = 0;

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