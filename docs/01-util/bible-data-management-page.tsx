import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Edit3, 
  Download,
  FolderOpen,
  Database,
  BarChart3,
  Search,
  Filter,
  Plus
} from 'lucide-react';

// 파일 정보 타입 정의
interface UploadFileInfo {
  name: string;
  size: string;
  type: string;
  file: File;
}

const BibleDataManagementPage = () => {
  const [selectedFiles, setSelectedFiles] = useState<UploadFileInfo[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // 샘플 데이터
  const [tableData, setTableData] = useState([
    {
      id: 1,
      title: "창세기 1장 주석 자료",
      category: "주석",
      fileSize: "2.5 MB",
      uploadDate: "2024-06-01"
    },
    {
      id: 2,
      title: "요한복음 강해 설교문",
      category: "설교",
      fileSize: "1.8 MB",
      uploadDate: "2024-06-02"
    },
    {
      id: 3,
      title: "시편 119편 원어 분석",
      category: "연구",
      fileSize: "3.2 MB",
      uploadDate: "2024-06-03"
    }
  ]);

  const totalFiles = tableData.length;
  const totalSize = "7.5 MB";

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newFiles: UploadFileInfo[] = Array.from(files).map((file: File) => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type,
      file: file
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (id: number) => {
    console.log('Edit item:', id);
  };

  const handleDelete = (id: number) => {
    setTableData(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 
                            rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">성경 자료 관리</h1>
              <p className="text-gray-400">파일 업로드 및 데이터 관리</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 
                             hover:bg-emerald-700 text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span>새 등록</span>
            </button>
          </div>
        </div>

        {/* 1. 자료 등록 섹션 */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8 
                        backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-6">
            <Upload className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg text-white">자료 등록</h2>
          </div>

          {/* 파일 업로드 영역 */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 ${
              dragActive 
                ? 'border-emerald-400 bg-emerald-400/5' 
                : 'border-gray-600 hover:border-emerald-500/50 hover:bg-gray-700/30'
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files && handleFiles(e.target.files)}
            />
            
            <div className="flex items-center justify-between">
              {/* 왼쪽: 아이콘 및 안내 문구 */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 
                               rounded-2xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base text-white">
                    파일을 드래그하거나 클릭하여 업로드
                  </h3>
                  <p className="text-gray-400 text-xs">
                    PDF, DOC, DOCX, TXT 파일을 지원합니다 (최대 10MB)
                  </p>
                </div>
              </div>
              
              {/* 오른쪽: 파일 선택 버튼 */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 
                           hover:bg-emerald-700 text-white rounded-lg transition-colors"
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
                  <div key={index} className="flex items-center justify-between p-3 
                                            bg-gray-700/50 rounded-lg border border-gray-600/50">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-white text-base">{file.name}</p>
                        <p className="text-gray-400 text-sm">{file.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 
                               rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                  취소
                </button>
                <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 
                                 text-white rounded-lg transition-colors">
                  업로드 시작
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-gray-900 px-6 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 자료 테이블 섹션 */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8 
                        backdrop-blur-sm">
          
          {/* 테이블 헤더 */}
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg text-white">자료 목록</h2>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
                                w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="자료 검색..."
                  className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 
                           rounded-lg text-white placeholder-gray-400 focus:outline-none 
                           focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25"
                />
              </div>
              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 
                               border border-gray-600/50 rounded-lg text-gray-300 
                               hover:text-white hover:border-emerald-500/50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>필터</span>
              </button>
            </div>
            
            {/* 파일 통계 */}
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

          {/* 테이블 */}
          <div className="overflow-hidden rounded-xl border border-gray-700/50">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50 border-b border-gray-600/50">
                  <th className="px-6 py-4 text-left text-sm text-gray-300 w-20">
                    번호
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-300">
                    제목
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-300 w-32">
                    구분
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-300 w-32">
                    파일용량
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-gray-300 w-40">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {tableData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-base text-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <span className="text-white text-base">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs 
                                     bg-emerald-400/10 text-emerald-400 border 
                                     border-emerald-400/20">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-base text-gray-300">
                      {item.fileSize}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="p-2 text-emerald-400 hover:text-emerald-300 
                                   hover:bg-emerald-400/10 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-blue-400 hover:text-blue-300 
                                   hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="다운로드"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-400 hover:text-red-300 
                                   hover:bg-red-400/10 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 테이블 하단 페이지네이션 영역 */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700/50">
            <div className="text-sm text-gray-400">
              총 {totalFiles}개 중 1-{totalFiles}개 표시
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 text-gray-400 hover:text-white transition-colors">
                이전
              </button>
              <button className="px-3 py-2 bg-emerald-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-2 text-gray-400 hover:text-white transition-colors">
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleDataManagementPage;