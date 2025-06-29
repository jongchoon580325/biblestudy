// 전체자료실(통합 테이블) 페이지
'use client';
import React, { useState, useEffect } from 'react';
import TableForm from '../../components/tableform';
import { Search } from 'lucide-react';
import { HybridStorageService } from "@/utils/storage-utils";
import { Material } from "@/components/inputtableform";
import PreviewContent from '../../components/preview-content';

// 미리보기 모달 - filepreview-advanced 기반
function PreviewModal({ material, onClose }: { material: Material, onClose: () => void }) {
  // material에서 ext, content 등 추출 로직은 PreviewContent 내부에서 처리하도록 위임
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 min-w-[320px] max-w-3xl w-full flex flex-col items-center">
        <div className="w-full">
          <PreviewContent material={material} />
        </div>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded">닫기</button>
      </div>
    </div>
  );
}

export default function AllMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'bible'|'general'>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [downloadTarget, setDownloadTarget] = useState<Material | null>(null);

  // 카운트 계산
  const bibleCount = materials.filter(m => m.category_type === 'bible').length;
  const generalCount = materials.filter(m => m.category_type === 'general').length;
  const totalCount = materials.length;

  // 마운트 시 IndexedDB에서 전체 자료 불러오기
  useEffect(() => {
    HybridStorageService.getAllMaterials().then((all) => {
      setMaterials(all.map(mat => ({ ...mat, is_editable: false })));
    });
  }, []);

  // 파일 다운로드 실행
  function handleDownload(material: Material) {
    if (!material.file_data) return;
    const blob = new Blob([material.file_data], { type: material.file_type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = material.file_name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

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
      <TableForm materials={materials} onPreview={setSelectedMaterial} onDownload={setDownloadTarget} />
      {/* 미리보기 모달 */}
      {selectedMaterial && (
        <PreviewModal material={selectedMaterial} onClose={() => setSelectedMaterial(null)} />
      )}
      {/* 다운로드 확인 모달 */}
      {downloadTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 min-w-[320px] max-w-md w-full flex flex-col items-center">
            <div className="text-lg font-bold mb-4 text-center">파일 다운로드</div>
            <div className="mb-6 text-center text-gray-800 dark:text-gray-200">
              <span className="font-semibold">{downloadTarget.file_name}</span> 파일을 다운로드하시겠습니까?
            </div>
            <div className="flex gap-4">
              <button onClick={() => { handleDownload(downloadTarget); setDownloadTarget(null); }} className="px-4 py-2 bg-emerald-500 text-white rounded">확인</button>
              <button onClick={() => setDownloadTarget(null)} className="px-4 py-2 bg-gray-400 text-white rounded">취소</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 