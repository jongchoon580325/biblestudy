'use client';
import { useParams, useRouter } from 'next/navigation';
import { useMaterialsStore } from '@/store/materialsStore';
import BibleFileDetail from '@/components/data/BibleFileDetail';
import React from 'react';

export default function BibleMaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { materials } = useMaterialsStore();
  const id = params.id ? Number(params.id) : undefined;
  const fileData = materials.find((m) => m.id === id);

  if (!fileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h2 className="text-2xl font-bold mb-4">자료를 찾을 수 없습니다.</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
        >
          뒤로가기
        </button>
      </div>
    );
  }

  // BibleFileDetailData 타입에 맞게 변환 (content 등 기본값 보완)
  const detailData = {
    title: fileData.title,
    category: fileData.category,
    fileSize: fileData.fileSize,
    uploadDate: fileData.uploadDate,
    fileType: fileData.fileType || '',
    content: fileData.content || '', // 업로드 시 저장된 본문 전달
  };

  return (
    <BibleFileDetail fileData={detailData} onBack={() => router.back()} />
  );
} 