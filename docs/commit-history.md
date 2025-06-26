### 2025-06-26

3. **개선: 위로가기(BackToTop) 버튼 및 본문 레이아웃 개선** (b83ed36)
  - 전역 우측 하단에 위로가기 버튼 도입
    - lucide-react ArrowUp 아이콘, 네온 효과, 반응형, 접근성 지원
    - 서버/클라이언트 컴포넌트 분리, 빌드 오류 해결
  - 홈 및 본문 90vw 중앙정렬, max-w-1400px 일관화

2. **문서: 프로젝트 구조 및 가이드, 레이아웃/컴포넌트 문서 최신화** (ee1ec9c)
  - README, commit-guideline, github-config-setting 등 주요 문서 최신화
    - 협업/개발 규칙, 자동화, 커밋/PR/이슈 관리 가이드 반영
  - 레이아웃, 공통 컴포넌트, 페이지 구조 개선 및 주석 추가
    - Footer 하단 고정, min-h-screen, flex-col 구조 적용
  - TO DO 리스트, PRD 분석, 커밋 히스토리 등 문서화 체계화

### 2025-06-25

1. **기능: 프로젝트 초기 커밋** (85661b8)
  - 프로젝트 구조 및 초기 환경설정
    - Next.js, TypeScript, TailwindCSS, Zustand 등 기본 세팅
    - Supabase 및 IndexedDB 하이브리드 저장 구조 설계
    - 주요 문서 및 개발 가이드 추가
