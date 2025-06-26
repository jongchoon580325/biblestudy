# 성경자료실 백업 및 복구 계획서

## 1. 개요

성경자료실의 백업 및 복구 기능 구현을 위한 상세 계획서입니다. 구약(6x7 그리드)과 신약(6x5 그리드)의 복잡한 구조를 유지하면서 안정적인 데이터 백업/복구를 구현합니다.

## 2. 데이터 구조

### 2.1 백업 데이터 구조

```typescript
interface BibleRoomExport {
  metadata: {
    version: string;
    exportDate: string;
    structure: {
      oldTestament: {
        grid: string[][];  // 6x7 그리드
        books: string[];   // 구약 성경명 목록
      },
      newTestament: {
        grid: string[][];  // 6x5 그리드
        books: string[];   // 신약 성경명 목록
      }
    }
  },
  resources: {
    [bookName: string]: {
      id: string;
      name: string;
      category: string;
      content: string;
      uploadDate: number;
      type: string;
      size: number;
    }
  }
}
```

## 3. 백업(Export) 프로세스

### 3.1 백업 로직

```typescript
const handleExportBibleRoom = async () => {
  // 1) 메타데이터 구성
  const metadata = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    structure: {
      oldTestament: {
        grid: OLD_TESTAMENT_GRID,  // 6x7 그리드 상수
        books: OLD_TESTAMENT_BOOKS  // 구약 성경명 상수
      },
      newTestament: {
        grid: NEW_TESTAMENT_GRID,  // 6x5 그리드 상수
        books: NEW_TESTAMENT_BOOKS  // 신약 성경명 상수
      }
    }
  };

  // 2) 리소스 데이터 수집
  const allResources = await indexedDBService.getAllResources();
  const bibleResources = allResources.filter(r => r.category.startsWith('bible'));
  
  // 3) ZIP 파일 생성
  const zip = new JSZip();
  
  // 4) 메타데이터 저장
  zip.file('bible-room/metadata.json', JSON.stringify(metadata, null, 2));
  
  // 5) 각 성경별 리소스 저장
  for (const res of bibleResources) {
    const allFileData = await indexedDBService.getAllFileData();
    const chunks = allFileData.filter(fd => fd.resourceId === res.id);
    const blobs = chunks.map(fd => fd.data);
    const merged = new Blob(blobs);
    
    // 성경 구분에 따라 다른 폴더에 저장
    const folder = res.category.includes('old') ? 'old-testament' : 'new-testament';
    zip.file(`bible-room/${folder}/${res.name}`, merged);
  }
  
  // 6) ZIP 파일 다운로드
  const content = await zip.generateAsync({ type: 'blob' });
  const today = new Date().toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).replace(/\. /g, '-').replace('.', '');
  
  saveAs(content, `${today}-bible-room-export.zip`);
};
```

## 4. 복구(Import) 프로세스

### 4.1 복구 로직

```typescript
const handleImportBibleRoom = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  try {
    // 1) ZIP 파일 로드
    const zip = await JSZip.loadAsync(file);
    
    // 2) 메타데이터 검증
    const metaFile = zip.file('bible-room/metadata.json');
    if (!metaFile) {
      toast.error('metadata.json이 없습니다.');
      return;
    }
    
    const metaText = await metaFile.async('string');
    const metadata = JSON.parse(metaText);
    
    // 3) 버전 및 구조 검증
    if (!validateBibleRoomMetadata(metadata)) {
      toast.error('유효하지 않은 백업 파일입니다.');
      return;
    }
    
    // 4) 기존 성경자료실 데이터 삭제
    const allResources = await indexedDBService.getAllResources();
    const bibleResources = allResources.filter(r => r.category.startsWith('bible'));
    for (const res of bibleResources) {
      await indexedDBService.deleteResourceWithChunks(res.id);
    }
    
    // 5) 구약/신약 데이터 복원
    const oldTestamentFiles = zip.folder('bible-room/old-testament')?.files;
    const newTestamentFiles = zip.folder('bible-room/new-testament')?.files;
    
    // 6) 구약 데이터 복원
    if (oldTestamentFiles) {
      for (const [fileName, file] of Object.entries(oldTestamentFiles)) {
        if (file.dir) continue;
        const blob = await file.async('blob');
        const fileObj = new File([blob], fileName, { type: 'text/html' });
        const chunkIds = await indexedDBService.saveFileData(fileObj);
        
        const resourceToSave = {
          name: fileName,
          category: 'bible-old',
          type: 'html',
          size: fileObj.size,
          uploadDate: Date.now(),
          chunks: chunkIds
        };
        
        const newId = await indexedDBService.saveResource(resourceToSave);
        await indexedDBService.updateResource(newId, { 
          chunks: chunkIds, 
          size: fileObj.size 
        });
      }
    }
    
    // 7) 신약 데이터 복원
    if (newTestamentFiles) {
      for (const [fileName, file] of Object.entries(newTestamentFiles)) {
        if (file.dir) continue;
        const blob = await file.async('blob');
        const fileObj = new File([blob], fileName, { type: 'text/html' });
        const chunkIds = await indexedDBService.saveFileData(fileObj);
        
        const resourceToSave = {
          name: fileName,
          category: 'bible-new',
          type: 'html',
          size: fileObj.size,
          uploadDate: Date.now(),
          chunks: chunkIds
        };
        
        const newId = await indexedDBService.saveResource(resourceToSave);
        await indexedDBService.updateResource(newId, { 
          chunks: chunkIds, 
          size: fileObj.size 
        });
      }
    }
    
    // 8) UI 업데이트
    window.dispatchEvent(new Event('file-uploaded'));
    toast.success('성경자료실 zip 가져오기 완료!');
    
  } catch (err) {
    toast.error('가져오기 실패: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
};
```

### 4.2 메타데이터 검증 함수

```typescript
const validateBibleRoomMetadata = (metadata: any): boolean => {
  return (
    metadata.version &&
    metadata.exportDate &&
    metadata.structure?.oldTestament?.grid?.length === 6 &&
    metadata.structure?.oldTestament?.grid[0]?.length === 7 &&
    metadata.structure?.newTestament?.grid?.length === 6 &&
    metadata.structure?.newTestament?.grid[0]?.length === 5
  );
};
```

## 5. 주요 고려사항

### 5.1 데이터 구조화
- 구약/신약 구분을 명확히 하기 위해 폴더 구조 분리
- 메타데이터에 그리드 구조 정보 포함
- 각 성경별 리소스의 카테고리 정보 보존

### 5.2 에러 처리
- 메타데이터 검증
- 파일 구조 검증
- 데이터 무결성 검증

### 5.3 성능 최적화
- 청크 단위로 파일 처리
- 비동기 처리로 UI 블로킹 방지
- 진행 상태 표시

### 5.4 사용자 경험
- 명확한 에러 메시지
- 진행 상태 표시
- 성공/실패 피드백

## 6. 구현 일정

1. 데이터 구조 설계 및 검증 (1일)
2. 백업 기능 구현 (2일)
3. 복구 기능 구현 (2일)
4. 테스트 및 버그 수정 (1일)

## 7. 테스트 계획

1. 단위 테스트
   - 메타데이터 검증
   - 파일 구조 검증
   - 데이터 무결성 검증

2. 통합 테스트
   - 백업/복구 전체 프로세스
   - 대용량 데이터 처리
   - 에러 상황 처리

3. 사용자 테스트
   - 실제 사용 시나리오
   - UI/UX 검증
   - 성능 검증 