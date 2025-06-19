'use client';
import PageHeader from '@/components/layout/PageHeader';
import DataManagementSection from '@/components/data/DataManagementSection';

export default function GeneralMaterialsPage() {
  return (
    <div className="min-h-screen bg-black px-2 sm:px-4 md:px-8">
      <PageHeader
        title="일반자료실"
        description="일반 자료를 관리하는 공간입니다."
        color="amber"
      />
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-black px-6 py-2">
            <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-7xl mx-auto">
        <DataManagementSection />
      </div>
    </div>
  );
} 