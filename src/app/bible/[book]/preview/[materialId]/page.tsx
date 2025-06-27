"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Download, Maximize2, Pencil } from "lucide-react";
import Image from "next/image";
import { openHybridDB } from "@/utils/storage-utils";
import { MaterialRecord } from "@/types/storage.types";

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const materialId = params?.materialId as string;
  const [material, setMaterial] = useState<MaterialRecord | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [content, setContent] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadName, setDownloadName] = useState("");

  // IndexedDB에서 자료 조회
  useEffect(() => {
    if (!materialId) return;
    openHybridDB().then(db => {
      const tx = db.transaction("materials", "readonly");
      const req = tx.objectStore("materials").get(materialId);
      req.onsuccess = () => {
        const found = req.result as MaterialRecord | undefined;
        if (found) {
          setMaterial(found);
          // 파일 확장자별로 content 추출
          const ext = found.file_name.split('.').pop()?.toLowerCase() || '';
          if (["md","markdown","txt","html","csv"].includes(ext)) {
            // 텍스트 파일: file_data → text 변환
            if (found.file_data) {
              const reader = new FileReader();
              reader.onload = () => setContent(reader.result as string);
              reader.readAsText(new Blob([found.file_data], { type: found.file_type }));
            } else {
              setContent("");
            }
          } else if (["jpg","jpeg","png","gif","bmp","webp"].includes(ext)) {
            // 이미지: file_data → dataURL 변환
            if (found.file_data) {
              const reader = new FileReader();
              reader.onload = () => setContent(reader.result as string);
              reader.readAsDataURL(new Blob([found.file_data], { type: found.file_type }));
            } else {
              setContent("");
            }
          } else if (ext === "pdf") {
            // PDF: Blob URL
            if (found.file_data) {
              const blob = new Blob([found.file_data], { type: found.file_type });
              setContent(URL.createObjectURL(blob));
            } else {
              setContent("");
            }
          } else {
            setContent("");
          }
        } else {
          setMaterial(null);
        }
      };
      req.onerror = () => setMaterial(null);
    });
  }, [materialId]);

  if (!material) {
    return (
      <section className="w-full max-w-3xl mx-auto py-16 min-h-[60vh] flex flex-col items-center justify-center">
        <span className="text-lg text-gray-400">자료를 찾을 수 없습니다. (404)</span>
        <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-emerald-500 text-white rounded">돌아가기</button>
      </section>
    );
  }

  // 확장자 판별(파일명, fileType 모두 고려)
  const ext = material.file_name.split('.').pop()?.toLowerCase() || '';
  const editable = ["md", "markdown", "txt", "html", "csv"].includes(ext) || ["md", "markdown", "txt", "html", "csv"].includes((material.file_type || '').toLowerCase());

  // 전체보기 ESC 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isFull && (e.key === "Escape")) setIsFull(false);
  };

  // 확장자별 미리보기 렌더러
  function renderPreview(ext: string, content: string) {
    if (["md", "markdown"].includes(ext)) {
      // 마크다운 최소 렌더링
      const html = content
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\#\s(.+)/g, '<h1>$1</h1>')
        .replace(/\#\#\s(.+)/g, '<h2>$1</h2>')
        .replace(/\#\#\#\s(.+)/g, '<h3>$1</h3>');
      return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    if (ext === "html") {
      // 부모 div에 overflow-auto, iframe은 h-full w-full min-h-0
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
    // 이미지
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
    // PDF
    if (ext === "pdf") {
      return <iframe src={content} title="PDF 미리보기" className="w-full h-72 min-h-[300px] bg-white dark:bg-gray-900 border rounded" />;
    }
    return <div className="text-gray-400 text-center py-8">지원하지 않는 파일 형식입니다.</div>;
  }

  return (
    <section className={`relative w-full max-w-3xl mx-auto py-8 min-h-[70vh] ${isFull ? "fixed inset-0 z-50 bg-black/90" : ""}`} tabIndex={0} onKeyDown={handleKeyDown}>
      {/* 1단: 상단 바 */}
      <div className="flex flex-row items-center justify-between mb-4">
        <button onClick={() => router.back()} className="p-2"><ArrowLeft className="w-6 h-6 text-gray-400 hover:text-emerald-400" /></button>
        <span className="text-lg font-bold text-white">{material.file_name}</span>
        <div className="w-10" />
      </div>
      {/* 2단: 액션 바 */}
      <div className="flex flex-row items-center justify-between mb-4">
        <div className="flex gap-3">
          <button
            onClick={editable ? () => setIsEdit(v => !v) : undefined}
            disabled={!editable}
            title={editable ? "수정" : "수정 불가"}
            className={`p-2 rounded-full group ${editable ? "hover:bg-emerald-50 hover:text-blue-500" : "opacity-40 cursor-not-allowed"}`}
          >
            <Pencil className={`w-5 h-5 text-white group-hover:text-blue-500 transition-colors`} />
          </button>
          <button
            title="다운로드"
            className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-500 group"
            onClick={() => { setDownloadName(material.file_name); setShowDownloadModal(true); }}
          >
            <Download className="w-5 h-5 text-white group-hover:text-blue-500 transition-colors" />
          </button>
          <button onClick={() => setIsFull(true)} title="전체보기" className="p-2 rounded-full hover:bg-yellow-50 hover:text-blue-500 group">
            <Maximize2 className="w-5 h-5 text-white group-hover:text-blue-500 transition-colors" />
          </button>
        </div>
        <span className="text-xs text-green-400 font-semibold">동기화됨</span>
      </div>
      {/* 3단: 미리보기/편집기 */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 min-h-[640px] h-[640px] flex flex-row gap-6 overflow-auto">
        {isEdit && editable ? (
          <>
            {/* 좌: 소스편집기 */}
            <textarea
              className="w-1/2 h-[640px] min-h-[640px] bg-black text-white border border-emerald-400 rounded p-2 text-sm font-mono resize-none"
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) setIsEdit(false); }}
            />
            {/* 우: 실시간 미리보기 */}
            <div className="w-1/2 h-[640px] min-h-[640px] bg-gray-800 text-white border border-gray-700 rounded p-2 overflow-auto text-sm">
              {renderPreview(ext, content)}
            </div>
          </>
        ) : (
          // 미리보기(랜더링)만 보여줌
          <div className="w-full h-[640px] min-h-[640px] bg-gray-800 text-white border border-gray-700 rounded p-4 overflow-auto text-sm">
            {renderPreview(ext, content)}
          </div>
        )}
      </div>
      {/* 전체보기 모달 */}
      {isFull && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          {/* X 버튼을 모달 바깥, 최상단에 고정 */}
          <button onClick={() => setIsFull(false)} className="fixed top-6 right-10 z-50 p-3 bg-gray-800/80 rounded-full hover:bg-gray-700 transition-colors">
            <span className="text-white text-2xl">×</span>
          </button>
          <div className="relative w-[90vw] h-[80vh] bg-gray-900 rounded-xl border border-gray-700 p-8 flex flex-col items-center justify-center">
            <div className="w-full h-full overflow-auto">
              {/* 확대보기에서도 랜더링 미리보기만 보여줌 */}
              {renderPreview(ext, content)}
            </div>
          </div>
        </div>
      )}
      {/* 다운로드 예쁜 모달 */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 min-w-[320px] flex flex-col items-center">
            <Download className="w-10 h-10 text-blue-500 mb-2 mx-auto" />
            <div className="text-lg font-bold mb-2 text-center">다운로드 하시겠습니까?</div>
            <div className="text-gray-500 text-sm text-center mb-2">{material.title} ({material.file_name})</div>
            <input
              type="text"
              className="w-full px-3 py-2 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center mb-4"
              value={downloadName}
              onChange={e => setDownloadName(e.target.value)}
              placeholder="저장할 파일명을 입력하세요"
            />
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => {
                  // 다운로드 실행
                  const file = material.file_data ?? new ArrayBuffer(0);
                  const blob = new Blob([file], { type: material.file_type });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = material.file_name;
                  document.body.appendChild(a);
                  a.click();
                  setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }, 100);
                  setShowDownloadModal(false);
                }}
                className="px-4 py-2 rounded bg-emerald-500 text-white font-semibold hover:bg-emerald-600 shadow"
              >확인</button>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 shadow"
              >취소</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
} 