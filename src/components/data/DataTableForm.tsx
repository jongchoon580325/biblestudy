import React, { useState, useEffect } from 'react';
import { FileText, Edit3, Download, Trash2, BarChart3, Filter, Search } from 'lucide-react';
import Link from 'next/link';

export interface DataTableItem {
  id: number;
  title: string;
  category: string;
  fileSize: string;
  uploadDate: string;
  book?: string;
  fileType?: string;
}

interface DataTableFormProps {
  tableData: DataTableItem[];
  onEdit: (id: number, newTitle?: string) => void;
  onDelete: (id: number) => void;
  onDownload?: (id: number) => void;
}

/**
 * 자료 등록목록(테이블) 폼 - 구분선, 섹션 wrapper, 검색, 필터, 테이블, 관리(수정/삭제/다운로드) 기능 제공
 */
const DataTableForm: React.FC<DataTableFormProps> = ({
  tableData,
  onEdit,
  onDelete,
  onDownload
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState<number | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const filteredTableData = searchTerm
    ? tableData.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : tableData;
  const totalFiles = filteredTableData.length;
  const totalSize = filteredTableData.reduce((acc, cur) => {
    const size = parseFloat(cur.fileSize);
    return acc + (isNaN(size) ? 0 : size);
  }, 0).toFixed(2) + ' MB';

  // 인라인 수정 저장
  const handleEditSave = (id: number) => {
    onEdit(id, editValue);
    setEditId(null);
    setEditValue('');
    setToast({ open: true, message: '수정이 완료되었습니다.' });
  };

  // 다운로드 확인
  const handleDownloadConfirm = (id: number) => {
    if (onDownload) onDownload(id);
    setShowDownloadModal(null);
    setToast({ open: true, message: '다운로드가 시작되었습니다.' });
  };

  // 삭제 확인
  const handleDeleteConfirm = (id: number) => {
    onDelete(id);
    setShowDeleteModal(null);
    setToast({ open: true, message: '삭제가 완료되었습니다.' });
  };

  // 토스트 자동 닫기
  useEffect(() => {
    if (toast.open) {
      const timer = setTimeout(() => setToast({ open: false, message: '' }), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast.open]);

  return (
    <div className="w-[90vw] max-w-7xl mx-auto">
      {/* 자료목록 테이블 섹션 */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <h2 className="text-lg text-white">자료 목록</h2>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="자료 검색... (한글/영문 모두 지원)"
                className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25"
              />
            </div>
            <button className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-300 hover:text-white hover:border-emerald-500/50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>필터</span>
            </button>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-gray-300">파일:</span>
              <span className="text-white font-semibold">{totalFiles}개</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
              <span className="text-gray-300">용량:</span>
              <span className="text-white font-semibold">{totalSize}</span>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-700/50">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50 border-b border-gray-600/50">
                <th className="px-6 py-4 text-center text-sm text-gray-300 w-20">번호</th>
                <th className="px-6 py-4 text-center text-sm text-gray-300">제목</th>
                <th className="px-6 py-4 text-center text-sm text-gray-300 w-32">구분</th>
                <th className="px-6 py-4 text-center text-sm text-gray-300 w-32">파일용량</th>
                <th className="px-6 py-4 text-center text-sm text-gray-300 w-40">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredTableData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-base text-gray-300 text-center">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-3">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      {editId === item.id ? (
                        <input
                          className="text-white text-base bg-gray-800 border-b border-emerald-400 focus:outline-none px-2 py-1 rounded"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleEditSave(item.id);
                          }}
                          autoFocus
                        />
                      ) : (
                        <Link href={`/bible-materials/detail/${item.id}`} className="text-white text-base hover:underline cursor-pointer" title={`파일타입: ${item.fileType || '알수없음'}`}> 
                          {item.title}
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                      {item.category === '성경자료' ? item.book : item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-base text-gray-300">{item.fileSize}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {editId === item.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(item.id)}
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg transition-colors"
                            title="저장"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => { setEditId(null); setEditValue(''); }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/10 rounded-lg transition-colors"
                            title="취소"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditId(item.id); setEditValue(item.title); }}
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg transition-colors"
                            title="수정"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDownloadModal(item.id)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
                            title="다운로드"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(item.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700/50">
          <div className="text-sm text-gray-400">총 {totalFiles}개 중 1-{totalFiles}개 표시</div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-gray-400 hover:text-white transition-colors">이전</button>
            <button className="px-3 py-2 bg-emerald-600 text-white rounded">1</button>
            <button className="px-3 py-2 text-gray-400 hover:text-white transition-colors">다음</button>
          </div>
        </div>
      </div>
      {/* 삭제 모달 */}
      {showDeleteModal !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 shadow-2xl w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">자료 삭제 확인</h3>
            <div className="mb-6 text-gray-200">정말로 이 자료를 삭제하시겠습니까?</div>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600" onClick={() => setShowDeleteModal(null)}>취소</button>
              <button className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleDeleteConfirm(showDeleteModal)}>확인</button>
            </div>
          </div>
        </div>
      )}
      {/* 다운로드 모달 */}
      {showDownloadModal !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 shadow-2xl w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">자료 다운로드 확인</h3>
            <div className="mb-6 text-gray-200">이 자료를 다운로드 하시겠습니까?</div>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600" onClick={() => setShowDownloadModal(null)}>취소</button>
              <button className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleDownloadConfirm(showDownloadModal)}>확인</button>
            </div>
          </div>
        </div>
      )}
      {/* 토스트 메시지 */}
      {toast.open && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default DataTableForm; 