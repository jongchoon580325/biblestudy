# biblestudy GitHub 원격 저장소 최초 설치 및 셋업 가이드

## 1. 원격 저장소 정보
- 저장소명: `biblestudy`
- GitHub 주소: https://github.com/jongchoon580325/biblestudy

## 2. 로컬 프로젝트 최초 원격 연결 및 푸시
```bash
# 원격 저장소 등록
echo "# biblestudy" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/jongchoon580325/biblestudy.git
git push -u origin main
```

## 3. 브랜치 전략
- main: 배포용(프로덕션)
- develop: 통합 개발
- feature/*: 기능 개발
- bugfix/*: 버그 수정

## 4. 커밋 메시지 컨벤션
- Conventional Commits 형식, 한글(주), 영어(부)
  - feat: 기능 추가
  - fix: 버그 수정
  - docs: 문서
  - refactor: 리팩토링
  - style: 스타일
  - test: 테스트
  - chore: 기타

## 5. Pull Request(PR) 규칙
- PR 제목/설명에 변경사항, 이슈번호, 테스트 방법 명시
- 리뷰어 지정, 승인 후 머지
- 코드 리뷰 필수

## 6. 기타 참고사항
- 민감 정보(.env 등) 커밋 금지
- 상세 개발 규칙: docs/01-util/00-Development_Checklist.md, docs/01-util/commit-history-guidelines.md 참고
