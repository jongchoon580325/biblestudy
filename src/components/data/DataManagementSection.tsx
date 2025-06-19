'use client';
import React, { useState } from 'react';
import UploadForm, { UploadFileInfo } from './UploadForm';
import DataTableForm from './DataTableForm';
import { useMaterialsStore } from '@/store/materialsStore';

/**
 * 등록자료 폼 + 등록목록 폼을 조합한 통합 관리 섹션
 * - 상단: 자료등록(업로드) 섹션
 * - 하단: 자료목록(테이블) 섹션
 * - 상태/핸들러를 상위에서 관리, 각 폼에 props로 전달
 */
const DataManagementSection: React.FC = () => {
  // 파일 업로드 상태
  const [selectedFiles, setSelectedFiles] = useState<UploadFileInfo[]>([]);
  // zustand 스토어 연동
  const { materials, addMaterial, removeMaterial } = useMaterialsStore();

  // 파일 업로드 핸들러: category는 '일반자료'로 강제 지정, 전체자료실에도 반영
  const handleUpload = async () => {
    for (const [idx, file] of selectedFiles.entries()) {
      let content = '';
      if (file.file instanceof File && (file.extension === 'txt' || file.extension === 'md' || file.extension === 'csv' || file.extension === 'json' || file.extension === 'html')) {
        content = await file.file.text();
      }
      addMaterial({
        id: Date.now() + idx,
        title: file.name,
        category: '일반자료',
        book: undefined,
        fileSize: file.size.replace(' MB', ''),
        uploadDate: new Date().toISOString().slice(0, 10),
        fileType: file.extension || 'txt',
        content,
      });
    }
    setSelectedFiles([]);
  };

  // 파일 삭제 핸들러
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 자료 수정/삭제/다운로드 핸들러
  const handleEdit = () => {};
  const handleDelete = (id: number) => {
    removeMaterial(id);
  };
  const handleDownload = () => {};

  return (
    <div className="space-y-12">
      {/* 상단: 자료등록(업로드) 섹션 */}
      <div className="w-[90vw] max-w-7xl mx-auto bg-gray-900 rounded-2xl py-12">
        <UploadForm
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          onUpload={handleUpload}
          onRemoveFile={handleRemoveFile}
        />
      </div>
      {/* 하단: 자료목록(테이블) 섹션 + 구분선 */}
      <div className="w-[90vw] max-w-7xl mx-auto">
        {/* 구분선 */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-black px-6 py-2">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <DataTableForm
          tableData={materials.filter(m => m.category === '일반자료')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default DataManagementSection; 