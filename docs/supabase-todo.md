# Supabase PRD 적용 TO DO List

## 1. DB/Storage 구조 설계 및 구축
- [ ] PRD 기준 `materials` 테이블 생성 (컬럼, 타입, 트리거 포함)
- [ ] Supabase Storage 버킷/폴더 구조 설계 및 생성
- [ ] 파일명 중복 방지(uuid 등) 적용

## 2. RLS(Row Level Security) 정책
- [ ] 개발단계: RLS 정책 모두 개방(전체 SELECT/UPDATE/DELETE 허용)
- [ ] 운영 전환 시: PRD 명세대로 RLS 제한 정책 적용
- [ ] 관리자/일반 사용자 권한 분리 정책 준비

## 3. API/클라이언트 기능 구현
- [ ] 자료 업로드(파일+메타데이터) 기능 구현
- [ ] 자료 목록/상세/수정/삭제 기능 구현
- [ ] Storage-DB 동기화 및 예외 처리(롤백 등) 구현
- [ ] zustand 등 store 캐싱 적용

## 4. 인증/권한 관리
- [ ] Supabase Auth 연동 및 사용자 식별
- [ ] 관리자/일반 사용자 구분 로직 구현

## 5. 테스트/문서화
- [ ] 개발/운영 환경 분리 및 정책 관리
- [ ] 테스트 체크리스트 작성 및 검증
- [ ] README/문서화(PRD, 정책, 구조 등)

---
> ⚠️ 개발 완료 후 RLS 정책을 반드시 제한 모드로 전환할 것! 