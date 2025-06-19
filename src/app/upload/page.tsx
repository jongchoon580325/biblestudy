'use client';
import PageHeader from '@/components/layout/PageHeader';
import UploadForm, { UploadFileInfo } from '@/components/data/UploadForm';
import React, { useState } from 'react';
import { useMaterialsStore } from '@/store/materialsStore';

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<UploadFileInfo[]>([]);
  const { addMaterial } = useMaterialsStore();

  const handleUpload = async () => {
    for (const [idx, file] of selectedFiles.entries()) {
      let content = '';
      if (file.file instanceof File && (file.extension === 'txt' || file.extension === 'md' || file.extension === 'csv' || file.extension === 'json' || file.extension === 'html')) {
        content = await file.file.text();
      }
      addMaterial({
        id: Date.now() + idx,
        title: file.name,
        category: '특별자료',
        book: undefined,
        fileSize: file.size.replace(' MB', ''),
        uploadDate: new Date().toISOString().slice(0, 10),
        fileType: file.extension || 'txt',
        content,
      });
    }
    setSelectedFiles([]);
  };
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-black px-2 sm:px-4 md:px-8">
      <PageHeader
        title="자료 업로드"
        description="이곳 유용한 자료를 쉽고 빠르게 업로드를 할 수 있습니다. 첨부는 후 설명첨부를 할 지 자료업로드에서 바로 확인할 수 있습니다."
        color="purple"
      />
      <div className="flex justify-center mt-12">
        <div className="w-full max-w-7xl mx-auto">
          <UploadForm
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            onUpload={handleUpload}
            onRemoveFile={handleRemoveFile}
          />
        </div>
      </div>
    </div>
  );
} 