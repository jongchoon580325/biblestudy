import React, { useState, useEffect, useRef } from 'react';

// 지원 파일 타입
const EDITABLE_EXTENSIONS = ['md', 'markdown', 'html', 'txt', 'csv'];
const PREVIEWABLE_EXTENSIONS = ['md', 'markdown', 'html', 'txt', 'csv'];

// 타입 정의
export type ViewMode = 'preview' | 'edit' | 'split';
export interface FileData {
  name: string;
  extension: string;
  content: string;
  size?: number;
  mimeType?: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, unknown>;
}
export interface FilePreviewAdvancedProps {
  file: FileData;
  onSave?: (content: string) => Promise<void>;
  onDownload?: () => void;
  onChange?: (content: string) => void;
  onModeChange?: (mode: ViewMode) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  initialMode?: ViewMode;
  forceReadOnly?: boolean;
  enableAutoSave?: boolean;
  autoSaveDelay?: number;
  customRenderers?: Record<string, {
    supportedExtensions: string[];
    render: (content: string) => React.ReactNode;
    editable: boolean;
    name: string;
  }>;
}

/**
 * FilePreviewAdvanced - 다양한 파일 미리보기/편집/다운로드/전체화면 지원 고급 컴포넌트
 * @param props - 파일 데이터, 저장/다운로드/모드 변경 콜백 등
 */
const FilePreviewAdvanced: React.FC<FilePreviewAdvancedProps> = ({
  file,
  onSave,
  onDownload,
  onChange,
  onModeChange,
  onFullscreenChange,
  initialMode = 'preview',
  forceReadOnly = false,
  enableAutoSave = true,
  autoSaveDelay = 2000,
  customRenderers
}) => {
  const [mode, setMode] = useState<ViewMode>(initialMode);
  const [content, setContent] = useState(file.content);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 확장자 소문자
  const ext = file.extension?.toLowerCase() || '';
  const isEditable = !forceReadOnly && (EDITABLE_EXTENSIONS.includes(ext) || customRenderers?.[ext]?.editable);
  const isPreviewable = PREVIEWABLE_EXTENSIONS.includes(ext) || !!customRenderers?.[ext];

  // 외부 파일 변경 시 동기화
  useEffect(() => {
    setContent(file.content);
  }, [file.content, file.name]);

  // 모드 변경 콜백
  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  // 전체화면 콜백
  useEffect(() => {
    onFullscreenChange?.(isFullscreen);
  }, [isFullscreen, onFullscreenChange]);

  // ESC로 전체화면 종료
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  // 자동 저장
  useEffect(() => {
    if (!enableAutoSave || !onSave) return;
    if (!isEditable) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setIsSaving(true);
      setSaveError(null);
      try {
        await onSave(content);
      } catch (e: unknown) {
        setSaveError(e instanceof Error ? e.message : '저장 실패');
      } finally {
        setIsSaving(false);
      }
    }, autoSaveDelay);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line
  }, [content]);

  // 컨텐츠 변경 핸들러
  const handleContentChange = (val: string) => {
    setContent(val);
    onChange?.(val);
  };

  // 수동 저장
  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(content);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setIsSaving(false);
    }
  };

  // 전체화면 토글
  const toggleFullscreen = () => {
    setIsFullscreen(v => !v);
  };

  // 미리보기 렌더러
  const renderPreview = () => {
    // 커스텀 렌더러 우선
    if (customRenderers?.[ext]) {
      return customRenderers[ext].render(content);
    }
    if (ext === 'md' || ext === 'markdown') {
      // 마크다운 렌더링 (remark/rehype 등 외부 라이브러리 권장, 여기선 최소 렌더)
      return (
        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
      );
    }
    if (ext === 'html') {
      return (
        <iframe
          title="HTML 미리보기"
          srcDoc={content}
          className="w-full h-full min-h-[300px] bg-white dark:bg-gray-900 border rounded"
        />
      );
    }
    if (ext === 'txt') {
      return (
        <pre className="whitespace-pre-wrap text-sm bg-gray-900 p-4 rounded border border-gray-700 overflow-x-auto">{content}</pre>
      );
    }
    if (ext === 'csv') {
      return (
        <div className="overflow-x-auto">
          <table className="table-auto border border-gray-700 w-full text-xs">
            <tbody>
              {csvToRows(content).map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="border border-gray-700 px-2 py-1">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <div className="text-gray-400 text-center py-8">지원하지 않는 파일 형식입니다.</div>
    );
  };

  // 에디터 렌더러
  const renderEditor = () => {
    if (!isEditable) return null;
    if (ext === 'md' || ext === 'markdown' || ext === 'txt' || ext === 'csv' || ext === 'html') {
      return (
        <textarea
          className="w-full min-h-[300px] bg-gray-900 text-gray-100 border border-gray-700 rounded p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          value={content}
          onChange={e => handleContentChange(e.target.value)}
          spellCheck={false}
        />
      );
    }
    // 커스텀 렌더러
    if (customRenderers?.[ext]?.editable) {
      return customRenderers[ext].render(content);
    }
    return null;
  };

  // 마크다운 최소 렌더러 (실제 프로젝트에선 remark/rehype 등 사용 권장)
  function markdownToHtml(md: string): string {
    return md
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\#\s(.+)/g, '<h1>$1</h1>')
      .replace(/\#\#\s(.+)/g, '<h2>$1</h2>')
      .replace(/\#\#\#\s(.+)/g, '<h3>$1</h3>');
  }
  // CSV 파싱
  function csvToRows(csv: string): string[][] {
    return csv.split('\n').map(row => row.split(','));
  }

  // 전체화면 스타일
  const fullscreenClass = isFullscreen ? 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center' : '';
  const containerClass = `w-[85vw] max-w-6xl mx-auto h-full bg-gray-800 rounded-lg border border-gray-700 shadow-lg p-4 relative flex justify-center items-center ${fullscreenClass}`;

  // 렌더링
  return (
    <div ref={containerRef} className={containerClass} style={isFullscreen ? {height: '100vh'} : {}}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-indigo-300">{file.name}</span>
          <span className="text-xs text-gray-400">{file.size ? `${(file.size/1024).toFixed(1)} KB` : ''}</span>
          <span className="text-xs text-gray-500">.{ext}</span>
        </div>
        <div className="flex items-center gap-2">
          {isEditable && (
            <button
              className={`px-2 py-1 rounded text-xs ${mode==='edit' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
              onClick={() => setMode('edit')}
            >편집</button>
          )}
          {isPreviewable && (
            <button
              className={`px-2 py-1 rounded text-xs ${mode==='preview' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
              onClick={() => setMode('preview')}
            >미리보기</button>
          )}
          {isEditable && isPreviewable && (
            <button
              className={`px-2 py-1 rounded text-xs ${mode==='split' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
              onClick={() => setMode('split')}
            >분할</button>
          )}
          <button
            className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-200 hover:bg-gray-600"
            onClick={toggleFullscreen}
          >{isFullscreen ? '전체화면 종료' : '전체화면'}</button>
          {onDownload && (
            <button
              className="px-2 py-1 rounded text-xs bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={onDownload}
            >다운로드</button>
          )}
        </div>
      </div>
      {/* 본문 */}
      <div className={
        mode === 'split'
          ? 'flex flex-col md:flex-row gap-4 min-h-[300px]'
          : 'min-h-[300px]'
      }>
        {(mode === 'edit' || mode === 'split') && (
          <div className={mode === 'split' ? 'w-full md:w-1/2' : 'w-full'}>
            {renderEditor()}
          </div>
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div className={mode === 'split' ? 'w-full md:w-1/2' : 'w-full'}>
            {renderPreview()}
          </div>
        )}
      </div>
      {/* 하단: 저장 상태 */}
      <div className="flex items-center gap-3 mt-4 text-xs">
        {isEditable && (
          <>
            <button
              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
            {saveError && <span className="text-red-400">{saveError}</span>}
            {isSaving === false && !saveError && <span className="text-green-400">자동 저장됨</span>}
          </>
        )}
      </div>
      {/* 전체화면 닫기 버튼 */}
      {isFullscreen && (
        <button
          className="absolute top-4 right-4 px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 z-50"
          onClick={toggleFullscreen}
        >X</button>
      )}
    </div>
  );
};

export default FilePreviewAdvanced;
// 사용 예시 및 상세 설명은 README 또는 별도 문서 참고 