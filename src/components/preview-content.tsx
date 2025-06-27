import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Material } from './inputtableform';

interface PreviewContentProps {
  material: Material;
}

const PreviewContent: React.FC<PreviewContentProps> = ({ material }) => {
  const [content, setContent] = useState('');
  const [isFull, setIsFull] = useState(false);
  const ext = material.file_name.split('.').pop()?.toLowerCase() || '';

  useEffect(() => {
    if (["md","markdown","txt","html","csv"].includes(ext) && material.file_data) {
      const reader = new FileReader();
      reader.onload = () => setContent(reader.result as string);
      reader.readAsText(new Blob([material.file_data], { type: material.file_type }));
    } else if (["jpg","jpeg","png","gif","bmp","webp"].includes(ext) && material.file_data) {
      const reader = new FileReader();
      reader.onload = () => setContent(reader.result as string);
      reader.readAsDataURL(new Blob([material.file_data], { type: material.file_type }));
    } else if (ext === "pdf" && material.file_data) {
      const blob = new Blob([material.file_data], { type: material.file_type });
      setContent(URL.createObjectURL(blob));
      return () => URL.revokeObjectURL(content);
    } else {
      setContent('');
    }
    // eslint-disable-next-line
  }, [material]);

  function renderPreview(ext: string, content: string) {
    if (["md", "markdown"].includes(ext)) {
      const html = content
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\#\s(.+)/g, '<h1>$1</h1>')
        .replace(/\#\#\s(.+)/g, '<h2>$1</h2>')
        .replace(/\#\#\#\s(.+)/g, '<h3>$1</h3>');
      return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    if (ext === "html") {
      return (
        <div className="w-full h-full min-h-0 overflow-auto bg-white dark:bg-gray-900 border rounded">
          <iframe
            title="HTML 미리보기"
            srcDoc={content}
            className="w-full h-full min-h-0 border-none"
            style={{ minHeight: 0, height: '100%', width: '100%' }}
          />
        </div>
      );
    }
    if (ext === "txt" || ext === "csv") {
      return <pre className="whitespace-pre-wrap text-sm bg-gray-900 p-4 rounded border border-gray-700 overflow-x-auto">{content}</pre>;
    }
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <Image
            src={content}
            alt="이미지 미리보기"
            width={600}
            height={400}
            className="max-w-full max-h-72 rounded border border-gray-700 object-contain"
            unoptimized
          />
        </div>
      );
    }
    if (ext === "pdf") {
      return <iframe src={content} title="PDF 미리보기" className="w-full h-72 min-h-[300px] bg-white dark:bg-gray-900 border rounded" />;
    }
    return <div className="text-gray-400 text-center py-8">지원하지 않는 파일 형식입니다.</div>;
  }

  return (
    <section className={`relative w-full max-w-3xl mx-auto py-8 min-h-[70vh] ${isFull ? "fixed inset-0 z-50 bg-black/90" : ""}`}>
      {/* 상단 바 */}
      <div className="flex flex-row items-center justify-between mb-4">
        <span className="text-lg font-bold text-white">{material.file_name}</span>
        <div className="flex gap-2">
          <button onClick={() => setIsFull(true)} title="전체보기" className="p-2 rounded-full hover:bg-yellow-50 hover:text-blue-500 group">
            전체화면
          </button>
        </div>
      </div>
      {/* 미리보기 */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 min-h-[400px] flex flex-row gap-6 overflow-auto">
        <div className="w-full bg-gray-800 text-white border border-gray-700 rounded p-4 overflow-auto text-sm">
          {renderPreview(ext, content)}
        </div>
      </div>
      {/* 전체화면 모달 */}
      {isFull && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button onClick={() => setIsFull(false)} className="fixed top-6 right-10 z-50 p-3 bg-gray-800/80 rounded-full hover:bg-gray-700 transition-colors">
            <span className="text-white text-2xl">×</span>
          </button>
          <div className="relative w-[90vw] h-[80vh] bg-gray-900 rounded-xl border border-gray-700 p-8 flex flex-col items-center justify-center">
            <div className="w-full h-full overflow-auto">
              {renderPreview(ext, content)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PreviewContent; 