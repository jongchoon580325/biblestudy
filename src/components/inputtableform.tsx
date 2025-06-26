import React, { useState, useRef, useCallback } from 'react';
import {
  CloudUpload, File, Eye, Edit, Trash2, Download, X, Check, AlertCircle, Clock, RefreshCw
} from 'lucide-react';

// 자료 타입 정의
export interface Material {
  local_id: string;
  server_id?: string;
  title: string;
  description?: string;
  category_type: 'bible' | 'general';
  bible_book?: string;
  category_id?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url?: string;
  thumbnail_url?: string;
  content?: string;
  is_editable: boolean;
  tags: string[];
  sync_status: 'synced' | 'pending' | 'syncing' | 'conflict' | 'error';
  storage_location: 'local' | 'server' | 'both';
  created_at: Date;
  updated_at: Date;
}

export interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
  local_id: string;
}

// 컴포넌트 Props 타입
interface InputTableFormProps {
  materials: Material[];
  onMaterialsChange: (materials: Material[]) => void;
  uploadFiles?: UploadFile[];
  onUploadFilesChange?: (files: UploadFile[]) => void;
  onFileUpload?: (files: File[], formData: Record<string, unknown>) => void;
  formData: {
    title: string;
    description: string;
    category_type: 'bible' | 'general';
    bible_book: string;
    category_id: string;
    tags: string;
  };
  onFormDataChange: (formData: Record<string, unknown>) => void;
  selectedBook: string;
  hideInputForm?: boolean;
  // 기타: 검색/필터/뷰모드 등 필요시 추가
}

/**
 * InputTableForm - 자료 입력/업로드/목록 관리 재사용 컴포넌트
 * @param props - 상위에서 데이터/이벤트 핸들링을 주입받음
 */
const InputTableForm: React.FC<InputTableFormProps> = ({
  materials,
  onMaterialsChange,
  uploadFiles = [],
  onUploadFilesChange,
  onFileUpload,
  formData,
  onFormDataChange,
  selectedBook,
  hideInputForm,
}) => {
  // 내부 상태: 드래그, 편집, 모달 등
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{title: string; description: string}>({title: '', description: ''});
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'download' | 'preview' | null;
    item: Material | null;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: null,
    item: null,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 드래그 앤 드롭
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    onFileUpload?.(files, formData);
  }, [onFileUpload, formData]);
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileUpload?.(files, formData);
  };

  // 인라인 편집
  const startEdit = (material: Material) => {
    setEditingItem(material.local_id);
    setEditForm({
      title: material.title,
      description: material.description || ''
    });
  };
  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({title: '', description: ''});
  };
  const saveEdit = (materialId: string) => {
    onMaterialsChange(
      materials.map(material =>
        material.local_id === materialId
          ? { ...material, title: editForm.title, description: editForm.description, updated_at: new Date() }
          : material
      )
    );
    setEditingItem(null);
    setEditForm({title: '', description: ''});
  };
  const handleEditKeyDown = (e: React.KeyboardEvent, materialId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit(materialId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  // 모달
  const openModal = (type: 'delete' | 'download' | 'preview', item: Material) => {
    const modalConfigs = {
      delete: {
        title: '자료 삭제',
        message: `"${item.title}" 자료를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
        onConfirm: () => deleteMaterial(item.local_id)
      },
      download: {
        title: '파일 다운로드',
        message: `"${item.file_name}" 파일을 다운로드하시겠습니까?`,
        onConfirm: () => downloadFile()
      },
      preview: {
        title: '미리보기 열기',
        message: `"${item.title}" 자료를 미리보기로 열까요?`,
        onConfirm: () => openPreview()
      }
    };
    const config = modalConfigs[type];
    setModal({
      isOpen: true,
      type,
      item,
      title: config.title,
      message: config.message,
      onConfirm: config.onConfirm
    });
  };
  const closeModal = () => {
    setModal({
      isOpen: false,
      type: null,
      item: null,
      title: '',
      message: '',
      onConfirm: () => {}
    });
  };
  const deleteMaterial = (materialId: string) => {
    onMaterialsChange(materials.filter(material => material.local_id !== materialId));
    closeModal();
  };
  const downloadFile = () => {
    // 실제 다운로드 로직 필요시 구현
    closeModal();
  };
  const openPreview = () => {
    // 실제 미리보기 로직 필요시 구현
    closeModal();
  };

  // 유틸
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
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

  // 렌더링
  return (
    <div className="w-[85vw] max-w-6xl mx-auto flex gap-6 justify-center">
      {/* 좌: 입력/업로드 */}
      {!hideInputForm && (
        <div className="w-[40%] bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-indigo-400">자료 저장</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">선택된 책:</span>
              <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-sm font-medium">
                {selectedBook}
              </span>
            </div>
          </div>
          <div className="space-y-6">
            {/* 기본 정보 입력 */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => onFormDataChange({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  placeholder="자료 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">구분</label>
                <input
                  type="text"
                  value={formData.category_type === 'bible' ? selectedBook : '일반자료'}
                  disabled
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-600 rounded-lg text-gray-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">설명</label>
              <textarea
                value={formData.description}
                onChange={e => onFormDataChange({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                placeholder="자료에 대한 설명을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">태그</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => onFormDataChange({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                placeholder="태그를 입력하세요 (쉼표로 구분)"
              />
            </div>
            {/* 파일 업로드 */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                isDragOver ? 'border-indigo-400 bg-indigo-500/10' : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                파일을 여기에 드래그하거나 클릭하여 업로드
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                지원 형식: HTML, TXT, CSV, MD, PDF, 이미지, 오디오, 비디오
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                파일 선택
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".html,.txt,.csv,.md,.pdf,.jpg,.jpeg,.png,.gif,.mp3,.wav,.mp4,.mov"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
            {/* 업로드 진행 상황 */}
            {uploadFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">업로드 진행 상황</h4>
                {uploadFiles.map((upload) => (
                  <div key={upload.local_id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">{upload.file.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">{formatFileSize(upload.file.size)}</span>
                        <button
                          onClick={() => onUploadFilesChange?.(uploadFiles.filter(u => u.local_id !== upload.local_id))}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`$ {
                        upload.status === 'completed' ? 'text-green-400' :
                        upload.status === 'failed' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {upload.status === 'completed' ? '업로드 완료' :
                          upload.status === 'failed' ? '업로드 실패' :
                          upload.status === 'uploading' ? '업로드 중...' : '대기 중'}
                      </span>
                      <span className="text-gray-400">{upload.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* 우: 자료 목록 */}
      <div className="w-full bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-emerald-400 mb-1">자료 목록</h2>
            <p className="text-sm text-gray-400">
              총 {materials.length}개 | 로컬: {materials.filter(m => m.storage_location !== 'server').length}개 | 
              서버: {materials.filter(m => m.storage_location !== 'local').length}개
            </p>
          </div>
        </div>
        {/* 자료 목록 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full">
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
              {materials.map((material, index) => (
                <tr
                  key={material.local_id}
                  className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${
                    index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/60'
                  }`}
                >
                  <td className="py-4 px-4">
                    {editingItem === material.local_id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          onKeyDown={e => handleEditKeyDown(e, material.local_id)}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                          autoFocus
                        />
                        <textarea
                          value={editForm.description}
                          onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          onKeyDown={e => handleEditKeyDown(e, material.local_id)}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                          rows={2}
                          placeholder="설명"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveEdit(material.local_id)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            저장
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-white truncate max-w-[200px]" title={material.title}>
                          {material.title}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {getSyncStatusBadge(material.sync_status)}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs truncate max-w-[100px] inline-block"
                      title={material.bible_book || '일반자료'}
                    >
                      {material.bible_book || '일반자료'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => openModal('preview', material)}
                      className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-300 font-mono truncate max-w-[150px] block" title={material.file_name}>
                      {material.file_name}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {material.is_editable && editingItem !== material.local_id && (
                        <button
                          onClick={() => startEdit(material)}
                          className="p-1 hover:bg-gray-600 rounded transition-colors group"
                          title="편집"
                        >
                          <Edit className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors" />
                        </button>
                      )}
                      <button
                        onClick={() => openModal('download', material)}
                        className="p-1 hover:bg-gray-600 rounded transition-colors group"
                        title="다운로드"
                      >
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      </button>
                      <button
                        onClick={() => openModal('delete', material)}
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
          {materials.length === 0 && (
            <div className="text-center py-12">
              <File className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">등록된 자료가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
      {/* 모달 */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-full ${
                modal.type === 'delete' ? 'bg-red-500/20' :
                modal.type === 'download' ? 'bg-indigo-500/20' : 'bg-blue-500/20'
              }`}>
                {modal.type === 'delete' ? (
                  <Trash2 className="w-5 h-5 text-red-400" />
                ) : modal.type === 'download' ? (
                  <Download className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Eye className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-white">{modal.title}</h3>
            </div>
            <p className="text-gray-300 mb-6 whitespace-pre-line">{modal.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={modal.onConfirm}
                className={`px-4 py-2 rounded-lg transition-colors text-white ${
                  modal.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputTableForm;
// 사용 예시 및 상세 설명은 README 또는 별도 문서 참고 