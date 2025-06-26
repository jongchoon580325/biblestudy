"use client";
import React, { useState, useMemo } from 'react';
import { Eye, Edit, Trash2, Download, Check, AlertCircle, Clock, RefreshCw, X, File, Search } from 'lucide-react';
import type { Material } from './inputtableform';

// TableFormAdvanced 컴포넌트 Props 타입
interface TableFormAdvancedProps {
  material: Material; // 단일 목업데이터만 사용
  onEdit?: (material: Material) => void;
  onDelete?: (material: Material) => void;
  onDownload?: (material: Material) => void;
  onPreview?: (material: Material) => void;
}

/**
 * TableFormAdvanced - 필터, 검색, 페이지네이션 포함 고급 테이블 컴포넌트
 * @param props - 단일 자료, 각종 이벤트 핸들러
 */
const TableFormAdvanced: React.FC<TableFormAdvancedProps> = ({
  material,
  onEdit,
  onDelete,
  onDownload,
  onPreview
}) => {
  // 상태: 검색, 필터, 페이지네이션
  const [searchQuery, setSearchQuery] = useState('');
  const [syncFilter, setSyncFilter] = useState('all');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // 목업데이터 1개만 배열로 사용
  const materials = useMemo(() => [material], [material]);

  // 필터/검색 적용
  const filtered = useMemo(() => {
    let arr = materials;
    if (searchQuery) {
      arr = arr.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (syncFilter !== 'all') {
      arr = arr.filter(m => m.sync_status === syncFilter);
    }
    if (fileTypeFilter !== 'all') {
      arr = arr.filter(m => m.file_type === fileTypeFilter);
    }
    return arr;
  }, [materials, searchQuery, syncFilter, fileTypeFilter]);

  // 페이지네이션
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 동기화 상태 뱃지 렌더러
  const getSyncStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: React.FC<{className?: string}>; text: string }> = {
      synced: { color: 'bg-green-100 text-green-800', icon: Check, text: '동기화됨' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: '대기중' },
      syncing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, text: '동기화중' },
      conflict: { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: '충돌' },
      error: { color: 'bg-gray-100 text-gray-800', icon: X, text: '에러' }
    };
    const config = configs[status] || configs.error;
    const IconComponent = config.icon;
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        <span>{config.text}</span>
      </span>
    );
  };

  // 파일 타입 옵션
  const fileTypeOptions = [
    { value: 'all', label: '모든 형식' },
    { value: 'md', label: 'Markdown' },
    { value: 'pdf', label: 'PDF' },
    { value: 'mp3', label: '오디오' }
  ];

  return (
    <div className="w-[90vw] max-w-6xl mx-auto bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-emerald-400 mb-1">자료목록</h2>
        <p className="text-gray-400 text-sm">자료를 검색, 필터링, 페이지별로 확인할 수 있습니다.</p>
      </div>
      {/* 상단: 검색/필터 */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="자료 검색..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
          />
        </div>
        <select
          value={syncFilter}
          onChange={e => setSyncFilter(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
        >
          <option value="all">모든 상태</option>
          <option value="synced">동기화됨</option>
          <option value="pending">대기중</option>
          <option value="conflict">충돌</option>
        </select>
        <select
          value={fileTypeFilter}
          onChange={e => setFileTypeFilter(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
        >
          {fileTypeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
        >
          <option value={10}>10개</option>
          <option value={20}>20개</option>
          <option value={30}>30개</option>
        </select>
      </div>
      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full mx-auto">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-300 w-[30%] whitespace-nowrap">제목</th>
              <th className="text-left py-3 px-4 font-medium text-gray-300 w-[15%] whitespace-nowrap">구분</th>
              <th className="text-left py-3 px-4 font-medium text-gray-300 w-[10%] whitespace-nowrap">미리보기</th>
              <th className="text-left py-3 px-4 font-medium text-gray-300 w-[25%] whitespace-nowrap">파일명</th>
              <th className="text-left py-3 px-4 font-medium text-gray-300 w-[20%] whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((m, index) => (
              <tr
                key={m.local_id}
                className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${
                  index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/60'
                }`}
              >
                <td className="py-4 px-4">
                  <div>
                    <div className="font-medium text-white truncate max-w-[200px]" title={m.title}>
                      {m.title}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {getSyncStatusBadge(m.sync_status)}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span
                    className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs truncate max-w-[100px] inline-block"
                    title={m.bible_book || '일반자료'}
                  >
                    {m.bible_book || '일반자료'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => onPreview?.(m)}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                  </button>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-300 font-mono truncate max-w-[150px] block" title={m.file_name}>
                    {m.file_name}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    {m.is_editable && (
                      <button
                        onClick={() => onEdit?.(m)}
                        className="p-1 hover:bg-gray-600 rounded transition-colors group"
                        title="편집"
                      >
                        <Edit className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors" />
                      </button>
                    )}
                    <button
                      onClick={() => onDownload?.(m)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors group"
                      title="다운로드"
                    >
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </button>
                    <button
                      onClick={() => onDelete?.(m)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors group"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paged.length === 0 && (
          <div className="text-center py-12">
            <File className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">등록된 자료가 없습니다.</p>
          </div>
        )}
      </div>
      {/* 페이지네이션 */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <div>
          전체 {total}개 | {page}/{totalPages} 페이지
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >이전</button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            className="px-2 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >다음</button>
        </div>
      </div>
    </div>
  );
};

export default TableFormAdvanced; 