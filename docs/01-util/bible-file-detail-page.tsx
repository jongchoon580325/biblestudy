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
  Check
} from 'lucide-react';

const BibleFileDetailPage = () => {
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showScrollbars, setShowScrollbars] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // 샘플 파일 데이터
  const fileData = {
    title: "창세기 1장 주석 자료.pdf",
    category: "주석",
    fileSize: "2.5 MB",
    uploadDate: "2024-06-01",
    fileType: "pdf",
    content: `창세기 1장 주석

1. 태초에 하나님이 천지를 창조하시니라 (창 1:1)

이 구절은 성경 전체의 기초가 되는 말씀으로, 하나님께서 만물의 창조주이심을 선언합니다.

주요 해석 포인트:
• "태초에" - 시간의 시작을 의미
• "하나님이" - 엘로힘(복수형이지만 단수 동사와 함께 사용)
• "창조하시니라" - 바라(무에서 유를 창조)

2. 땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고 하나님의 영은 수면 위에 운행하시니라 (창 1:2)

이 구절은 창조 이전의 상태를 묘사합니다:
• "혼돈" - 토후(무질서, 혼란)
• "공허" - 보후(빈 공간, 공허함)
• "하나님의 영" - 루아흐 엘로힘(성령의 활동)

3. 하나님이 이르시되 빛이 있으라 하시니 빛이 있었고 (창 1:3)

첫 번째 창조 명령:
• 말씀으로 창조하시는 하나님의 능력
• 빛과 어둠의 분리
• 질서 있는 창조의 시작

해석학적 고찰:
이 장은 과학적 보고서가 아닌 신학적 선언입니다. 하나님께서 만물의 창조주이시며, 모든 창조물이 하나님의 뜻에 따라 "보시기에 좋았더라"는 평가를 받았음을 강조합니다.

적용점:
1. 하나님을 창조주로 인정하는 믿음
2. 창조 질서에 대한 경외심
3. 인간의 책임과 사명에 대한 이해`
  };

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

  // 줌 레벨이나 컨텐츠 변경 시 스크롤바 체크
  useEffect(() => {
    const timer = setTimeout(checkScrollbars, 100);
    return () => clearTimeout(timer);
  }, [zoomLevel]);

  // 윈도우 리사이즈 시 스크롤바 체크
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
    // 브라우저 이전 페이지로 이동
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // 히스토리가 없는 경우 홈페이지나 기본 페이지로 이동
      console.log('기본 페이지로 이동');
      // window.location.href = '/'; // 또는 Next.js router.push('/')
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 페이지 헤더 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 
                            rounded-xl flex items-center justify-center">
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
              <div className="bg-gray-900 px-6 py-2">
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
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden 
                        backdrop-blur-sm">
          <div className="flex divide-x divide-gray-700/50">
            
            {/* 제목 (65%) */}
            <div className="p-6 space-y-2 flex-[65]">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400 text-sm">제목</span>
              </div>
              <p className="text-white text-lg font-medium">{fileData.title}</p>
            </div>

            {/* 나머지 3개 칸 (35% 균등 분할) */}
            <div className="flex-[35] grid grid-cols-3 divide-x divide-gray-700/50">
              
              {/* 구분 */}
              <div className="p-6 space-y-2">
                <div className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-teal-400" />
                  <span className="text-gray-400 text-sm">구분</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                               bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
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
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 
                           hover:bg-gray-600/50 text-white rounded-lg transition-colors 
                           border border-gray-600/50 hover:border-emerald-500/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>목록으로</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 자료보기 섹션 */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden 
                        backdrop-blur-sm">
          
          {/* 컨트롤 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50 
                          bg-gray-700/30">
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-3 py-2 bg-emerald-600 
                               hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm">
                <Edit3 className="w-4 h-4" />
                <span>수정</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 줌 컨트롤 */}
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1 
                            border border-gray-600/50">
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 
                           rounded transition-colors"
                  title="축소"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-400 px-2 min-w-[60px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 
                           rounded transition-colors"
                  title="확대"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 
                               hover:bg-gray-600/50 text-gray-300 hover:text-white 
                               rounded-lg transition-colors text-sm border border-gray-600/50">
                <Eye className="w-4 h-4" />
                <span>소스보기</span>
              </button>
              
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 
                         hover:bg-gray-600/50 text-gray-300 hover:text-white 
                         rounded-lg transition-colors text-sm border border-gray-600/50"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span className={copied ? "text-green-400" : ""}>{copied ? "복사됨" : "복사"}</span>
              </button>

              <button className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 
                               hover:text-white rounded-lg transition-colors border border-gray-600/50"
                      title="전체화면">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 문서 내용 뷰어 */}
          <div 
            ref={containerRef}
            className={`relative min-h-[600px] max-h-[800px] ${
              showScrollbars ? 'overflow-auto' : 'overflow-hidden'
            }`}
          >
            {/* PDF/이미지 파일인 경우의 뷰어 영역 */}
            {fileData.fileType === 'pdf' && (
              <div className="p-8 bg-white/5">
                <div 
                  ref={contentRef}
                  className="bg-white rounded-lg shadow-2xl p-8 mx-auto max-w-4xl"
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`, 
                    transformOrigin: 'top center',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                      {fileData.content}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 텍스트 파일인 경우 */}
            {fileData.fileType === 'txt' && (
              <div className="p-8">
                <div 
                  ref={contentRef}
                  className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/30"
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`, 
                    transformOrigin: 'top left',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {fileData.content}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* 하단 정보 바 */}
          <div className="flex items-center justify-between p-4 bg-gray-700/30 
                          border-t border-gray-700/50 text-sm">
            <div className="flex items-center space-x-4 text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>업로드: {fileData.uploadDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>형식: {fileData.fileType.toUpperCase()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-3 py-1 text-gray-400 
                               hover:text-white transition-colors">
                <Download className="w-4 h-4" />
                <span>다운로드</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-1 text-gray-400 
                               hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
                <span>공유</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleFileDetailPage;