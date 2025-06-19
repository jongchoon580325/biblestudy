'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Edit3, 
  Eye,
  Copy,
  Download,
  Share2,
  BookOpen,
  Calendar,
  HardDrive,
  Tag,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Check,
  X
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Toast from '@radix-ui/react-toast';
import Image from 'next/image';

export interface BibleFileDetailData {
  title: string;
  category: string;
  fileSize: string;
  uploadDate: string;
  fileType: string;
  content: string;
}

interface BibleFileDetailProps {
  fileData: BibleFileDetailData;
  onBack?: () => void;
}

// HtmlCodeEditor: HTML 파일 전용 (임시 placeholder)
const HtmlCodeEditor = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <textarea
    className="w-full min-h-[300px] bg-black text-green-400 font-mono p-4 rounded border border-emerald-700"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder="HTML 코드를 입력하세요..."
  />
);

const BibleFileDetail: React.FC<BibleFileDetailProps> = ({ fileData, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showScrollbars, setShowScrollbars] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  // fileData.content를 로컬 상태로 관리 (본문/에디터 모두 이 값 사용)
  const [content, setContent] = useState(fileData.content);
  const [editContent, setEditContent] = useState(fileData.content);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showHtmlSource, setShowHtmlSource] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement | null>(null);

  // 스크롤바 필요 여부 체크
  const checkScrollbars = () => {
    if (containerRef.current && contentRef.current) {
      const container = containerRef.current;
      const content = contentRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const contentWidth = content.scrollWidth;
      const contentHeight = content.scrollHeight;
      const needsScrollbar = contentWidth > containerWidth || contentHeight > containerHeight;
      setShowScrollbars(needsScrollbar);
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkScrollbars, 100);
    return () => clearTimeout(timer);
  }, [zoomLevel, fileData]);

  useEffect(() => {
    const handleResize = () => {
      setTimeout(checkScrollbars, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(fileData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => {
      const newLevel = Math.min(prev + 25, 200);
      setTimeout(checkScrollbars, 100);
      return newLevel;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newLevel = Math.max(prev - 25, 50);
      setTimeout(checkScrollbars, 100);
      return newLevel;
    });
  };

  const goBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      // window.location.href = '/';
    }
  };

  // 다운로드 처리 (실제 파일 다운로드 로직은 별도 구현 필요)
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadModal(false);
    setToastMsg('다운로드가 시작되었습니다.');
    setShowToast(true);
  };

  // 공유 처리 (예시: 현재 페이지 링크 복사)
  const handleShare = () => {
    // 배포용 도메인 우선, 없으면 현재 origin 사용
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const shareUrl = baseUrl + window.location.pathname + window.location.search + window.location.hash;
    navigator.clipboard.writeText(shareUrl);
    setToastMsg('공유 링크가 복사되었습니다.');
    setShowToast(true);
  };

  // 파일 타입 안전 처리
  const safeFileType = fileData.fileType ? fileData.fileType.toLowerCase() : 'txt';

  // 이미지 확장자 목록
  const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
  // 텍스트 중심 확장자 목록
  const textExtensions = ['txt', 'md', 'csv', 'tsv', 'json', 'log'];

  // 소스보기 토글 시 자동으로 수정 모드 진입 (상단/하단 모두 동일하게)
  const handleHtmlSourceToggle = () => {
    setShowHtmlSource((prev) => {
      if (!prev) {
        setIsEditMode(true); // 소스보기 진입 시 수정모드 활성화
      } else {
        setIsEditMode(false); // 미리보기로 돌아갈 때 수정모드 비활성화
      }
      return !prev;
    });
  };

  // 전체화면 진입
  const handleEnterFullscreen = () => {
    const el = fullscreenRef.current;
    if (el && el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el && (el as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
      (el as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen!();
    }
  };
  // 전체화면 해제
  const handleExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if ((document as Document & { webkitFullscreenElement?: Element, webkitExitFullscreen?: () => void }).webkitFullscreenElement) {
      (document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen!();
    }
  };
  // 전체화면 상태 감지 및 Esc 키 해제 지원
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 페이지 헤더 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">자료 상세보기</h1>
              <p className="text-gray-400">선택한 성경 자료의 상세 내용을 확인하세요</p>
            </div>
          </div>
          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-black px-6 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 파일 정보 테이블 */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="flex divide-x divide-gray-700/50">
            {/* 제목 (50%) */}
            <div className="p-6 space-y-2 flex-[50]">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400 text-sm">제목</span>
              </div>
              <p className="text-white text-lg font-medium">{fileData.title}</p>
            </div>
            {/* 나머지 3개 칸 (50% 균등 분할) */}
            <div className="flex-[50] grid grid-cols-3 divide-x divide-gray-700/50">
              {/* 구분 */}
              <div className="p-6 space-y-2">
                <div className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-teal-400" />
                  <span className="text-gray-400 text-sm">구분</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  {fileData.category}
                </span>
              </div>
              {/* 파일용량 */}
              <div className="p-6 space-y-2">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">파일용량</span>
                </div>
                <p className="text-white text-lg">{fileData.fileSize}</p>
              </div>
              {/* 목록으로 돌아가기 */}
              <div className="p-6 flex items-center justify-center">
                <button
                  onClick={goBack}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors border border-gray-600/50 hover:border-emerald-500/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>목록으로</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* 자료보기 섹션 */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
          {/* 컨트롤 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gray-700/30">
            <div className="flex items-center space-x-3">
              {isEditMode ? (
                <button
                  className="flex items-center space-x-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
                  onClick={() => {
                    setContent(editContent); // 본문에 즉시 반영
                    setIsEditMode(false);
                  }}
                >
                  <Check className="w-4 h-4" />
                  <span>저장</span>
                </button>
              ) : (
                <button
                  className="flex items-center space-x-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
                  onClick={() => setIsEditMode(true)}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>수정</span>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {/* 1. 줌 컨트롤 */}
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1 border border-gray-600/50">
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                  title="축소"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-400 px-2 min-w-[60px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                  title="확대"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              {/* 2. PDF변환 버튼 */}
              <button
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors text-sm border border-gray-600/50"
                onClick={() => { console.log('PDF 변환'); }}
                title="PDF로 변환"
              >
                <FileText className="w-4 h-4" />
                <span>PDF변환</span>
              </button>
              {/* 3. 소스보기: html 파일만 활성화, 하단과 동일한 토글/상태/색상 */}
              <button
                disabled={safeFileType !== 'html'}
                className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors text-sm ${safeFileType === 'html' ? (showHtmlSource ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border-gray-600/50 cursor-pointer') : 'bg-gray-800/30 text-gray-500 border-gray-700/30 cursor-not-allowed'}`}
                onClick={handleHtmlSourceToggle}
              >
                <Eye className="w-4 h-4" />
                <span>{showHtmlSource ? '미리보기' : '소스보기'}</span>
              </button>
              {/* 4. 복사 */}
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors text-sm border border-gray-600/50"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span className={copied ? "text-green-400" : ""}>{copied ? "복사됨" : "복사"}</span>
              </button>
              {/* 5. 확대보기 */}
              <button className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-600/50" title="전체화면" onClick={handleEnterFullscreen}>
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* 문서 내용 뷰어 or 에디터 */}
          <div 
            ref={containerRef}
            className={`relative min-h-[600px] max-h-[800px] ${
              showScrollbars ? 'overflow-auto' : 'overflow-hidden'
            }`}
          >
            <div ref={fullscreenRef} className={isFullscreen ? 'fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center' : ''} style={isFullscreen ? {minHeight: '100vh', minWidth: '100vw', width: '100vw', height: '100vh'} : {}}>
              {/* 전체화면 모드일 때 X 닫기 버튼 */}
              {isFullscreen && (
                <button
                  onClick={handleExitFullscreen}
                  className="absolute top-6 right-8 z-[10000] p-3 bg-gray-800/80 hover:bg-gray-900/90 text-white rounded-full shadow-lg border border-gray-700"
                  title="전체화면 종료"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
              {/* 미리보기/소스보기/에디터 영역 */}
              {/* HTML 미리보기: 웹페이지처럼 렌더링 & 소스보기 토글 */}
              {safeFileType === 'html' && !isEditMode && !showHtmlSource && (
                <div className="w-full h-full" style={isFullscreen ? {maxWidth: '100vw', maxHeight: '100vh', padding: 0} : {}}>
                  <div className="bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden w-full h-full" style={isFullscreen ? {borderRadius: 0, width: '100vw', height: '100vh', minHeight: 0, minWidth: 0, maxWidth: '100vw', maxHeight: '100vh'} : {minHeight: 400, maxHeight: 700}}>
                    <iframe
                      srcDoc={content}
                      title="HTML 미리보기"
                      className="w-full h-full bg-white"
                      style={isFullscreen ? {minHeight: '100vh', minWidth: '100vw', height: '100vh', width: '100vw'} : {height: 600}}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              )}
              {/* HTML 소스보기 + 수정모드 */}
              {safeFileType === 'html' && (isEditMode || showHtmlSource) && (
                <div className="w-full h-full flex flex-col" style={isFullscreen ? {maxWidth: '100vw', maxHeight: '100vh', padding: 0} : {}}>
                  <div className="bg-black rounded-lg shadow-2xl border border-gray-700 overflow-auto flex-1" style={isFullscreen ? {borderRadius: 0, width: '100vw', height: '100vh', minHeight: 0, minWidth: 0, maxWidth: '100vw', maxHeight: '100vh'} : {minHeight: 400, maxHeight: 700}}>
                    <HtmlCodeEditor value={editContent} onChange={setEditContent} />
                  </div>
                  <div className="flex justify-end mt-4" style={isFullscreen ? {marginTop: 0, position: 'absolute', bottom: 32, right: 32, zIndex: 10001} : {}}>
                    <button
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                      onClick={() => {
                        setContent(editContent);
                        setIsEditMode(false);
                        setShowHtmlSource(false);
                      }}
                    >저장</button>
                  </div>
                </div>
              )}
              {/* 기존 텍스트/이미지/pdf 등 미리보기 */}
              {safeFileType !== 'html' && (
                <div className="w-full h-full flex flex-col" style={isFullscreen ? {maxWidth: '100vw', maxHeight: '100vh', padding: 0} : {}}>
                  {/* PDF, 이미지, 텍스트 등 각 타입별로 w-full h-full, maxWidth/maxHeight 해제, 내부 스크롤 지원 */}
                  {/* PDF 예시 */}
                  {safeFileType === 'pdf' && (
                    <div className="bg-white/5 w-full h-full flex-1 overflow-auto" style={isFullscreen ? {borderRadius: 0, width: '100vw', height: '100vh', minHeight: 0, minWidth: 0, maxWidth: '100vw', maxHeight: '100vh'} : {}}>
                      <div 
                        ref={contentRef}
                        className="bg-white rounded-lg shadow-2xl p-8 mx-auto max-w-4xl"
                        style={isFullscreen ? {borderRadius: 0, width: '100vw', height: '100vh', minHeight: 0, minWidth: 0, maxWidth: '100vw', maxHeight: '100vh', padding: 32} : {transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', transition: 'transform 0.3s ease'}}
                      >
                        <div className="prose prose-lg max-w-none">
                          <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                            {content}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* 이미지 예시 */}
                  {imageExtensions.includes(safeFileType) && (
                    <div className="flex justify-center items-center w-full h-full" style={isFullscreen ? {borderRadius: 0, width: '100vw', height: '100vh', minHeight: 0, minWidth: 0, maxWidth: '100vw', maxHeight: '100vh'} : {}}>
                      <Image 
                        src={fileData.content} 
                        alt={fileData.title} 
                        width={isFullscreen ? 1920 : 600} 
                        height={isFullscreen ? 1080 : 400} 
                        className="max-w-full max-h-full rounded-lg border border-gray-700 object-contain" 
                        unoptimized
                        style={isFullscreen ? {borderRadius: 0, width: '100vw', height: '100vh', objectFit: 'contain'} : {}} 
                      />
                    </div>
                  )}
                  {/* 텍스트 예시 */}
                  {textExtensions.includes(safeFileType) && (
                    <div className="w-full h-full flex-1 overflow-auto" style={isFullscreen ? {borderRadius: 0, width: '100vw', height: '100vh', minHeight: 0, minWidth: 0, maxWidth: '100vw', maxHeight: '100vh', padding: 32} : {}}>
                      <div 
                        ref={contentRef}
                        className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/30"
                        style={isFullscreen ? {borderRadius: 0, width: '100vw', height: '100vh', minHeight: 0, minWidth: 0, maxWidth: '100vw', maxHeight: '100vh', padding: 32} : {transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left', transition: 'transform 0.3s ease'}}
                      >
                        <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                          {content}
                        </pre>
                      </div>
                    </div>
                  )}
                  {/* 기타 미지원 파일타입 fallback */}
                  {!(safeFileType === 'pdf' || imageExtensions.includes(safeFileType) || textExtensions.includes(safeFileType) || safeFileType === 'html' || safeFileType === 'md') && (
                    <div className="p-8 text-gray-400">미지원 파일 형식입니다. (.{safeFileType})</div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* 하단 정보 바 */}
          <div className="flex items-center justify-between p-4 bg-gray-700/30 border-t border-gray-700/50 text-sm">
            <div className="flex items-center space-x-4 text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>업로드: {fileData.uploadDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>형식: {safeFileType.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* 다운로드: 모달 확인 후 진행 */}
              <Dialog.Root open={showDownloadModal} onOpenChange={setShowDownloadModal}>
                <Dialog.Trigger asChild>
                  <button
                    className="flex items-center space-x-2 px-3 py-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>다운로드</span>
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
                  <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-md">
                    <Dialog.Title className="text-lg font-bold text-white mb-4">자료 다운로드 확인</Dialog.Title>
                    <div className="mb-6 text-gray-200">
                      <span className="font-semibold text-emerald-400">{fileData.title}</span> 파일을 다운로드 하시겠습니까?
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Dialog.Close asChild>
                        <button className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600">취소</button>
                      </Dialog.Close>
                      <button onClick={handleDownload} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">확인</button>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
              {/* 공유: 링크 복사 및 토스트 */}
              <button
                className="flex items-center space-x-2 px-3 py-1 text-gray-400 hover:text-white transition-colors"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                <span>공유</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Radix Toast */}
      <Toast.Provider swipeDirection="right">
        <Toast.Root open={showToast} onOpenChange={setShowToast} duration={2000} className="z-[100]">
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            {toastMsg}
          </div>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-full z-[100]" />
      </Toast.Provider>
    </div>
  );
};

export default BibleFileDetail; 