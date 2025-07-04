import React, { useState } from 'react';
import { Eye, Edit, Download, Check, AlertCircle, Clock, RefreshCw, X, File } from 'lucide-react';
import type { Material } from './inputtableform';

// TableForm 컴포넌트 Props 타입
interface TableFormProps {
  materials: Material[];
  onEdit?: (material: Material) => void;
  onDownload?: (material: Material) => void;
  onPreview?: (material: Material) => void;
}

/**
 * TableForm - 자료 목록 테이블 재사용 컴포넌트
 * @param props - 자료 배열, 각종 이벤트 핸들러
 */
const TableForm: React.FC<TableFormProps> = ({
  materials,
  onEdit,
  onDownload,
  onPreview
}) => {
  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(materials.length / pageSize));
  const pagedMaterials = materials.slice((page - 1) * pageSize, page * pageSize);

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

  return (
    <div className="overflow-x-auto w-full max-w-full">
      <table className="w-full mx-auto">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-2 px-4 font-medium text-gray-300 w-[25%] whitespace-nowrap">제목</th>
            <th className="text-left py-2 px-4 font-medium text-gray-300 w-[13%] whitespace-nowrap">구분</th>
            <th className="text-left py-2 px-4 font-medium text-gray-300 w-[10%] whitespace-nowrap">미리보기</th>
            <th className="text-left py-2 px-4 font-medium text-gray-300 w-[17%] whitespace-nowrap">파일명</th>
            <th className="text-left py-2 px-4 font-medium text-gray-300 w-[15%] whitespace-nowrap">상태</th>
            <th className="text-left py-2 px-4 font-medium text-gray-300 w-[20%] whitespace-nowrap">관리</th>
          </tr>
        </thead>
        <tbody>
          {pagedMaterials.map((material, index) => (
            <tr
              key={material.local_id}
              className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${
                index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/60'
              }`}
            >
              <td className="py-2 px-4">
                <div>
                  <div className="font-normal text-white text-base truncate max-w-[200px]" title={material.title}>
                    {material.title}
                  </div>
                </div>
              </td>
              <td className="py-2 px-4">
                <span
                  className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs truncate max-w-[100px] inline-block"
                  title={material.bible_book || '일반자료'}
                >
                  {material.bible_book || '일반자료'}
                </span>
              </td>
              <td className="py-2 px-4">
                <button
                  onClick={() => onPreview?.(material)}
                  className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                </button>
              </td>
              <td className="py-2 px-4">
                <span className="text-sm text-gray-300 font-mono truncate max-w-[150px] block" title={material.file_name}>
                  {material.file_name}
                </span>
              </td>
              <td className="py-2 px-4">
                {getSyncStatusBadge(material.sync_status)}
              </td>
              <td className="py-2 px-4">
                <div className="flex items-center space-x-2">
                  {material.is_editable && (
                    <button
                      onClick={() => onEdit?.(material)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors group"
                      title="편집"
                    >
                      <Edit className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors" />
                    </button>
                  )}
                  <button
                    onClick={() => onDownload?.(material)}
                    className="p-1 hover:bg-gray-600 rounded transition-colors group"
                    title="다운로드"
                  >
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {materials.length === 0 && (
        <div className="text-center py-12">
          <File className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">등록된 자료가 없습니다.</p>
        </div>
      )}
      {/* 페이지네이션 + 페이지사이즈 드롭다운 */}
      <div className="flex justify-end items-center mt-2 gap-2 border-t bg-inherit pt-3">
        <nav className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-2 py-1 rounded ${page === i + 1 ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'} font-semibold text-sm hover:bg-emerald-400 hover:text-white transition-all`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
        <select
          className="ml-4 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
        >
          <option value={10}>10개</option>
          <option value={20}>20개</option>
          <option value={30}>30개</option>
        </select>
      </div>
    </div>
  );
};

export default TableForm; 