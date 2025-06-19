import React, { useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, FolderOpen, FileText, Trash2 } from 'lucide-react';

export interface UploadFileInfo {
  name: string;
  size: string;
  type: string;
  file: File;
  extension?: string; // 파일 확장자(자동 추출)
}

interface UploadFormProps {
  selectedFiles: UploadFileInfo[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<UploadFileInfo[]>>;
  onUpload?: () => void;
  onRemoveFile?: (index: number) => void;
}

/**
 * 파일 업로드(등록자료) 폼 - 드래그&드롭, 파일 선택, 파일 목록, 삭제, 업로드 버튼 제공
 */
const UploadForm: React.FC<UploadFormProps> = ({
  selectedFiles,
  setSelectedFiles,
  onUpload,
  onRemoveFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  // 드래그 이벤트 핸들러
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // 드롭 이벤트 핸들러
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // 파일 선택/드롭 시 파일 목록에 추가
  const handleFiles = (files: FileList) => {
    const newFiles: UploadFileInfo[] = Array.from(files).map(file => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type,
      file: file,
      extension: file.name.split('.').pop()?.toLowerCase() || 'txt', // 확장자 자동 추출
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  // 파일 삭제
  const removeFile = (index: number) => {
    if (onRemoveFile) return onRemoveFile(index);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
      <div className="flex items-center space-x-3 mb-6">
        <Upload className="w-6 h-6 text-emerald-400" />
        <h2 className="text-lg text-white">자료 등록</h2>
      </div>
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 ${
          dragActive ? 'border-emerald-400 bg-emerald-400/5' : 'border-gray-600 hover:border-emerald-500/50 hover:bg-gray-700/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base text-white">파일을 드래그하거나 클릭하여 업로드</h3>
              <p className="text-gray-400 text-xs">PDF, DOC, DOCX, TXT 파일을 지원합니다 (최대 10MB)</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">파일 선택</span>
            </button>
          </div>
        </div>
      </div>
      {/* 선택된 파일 목록 */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-base text-white">선택된 파일 ({selectedFiles.length}개)</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-white text-base">{file.name}</p>
                    <p className="text-gray-400 text-sm">{file.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors">취소</button>
            <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors" onClick={onUpload}>업로드 시작</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadForm; 