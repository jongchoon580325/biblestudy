"use client";

import PageHeader from '@/components/layout/PageHeader';
import CategoryManagement from '@/components/category/CategoryManagement';
import { useState, useRef } from 'react';
import { useCategoryExportImport } from '@/hooks/useCategoryExportImport';
import CuteConfirmModal from '@/components/common/CuteConfirmModal';
import Toast from '@/components/common/Toast';
import { useCategoryStore } from '@/store/categoryStore';
import { categoryGroupApi } from '@/utils/categoryApi';

export default function DataManagementPage() {
  // 내보내기/가져오기 훅
  const { handleExport, handleImport } = useCategoryExportImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달/토스트 상태
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; type?: 'success'|'error'|'info' }>({ open: false, message: '' });

  const { categories, fetchCategories } = useCategoryStore();
  const [isCategoryResetModalOpen, setIsCategoryResetModalOpen] = useState(false);

  // 내보내기 버튼 클릭 시 모달 오픈
  const onExportClick = () => setIsExportModalOpen(true);
  // 내보내기 확정 시
  const onExportConfirm = () => {
    handleExport();
    setToast({ open: true, message: '카테고리 내보내기 완료!', type: 'success' });
  };
  // 가져오기 버튼 클릭 시 파일 input 트리거
  const onImportClick = () => fileInputRef.current?.click();
  // 파일 선택 시
  const onImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImport(e);
    setToast({ open: true, message: '카테고리 가져오기 완료!', type: 'success' });
    // 파일 input 초기화 (동일 파일 연속 업로드 허용)
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onCategoryReset = async () => {
    try {
      // 모든 그룹을 Supabase에서 삭제
      for (const group of categories) {
        await categoryGroupApi.delete(group.id);
      }
      await fetchCategories();
      setToast({ open: true, message: '카테고리 초기화 완료!', type: 'success' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '카테고리 초기화 실패';
      setToast({ open: true, message, type: 'error' });
    }
    setIsCategoryResetModalOpen(false);
  };

  return (
    <>
      <section className="sticky top-0 z-30 bg-background/80 backdrop-blur">
        <PageHeader
          title="데이터관리"
          description="시스템 데이터 관리를 통해 안전한 백업과 복구를 할 수 있습니다."
          color="pink"
        />
      </section>
      {/* 본문 5:5 그리드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
        {/* 좌측: 카테고리 관리 */}
        <CategoryManagement />
        {/* 우측: 데이터 관리 섹션 */}
        <section className="bg-background/70 rounded-xl border border-border p-6 flex flex-col gap-6 min-h-[260px] self-start">
          {/* 데이터 관리 타이틀 */}
          <h2 className="text-base mb-4 text-pink-400">데이터 관리</h2>
          {/* 1단: 카테고리 내보내기/가져오기 */}
          <div>
            <div className="text-base mb-2 text-blue-400">카테고리</div>
            <div className="flex gap-4 mb-2">
              <button
                className="flex-1 py-1.5 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-900 shadow transition text-sm font-normal"
                onClick={onExportClick}
              >내보내기</button>
              <button
                className="flex-1 py-1.5 rounded-lg bg-green-200 hover:bg-green-300 text-green-900 shadow transition text-sm font-normal"
                onClick={onImportClick}
              >가져오기</button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImportChange}
                accept=".csv"
                className="hidden"
              />
            </div>
          </div>
          {/* 2단: 성경자료실/일반자료실 내보내기/가져오기 */}
          <div className="flex gap-4 mb-2">
            <div className="flex flex-1 flex-col gap-2">
              <span className="text-base mb-1 text-blue-400">성경자료실</span>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-900 shadow transition text-sm font-normal">내보내기</button>
                <button className="flex-1 py-1.5 rounded-lg bg-green-200 hover:bg-green-300 text-green-900 shadow transition text-sm font-normal">가져오기</button>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <span className="text-base mb-1 text-amber-400">일반자료실</span>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-900 shadow transition text-sm font-normal">내보내기</button>
                <button className="flex-1 py-1.5 rounded-lg bg-green-200 hover:bg-green-300 text-green-900 shadow transition text-sm font-normal">가져오기</button>
              </div>
            </div>
          </div>
          {/* 3단: 데이터 초기화/카테고리 초기화 */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-base mb-1 text-red-400">데이터 초기화</span>
              <button className="w-full py-1.5 rounded-lg bg-red-200 hover:bg-red-300 text-red-900 shadow transition border-2 border-red-100 text-sm font-normal">초기화</button>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-base mb-1 text-orange-400">카테고리 초기화</span>
              <button
                className="w-full py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 shadow transition border-2 border-amber-100 text-sm font-normal"
                onClick={() => setIsCategoryResetModalOpen(true)}
              >초기화</button>
            </div>
          </div>
        </section>
      </div>
      {/* 내보내기 확인 모달 */}
      <CuteConfirmModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={onExportConfirm}
        message="정말 내보내시겠습니까? 🐰"
      />
      <CuteConfirmModal
        isOpen={isCategoryResetModalOpen}
        onClose={() => setIsCategoryResetModalOpen(false)}
        onConfirm={onCategoryReset}
        message="정말 모든 카테고리를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다. 🗑️"
        confirmText="초기화"
      />
      {/* 토스트 메시지 */}
      <Toast
        isOpen={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  );
} 