# 커밋 히스토리

### 2025-07-02

12. **feat: 데이터관리 페이지 UI/기능 구현 및 동기화/내보내기/가져오기/초기화 개선** (86ebffa)
  - data-management 레이아웃/기능 구현 및 스타일 통일
    - Tailwind, lucide-react, 4:6 그리드, 버튼(동기화/내보내기/가져오기/초기화 등) 적용
    - 타이틀/부연설명/구분선 스타일 전체자료실과 통일, 버튼 폰트/비율/정렬 개선
  - Supabase 데이터 초기화/삭제 로직 개선
    - materials 테이블만 사용, generals 테이블 삭제 로직 제거
    - id 목록 in 조건 삭제, 스토리지 materials/bible/general 폴더별 반복 삭제
    - 초기화 성공/실패 메시지 한 줄 처리
  - 내보내기/가져오기(백업/복구) 기능 구현
    - jszip 도입, zip(메타+파일) 내보내기/가져오기, 파일명 규칙 적용
    - 복구 시 필수 필드 자동 보완(local_id, created_at, sync_status 등)
    - 내보내기/가져오기 버튼 모달 확인 UX 추가
  - 동기화 프로세스 개선
    - 홈 진입 시 polling 동기화, 데이터관리 페이지에 수동 동기화 버튼/UX 추가
    - 로딩/결과 메시지 표시
  - 커밋/문서화 및 기타 개선
    - 커밋/푸시, 커밋 히스토리 문서 가이드라인에 맞게 업데이트
    - 카테고리 관리 PRD 기반 카테고리 관리 섹션 로직 구현 준비
    - favicon.ico 500 에러 원인 분석 및 보류

### 2025-07-01

11. **기능: 데이터관리 내보내기/가져오기(zip), 초기화, 동기화 필드 보완 구현** (217d806)
  - 자료실별 zip 백업/복구(메타+파일)
    - 내보내기: 메타데이터+실제파일 zip 생성, 날짜/자료실명 기반 파일명
    - 가져오기: 필수 필드 자동 보완(local_id, created_at, sync_status 등)
  - 동기화 필수 필드 자동 보완 및 정상 동기화 보장
    - 복구 시 sync_status 'pending' 강제 지정, local_id/created_at 누락 보완
  - Supabase/IndexedDB 완전 초기화 기능
    - materials 테이블, 스토리지(bible/general) 전체 삭제
  - 내보내기/가져오기 모달 UX 개선
    - 내보내기 전 확인 모달, 결과 메시지 한 줄 처리

### 2024-06-30

10. **수정: supabase 이중등록 방지 및 storage 업로드/빌드 오류 수정** (dac15dc)
  - supabase materials 테이블 이중 등록(onConflict) 완전 방지
    - local_id UNIQUE 컬럼 기반 upsert, 타입 오류 수정
  - 파일 업로드 시 storage bucket(materials)에 실제 데이터 저장 및 file_url 연동
    - 업로드 유틸 함수 추가, publicUrl 저장, 중복 업로드 예외 처리
  - 빌드/ESLint/타입 에러 전면 해결 및 production build 정상화
    - StorageError 타입, onConflict 옵션, 미사용 변수 등 일괄 수정

9. **기능: supabase 연동정상-클라이언트 핫리로드정상-인증관련정상** (5420ef9)
  - Supabase 클라이언트 싱글턴화
    - 인증 경고 제거
    - 동기화/핫리로드 정상화

### 2025-06-29

8. **스타일: 전체자료실 카운트 안내문구 라벨 컬러 #b8bab9로 변경** (93fc94a)
  - 전체자료실 상단 카운트 안내문구에서 숫자를 제외한 라벨 텍스트 컬러를 #b8bab9로 변경
  - 숫자는 기존 파란/초록/보라 컬러 유지, 시각적 구분성 향상

7. **리팩토링: HybridStorageService로 자료 저장/조회/미리보기 로직 일원화 및 중복 제거** (3d64f2d)
  - addMaterial, getAllMaterials, getMaterialsByBibleBook, deleteMaterial 등 CRUD 함수 HybridStorageService 클래스 static 메서드로 통합
  - 성경/일반/전체자료실 및 프리뷰 페이지 모두 서비스 객체 패턴으로 일원화
  - 자료 저장/조회/미리보기 로직 중복 제거 및 유지보수성 향상

6. **수정: bibleHybridDB 인덱스별 자료 저장/조회 로직 개선 및 by-bible-book 인덱스 정상화** (caf3ccb)
  - getMaterialsByBibleBook 인덱스 기반 조회 함수 추가 및 적용
  - 성경자료실 자료 등록/조회 시 by-bible-book 인덱스 활용
  - 전체 인덱스별 자료 분포 및 저장 로직 일관성 개선
  - 린트/타입 에러 수정 및 빌드 검증 완료

5. **refactor: 전체자료실 미리보기 로직을 성경/일반자료실과 완전히 통일 (공통 PreviewContent 컴포넌트 재사용)** (c91f537)
  - 전체자료실 미리보기 기능을 성경/일반자료실과 완전히 동일한 UX/구조로 통일
  - PreviewContent 컴포넌트로 미리보기 랜더링 로직 완전 일원화
  - 코드 중복 제거 및 유지보수성/일관성 대폭 향상

4. **fix: 성경자료실 미리보기 404 및 랜더링 오류 수정 (base64 텍스트 변환 포함)** (1ff782f)
  - 상세 미리보기 404 오류 해결
  - params.book 디코딩 및 localStorage 키 일치화
  - 텍스트/마크다운/HTML/CSV base64 → text 변환 랜더링 적용
  - 자료 등록/수정/삭제 시 localStorage 동기화

3. **style: 헤더 메뉴 hover 컬러 #eba434로 변경 및 UI 개선** (c59afed)
  - 헤더 네비게이션 메뉴 hover 시 텍스트 컬러를 #eba434(오렌지)로 변경
  - 전체 레이아웃 및 스타일 일관성 개선

### 2025-06-27

2. **feat: 자료목록 페이지네이션 및 최신 UX/로직 통합 (성경/일반자료실)** (1bdffe9)
  - 성경자료실/일반자료실 자료등록·목록 로직 완전 통합
  - 자료목록 테이블 페이지네이션(10/20/30개 보기) 및 수량 선택 드롭다운 추가
  - 입력 활성화, 파일 업로드, 인라인 수정, 삭제, 다운로드, 검색/필터, 모달 등 최신 UX/로직 적용
  - Next.js 15+ params 언래핑(React.use) 및 타입 안전성 개선
  - 코드 일관성 및 유지보수성 향상

1. **개선: 불필요 코드 정리 및 빌드 경고 제거** (cddbd82)
  - 사용하지 않는 컴포넌트 및 변수 삭제
    - TableFormAdvanced, mockMaterial 등 미사용 코드 제거
  - 빌드/배포 시 ESLint 경고 제거
  - Vercel 자동 배포 환경에서 오류 없는 상태로 정리
