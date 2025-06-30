import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MaterialRecord } from '@/types/storage.types';

interface MaterialPreviewProps {
  material: MaterialRecord;
  content: string;
  ext: string;
}

const MaterialPreview: React.FC<MaterialPreviewProps> = ({ material, content, ext }) => {
  if (["md","markdown"].includes(ext)) {
    return <div className="p-4 prose dark:prose-invert max-w-full"><ReactMarkdown>{content}</ReactMarkdown></div>;
  }
  if (["txt","csv"].includes(ext)) {
    return <pre className="p-4 bg-gray-900 text-gray-100 rounded overflow-x-auto whitespace-pre-wrap">{content}</pre>;
  }
  if (ext === "html") {
    return <div className="p-4 bg-white dark:bg-gray-900 rounded prose max-w-full" dangerouslySetInnerHTML={{ __html: content }} />;
  }
  if (["jpg","jpeg","png","gif","bmp","webp"].includes(ext)) {
    return <div className="p-4 flex justify-center"><img src={content} alt={material?.title || ''} className="max-w-full max-h-[70vh] rounded shadow" /></div>;
  }
  if (ext === "pdf") {
    return <div className="p-4 flex justify-center"><iframe src={content} title="PDF 미리보기" className="w-full h-[80vh] border rounded" /></div>;
  }
  return <div className="p-8 text-center text-gray-400">미리보기를 지원하지 않는 파일 형식입니다.</div>;
};

export default MaterialPreview; 