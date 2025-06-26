# 개인 지식 관리 웹앱 개발 명세서

## 1. 프로젝트 개요

### 1.1 목적
다양한 형태의 디지털 자료(HTML, PDF, 텍스트, 마크다운 등)를 체계적으로 저장하고 관리하는 개인용 지식 관리 시스템 개발

### 1.2 핵심 컨셉
- 완전 로컬 기반의 브라우저 독립형 웹앱
- 서버 비용 부담 없는 클라이언트 사이드 솔루션
- 인터넷 연결 없이도 동작 가능한 오프라인 우선 설계

## 2. 주요 기능

### 2.1 기본 기능
- **자료 업로드**: 드래그 앤 드롭을 통한 직관적 파일 업로드
- **카테고리 관리**: 체계적인 자료 분류 시스템
- **검색 및 필터링**: 전체 텍스트 검색 및 다중 조건 필터링
- **CRUD 작업**: 자료의 생성, 읽기, 수정, 삭제
- **다운로드**: 선택한 자료의 개별/일괄 다운로드

### 2.2 고급 기능
- **자동 태그 제안**: 파일 내용 기반 지능형 태그 추천
- **뷰 모드 전환**: 카드형 뷰와 테이블형 뷰 선택
- **전문 검색**: PDF, HTML 등 파일 내부 텍스트 검색
- **데이터 포팅**: 완전한 내보내기/가져오기 기능

### 2.3 추가 권장 기능
- 스마트 태그 시스템 (자유로운 태그 + 태그 조합 검색)
- 파일 미리보기 (이미지, PDF 첫 페이지)
- 자료 간 연결/참조 관계 설정
- 백업 및 동기화 (JSON/CSV 메타데이터 내보내기)
- 워크플로우 기능 (북마크, 최근 본 자료, 중요도 관리)

## 3. 기술 아키텍처

### 3.1 저장소 전략
- **주 저장소**: IndexedDB (대용량 파일 데이터)
- **보조 저장소**: localStorage (설정, 인덱스, 캐시)
- **브라우저 제한 대응**: 용량 모니터링 및 최적화

### 3.2 데이터베이스 설계

#### 3.2.1 IndexedDB 구조
```javascript
// 메인 자료 정보 저장소
ResourcesStore: {
  id: "uuid",
  title: "자료명",
  category: "카테고리",
  tags: ["태그1", "태그2"],
  fileType: "pdf|html|txt|md|image",
  fileName: "원본파일명.ext",
  fileSize: 1024000,
  uploadDate: "2025-06-02",
  lastModified: "2025-06-02",
  description: "설명",
  extractedText: "파일에서 추출한 텍스트(검색용)",
  thumbnailId: "썸네일ID(이미지/PDF용)",
  fileDataId: "실제파일데이터ID"
}

// 실제 파일 데이터 저장소
FileDataStore: {
  id: "fileDataId",
  resourceId: "연결된자료ID", 
  data: Blob, // 실제 파일 바이너리
  chunks: ["chunk1", "chunk2"] // 대용량 파일 분할 저장
}

// 썸네일/미리보기 저장소
ThumbnailStore: {
  id: "thumbnailId",
  resourceId: "연결된자료ID",
  data: Blob // 작은 이미지 데이터
}
```

#### 3.2.2 localStorage 활용
```javascript
// 빠른 검색을 위한 인덱스
searchIndex: {
  tags: {"개발": ["id1", "id2"]},
  categories: {"프로젝트": ["id1", "id3"]},
  fileTypes: {"pdf": ["id1", "id4"]}
}

// 앱 설정
appSettings: {
  viewMode: "card|table",
  sortBy: "date|name|size",
  maxFileSize: 50000000
}
```

### 3.3 파일 처리 전략

#### 3.3.1 텍스트 추출 방식
- **PDF**: PDF.js 라이브러리 활용
- **HTML**: DOM 파싱을 통한 텍스트 추출
- **마크다운/텍스트**: 직접 파일 읽기
- **이미지**: 파일명 및 메타데이터 기반 관리

#### 3.3.2 대용량 파일 처리
```javascript
// 파일을 청크 단위로 분할 저장
const CHUNK_SIZE = 1024 * 1024; // 1MB 단위
function storeFileInChunks(file) {
  const chunks = [];
  for(let i = 0; i < file.size; i += CHUNK_SIZE) {
    chunks.push(file.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}
```

#### 3.3.3 파일 타입별 저장 전략
```javascript
const STORAGE_STRATEGY = {
  'text': 'full_content',     // 전체 내용 저장
  'html': 'full_content',     // 전체 내용 저장  
  'pdf': 'extracted_text',    // 추출된 텍스트만
  'image': 'metadata_only',   // 메타데이터 + 썸네일
  'large_files': 'reference_only' // 50MB 이상은 참조만
};
```

## 4. 데이터 이식성

### 4.1 내보내기 구조
```
export_data.zip:
├── metadata.json        // 모든 자료의 메타데이터
├── files/
│   ├── file1_uuid.pdf
│   ├── file2_uuid.html
│   └── file3_uuid.txt
└── thumbnails/
    ├── thumb1_uuid.jpg
    └── thumb2_uuid.jpg
```

### 4.2 메타데이터 형식
```json
{
  "version": "1.0",
  "exportDate": "2025-06-02",
  "resources": [
    {
      "id": "uuid1",
      "title": "자료1",
      "fileName": "file1_uuid.pdf",
      "thumbnailFile": "thumb1_uuid.jpg",
      "category": "문서",
      "tags": ["중요", "프로젝트"],
      "fileType": "pdf",
      "fileSize": 1024000,
      "uploadDate": "2025-06-02",
      "description": "프로젝트 관련 문서"
    }
  ]
}
```

## 5. 성능 최적화

### 5.1 용량 관리 전략
- IndexedDB 용량 실시간 모니터링
- 파일 크기별 저장 우선순위 설정
- 오래된 파일 자동 압축 기능
- 용량 초과 시 사용자 알림 시스템

### 5.2 검색 성능 최적화
- localStorage 기반 빠른 인덱싱
- 검색어 자동완성을 위한 캐시 시스템
- 대용량 텍스트 검색을 위한 청크 단위 처리

### 5.3 브라우저 호환성
- 모던 브라우저 지원 (Chrome, Firefox, Safari, Edge)
- IndexedDB 및 localStorage 지원 확인
- Blob 및 File API 활용

## 6. 개발 고려사항

### 6.1 보안 및 프라이버시
- 완전 로컬 저장으로 데이터 프라이버시 보장
- 브라우저 보안 모델 내에서 동작
- 사용자 데이터 외부 전송 없음

### 6.2 확장성
- 모듈화된 코드 구조
- 플러그인 시스템 고려
- API 형태의 기능 분리

### 6.3 사용자 경험
- 직관적인 드래그 앤 드롭 인터페이스
- 실시간 검색 및 필터링
- 반응형 웹 디자인
- 오프라인 사용 가능

## 7. 기술 스택 권장사항

### 7.1 프론트엔드
- **프레임워크**: Next.js 15.xxx
- **상태관리**: Redux
- **UI 라이브러리**: Tailwind CSS

### 7.2 라이브러리
- **파일 처리**: PDF.js (PDF 텍스트 추출)
- **압축**: JSZip (내보내기/가져오기)
- **검색**: Fuse.js (퍼지 검색)
- **날짜 처리**: date-fns 또는 dayjs

## 8. 프로젝트 로드맵

### Phase 1: 기본 기능 구현
- IndexedDB 데이터베이스 설계 및 구현
- 기본 CRUD 기능
- 파일 업로드 및 저장

### Phase 2: 검색 및 필터링
- 전체 텍스트 검색 구현
- 카테고리 및 태그 시스템
- 고급 필터링 기능

### Phase 3: 고급 기능
- 자동 태그 제안
- 데이터 내보내기/가져오기
- 미리보기 기능

### Phase 4: 최적화 및 확장
- 성능 최적화
- 추가 파일 형식 지원
- 고급 워크플로우 기능

## 9. 결론

이 개인 지식 관리 웹앱은 개인의 디지털 자료를 효율적으로 관리할 수 있는 현실적이고 실용적인 솔루션을 제공합니다. 완전 로컬 기반의 아키텍처로 비용 부담 없이 개인 정보 보호를 보장하며, 확장 가능한 구조로 향후 기능 추가가 용이합니다.

특히 연구자, 개발자, 학생 등 다양한 디지털 자료를 다루는 사용자들에게 유용한 개인 아카이브 도구로 활용될 수 있습니다.