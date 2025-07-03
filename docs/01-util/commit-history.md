### 2025-07-03

1. **개선: Supabase 클라이언트 싱글턴화 및 API 직접 호출 제거, 빌드 성공** (2029704)
  - Supabase 클라이언트 인스턴스 싱글턴화
    - src/utils/supabaseClient.ts 파일로 분리, 환경변수만 사용
    - 하드코딩된 키 완전 제거, 보안성 강화
  - 전체 코드베이스에서 supabase import 경로 통일
    - storage-utils, page.tsx, data-management/page.tsx, sync-engine.ts, category-service.ts 등
    - supabaseClient.ts의 인스턴스만 사용하도록 일괄 수정
  - Supabase REST API 직접 호출 코드 제거 및 점검
    - fetch/axios 등 REST 직접 호출 코드 없음 확인
    - 공식 SDK만 사용하도록 구조 일원화
  - 프로덕션 빌드 성공 및 주요 ESLint 경고만 남음
    - Multiple GoTrueClient Instances Detected, 422 API 에러 해결
    - 빌드/동작 정상, 경고는 추후 개선 예정
