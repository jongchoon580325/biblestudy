import React, { useRef, useState, useCallback } from 'react';
import { CloudUpload, X } from 'lucide-react';

// 자료저장 입력값 타입
export interface InputFormAdvancedData {
  title: string;
  description: string;
  category_type: 'bible' | 'general';
  bible_book: string;
  category_id: string;
  tags: string;
}

// 업로드 파일 타입
export interface InputFormAdvancedUploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
  local_id: string;
}

// 컴포넌트 Props 타입
export interface InputFormAdvancedProps {
  formData: InputFormAdvancedData;
  onFormDataChange: (formData: InputFormAdvancedData) => void;
  uploadFiles: InputFormAdvancedUploadFile[];
  onUploadFilesChange: (files: InputFormAdvancedUploadFile[]) => void;
  onFileUpload: (files: File[], formData: InputFormAdvancedData) => void;
  selectedBook: string;
}

/**
 * InputFormAdvanced - 자료저장 입력/업로드 폼 전용 컴포넌트
 * @param props - 입력값, 파일업로드, 이벤트 핸들링
 */
const InputFormAdvanced: React.FC<InputFormAdvancedProps> = ({
  formData,
  onFormDataChange,
  uploadFiles,
  onUploadFilesChange,
  onFileUpload,
  selectedBook
}) => {
  // 드래그 상태
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 드래그 앤 드롭 핸들러
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
    onFileUpload(files, formData);
  }, [onFileUpload, formData]);
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileUpload(files, formData);
  };

  // 파일 크기 포맷터
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // 렌더링
  return (
    <div className="w-full bg-gray-800 rounded-lg border border-gray-700 p-6">
      {/* 상단: 입력폼 */}
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
                      onClick={() => onUploadFilesChange(uploadFiles.filter(u => u.local_id !== upload.local_id))}
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
  );
};

export default InputFormAdvanced;
// 사용 예시 및 상세 설명은 README 또는 별도 문서 참고 