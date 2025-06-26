# biblestudy: 온라인/오프라인 성경자료실 프로젝트

## 프로젝트 소개
- 온라인/오프라인 환경에서 성경 및 일반 자료를 체계적으로 관리·공유할 수 있는 웹 애플리케이션
- Supabase(클라우드) + IndexedDB(로컬) 기반 하이브리드 저장소
- Next.js 15, TypeScript, TailwindCSS, Zustand 등 최신 스택 적용

## 주요 기능
- 성경자료실/일반자료실 분리 관리
- 자료 업로드, 미리보기, 분류(카테고리)
- 오프라인 모드 지원(IndexedDB)
- 데이터 백업/복원(Export/Import)
- 실시간 동기화 및 충돌 관리
- 접근성(A11y) 및 반응형 UI

## 기술 스택
- Next.js(App Router)
- TypeScript
- TailwindCSS
- Zustand(상태관리)
- Supabase(PostgreSQL, Storage)
- IndexedDB, LocalStorage

## 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## GitHub 저장소
- https://github.com/jongchoon580325/biblestudy

## 참고 문서
- docs/01-util/commit-history-guidelines.md
- docs/bible-db_architecture_PRD.md

---

> 본 프로젝트는 오프라인 우선(Offline-First) 아키텍처와 데이터 안정성, 확장성을 목표로 설계되었습니다.
