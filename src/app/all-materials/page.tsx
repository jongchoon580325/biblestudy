import PageHeader from '@/components/layout/PageHeader';
import AllMaterialsTableSectionWrapper from '@/components/data/AllMaterialsTableSectionWrapper';
import React from 'react';

export default function AllMaterialsPage() {
  return (
    <div className="min-h-screen bg-black px-2 sm:px-4 md:px-8">
      <PageHeader
        title="전체목록자료실"
        description="이곳은 모든 자료의 전체 목록을 한눈에 볼 수 있는 공간입니다. 다양한 자료를 효율적으로 관리하세요."
        color="blue"
      />
      {/* 테이블 섹션 */}
      <div className="flex justify-center">
        <div className="w-full max-w-7xl mx-auto">
          <AllMaterialsTableSectionWrapper />
        </div>
      </div>
    </div>
  );
} 