'use client';
import PageHeader from '@/components/layout/PageHeader';
import BibleTestamentSection from '@/components/data/BibleTestamentSection';
import DataTableForm from '@/components/data/DataTableForm';
import UploadForm, { UploadFileInfo } from '@/components/data/UploadForm';
import { useMaterialsStore } from '@/store/materialsStore';
import { BookOpen, Scroll, ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';

export default function BibleMaterialsPage() {
  const oldTestament = [
    '창세기', '출애굽기', '레위기', '민수기', '신명기',
    '여호수아', '사사기', '룻기', '사무엘상', '사무엘하',
    '열왕기상', '열왕기하', '역대상', '역대하', '에스라',
    '느헤미야', '에스더', '욥기', '시편', '잠언',
    '전도서', '아가', '이사야', '예레미야', '예레미야애가',
    '에스겔', '다니엘', '호세아', '요엘', '아모스',
    '오바댜', '요나', '미가', '나훔', '하박국',
    '스바냐', '학개', '스가랴', '말라기'
  ];
  const newTestament = [
    '마태복음', '마가복음', '누가복음', '요한복음', '사도행전',
    '로마서', '고린도전서', '고린도후서', '갈라디아서', '에베소서',
    '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서',
    '디모데후서', '디도서', '빌레몬서', '히브리서', '야고보서',
    '베드로전서', '베드로후서', '요한일서', '요한이서', '요한삼서',
    '유다서', '요한계시록'
  ];
  // 선택된 book 상태
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  // 업로드 파일 상태
  const [selectedFiles, setSelectedFiles] = useState<UploadFileInfo[]>([]);
  // zustand에서 자료 불러오기
  const { materials, addMaterial, removeMaterial } = useMaterialsStore();

  // 책 클릭 시 book명으로 상태 변경
  const handleBookClick = (book: string) => {
    setSelectedBook(book);
  };
  // 뒤로가기(책 선택 화면)
  const handleBack = () => setSelectedBook(null);

  // 선택된 book 자료만 필터링
  const filteredMaterials = selectedBook
    ? materials.filter((m) => m.book === selectedBook)
    : [];

  // 성경자료 업로드 핸들러
  const handleBibleUpload = async () => {
    if (!selectedBook) return;
    for (const [idx, file] of selectedFiles.entries()) {
      let content = '';
      // 텍스트/HTML 파일 본문 읽기
      if (file.file instanceof File && (file.extension === 'txt' || file.extension === 'md' || file.extension === 'csv' || file.extension === 'json' || file.extension === 'html')) {
        content = await file.file.text();
      }
      addMaterial({
        id: Date.now() + idx,
        title: file.name,
        category: '성경자료',
        book: selectedBook,
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
    <div className="min-h-screen bg-black px-2 sm:px-4 md:px-8">
      <PageHeader
        title="성경자료실"
        description="구약과 신약 성경 자료를 한눈에 확인할 수 있습니다."
        color="green"
      />
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
      <div className="max-w-7xl mx-auto space-y-12">
        {/* 책 선택 화면 */}
        {!selectedBook && (
          <>
            <BibleTestamentSection
              title="구약 (Old Testament)"
              books={oldTestament}
              testament="old"
              icon={Scroll}
              gradient="from-amber-600/20 to-orange-600/20"
              onBookClick={handleBookClick}
            />
            <BibleTestamentSection
              title="신약 (New Testament)"
              books={newTestament}
              testament="new"
              icon={BookOpen}
              gradient="from-emerald-600/20 to-teal-600/20"
              onBookClick={handleBookClick}
            />
          </>
        )}
        {/* 선택된 book 자료등록+목록 섹션 */}
        {selectedBook && (
          <div className="space-y-12">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBack}
                className="flex items-center px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-300 hover:text-white hover:border-emerald-500/50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>책 선택으로 돌아가기</span>
              </button>
              <h2 className="text-2xl font-bold text-white">{selectedBook} 자료 등록 및 목록</h2>
            </div>
            {/* 상단: 자료등록(업로드) 섹션 */}
            <div className="w-full max-w-7xl mx-auto bg-gray-900 rounded-2xl py-8 sm:py-12 px-2 sm:px-4">
              <UploadForm
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                onUpload={handleBibleUpload}
                onRemoveFile={handleRemoveFile}
              />
            </div>
            {/* 하단: 자료목록(테이블) 섹션 + 구분선 */}
            <div className="w-full max-w-7xl mx-auto">
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
                tableData={filteredMaterials}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 