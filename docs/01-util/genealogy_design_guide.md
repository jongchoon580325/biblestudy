# 성경 족보 문서 디자인 가이드

이 문서는 성경 족보 및 계보 자료를 시각적으로 정리할 때 사용하는 통일된 디자인 시스템입니다.

## 1. 전체 레이아웃 구조

### 1.1 기본 컨테이너 구조
```
📦 Container (최대 너비: 1200px, 중앙 정렬)
├── 🎯 Header (제목 및 부제목)
├── 📝 Content (주요 내용)
│   ├── 🔢 Generation 1 (세대별 섹션)
│   ├── 🔢 Generation 2
│   └── ...
└── 📋 Legend (범례)
```

### 1.2 HTML 기본 구조
```html
<div class="container">
    <div class="header">
        <h1>문서 제목</h1>
        <p>부제목</p>
    </div>
    <div class="content">
        <div class="generation">
            <!-- 세대별 내용 -->
        </div>
    </div>
</div>
```

## 2. 컬러 스키마

### 2.1 주요 색상 팔레트
| 요소 | 색상 코드 | 용도 |
|------|----------|------|
| **Primary Blue** | `#3498db` | 세대 번호, 구분선 |
| **Dark Blue** | `#2c3e50` | 헤더 배경, 제목 텍스트 |
| **Secondary Blue** | `#34495e` | 헤더 그라데이션 |
| **Red Accent** | `#e74c3c` | 주요 인물 강조선 |
| **Gray Scale** | `#95a5a6`, `#bdc3c7` | 하위 요소 구분 |
| **Background** | `#667eea` → `#764ba2` | 페이지 배경 그라데이션 |

### 2.2 배경 그라데이션
```css
/* 페이지 전체 배경 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 헤더 배경 */
background: linear-gradient(45deg, #2c3e50, #34495e);
```

## 3. 세대 표시 시스템

### 3.1 세대 번호 디자인
- **모양**: 원형 (30px × 30px)
- **배경색**: `#3498db` (Primary Blue)
- **텍스트**: 흰색 (`white`), 14px, 굵게
- **위치**: 세대 제목 왼쪽에 배치

```css
.gen-number {
    background: #3498db;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    font-size: 14px;
    font-weight: bold;
}
```

### 3.2 세대 제목 구조
```html
<div class="gen-title">
    <div class="gen-number">1</div>
    세대 제목 텍스트
</div>
```

## 4. 계층 구조 표현

### 4.1 계층별 스타일 정의

#### 부모 (Parent)
- **배경**: `#ecf0f1` (연한 회색)
- **좌측 강조선**: 4px, `#e74c3c` (빨간색)
- **패딩**: 12px 16px
- **폰트**: 굵게
- **텍스트 색상**: `#2c3e50`

#### 자식 (Child)
- **배경**: `#d5dbdb` (중간 회색)
- **좌측 강조선**: 3px, `#95a5a6` (회색)
- **패딩**: 8px 12px
- **들여쓰기**: 30px
- **연결선**: `└` 기호 사용

#### 손자 (Grandchild)
- **배경**: `#f8f9fa` (매우 연한 회색)
- **좌측 강조선**: 2px, `#bdc3c7` (연한 회색)
- **패딩**: 6px 10px
- **들여쓰기**: 25px (추가)
- **폰트 크기**: 14px

### 4.2 연결선 표시
```css
.child::before {
    content: '└';
    position: absolute;
    left: -20px;
    color: #95a5a6;
    font-weight: bold;
}

.grandchild::before {
    content: '└';
    position: absolute;
    left: -15px;
    color: #bdc3c7;
    font-size: 12px;
}
```

## 5. 특수 요소 스타일

### 5.1 족속 태그 (Tribe Tags)
- **배경**: `#e8f5e8` (연한 녹색)
- **테두리**: 1px solid `#a9dfbf`
- **텍스트**: `#27ae60` (녹색)
- **모양**: 둥근 모서리 (12px)
- **크기**: 12px 폰트, 4px 8px 패딩
- **배치**: Flexbox로 줄바꿈 가능

```css
.tribe {
    background: #e8f5e8;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    color: #27ae60;
    border: 1px solid #a9dfbf;
}

.tribes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}
```

### 5.2 특별 주석 박스
- **배경**: `#fff3cd` (연한 노란색)
- **테두리**: 1px solid `#ffeaa7`
- **텍스트**: `#856404` (갈색)
- **패딩**: 10px
- **모서리**: 6px 둥글게
- **폰트 크기**: 14px

```css
.special-note {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 10px;
    margin: 10px 0;
    font-size: 14px;
    color: #856404;
}
```

## 6. 범례 (Legend) 디자인

### 6.1 범례 컨테이너
- **배경**: `#f8f9fa` (연한 회색)
- **상단 강조선**: 3px solid `#3498db`
- **패딩**: 20px
- **모서리**: 8px 둥글게
- **위치**: 문서 하단
- **여백**: 상단 30px

### 6.2 범례 항목 구조
```html
<div class="legend-item">
    <div class="legend-color" style="background-color: #색상코드;"></div>
    <span>설명 텍스트</span>
</div>
```

### 6.3 범례 색상 박스
- **크기**: 20px × 20px
- **모서리**: 4px 둥글게
- **오른쪽 여백**: 10px
- **각 요소의 대표 색상과 스타일 적용**

## 7. 타이포그래피 규칙

### 7.1 폰트 패밀리
```css
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
```

### 7.2 폰트 크기 체계
| 요소 | 크기 | 굵기 | 색상 |
|------|------|------|------|
| **메인 제목** | 24px | 300 (Light) | `white` |
| **세대 제목** | 18px | bold | `#2c3e50` |
| **부모 이름** | 기본 | bold | `#2c3e50` |
| **자식 이름** | 기본 | 일반 | `#34495e` |
| **손자 이름** | 14px | 일반 | `#5d6d7e` |
| **족속 태그** | 12px | 일반 | `#27ae60` |
| **특별 주석** | 14px | 일반 | `#856404` |

### 7.3 간격 규칙
- **세대 간 여백**: 40px
- **부모-자식 여백**: 8px
- **자식-손자 여백**: 4px
- **태그 간 간격**: 8px

## 8. 반응형 디자인

### 8.1 기본 반응형 규칙
- **최대 너비**: 1200px (데스크톱)
- **패딩**: 20px (모바일 대응)
- **여백**: 자동 중앙 정렬

### 8.2 모바일 최적화
```css
@media (max-width: 768px) {
    .container {
        margin: 10px;
        border-radius: 10px;
    }
    
    .content {
        padding: 20px;
    }
    
    .gen-number {
        width: 25px;
        height: 25px;
        font-size: 12px;
    }
}
```

## 9. 사용 예시

### 9.1 새로운 족보 문서 생성 시
1. 기본 HTML 구조 복사
2. 제목과 범위 수정
3. 세대별로 `generation` div 추가
4. 각 세대 번호 순차적 적용
5. 계층 구조에 따라 적절한 클래스 적용
6. 특별한 주석이나 족속이 있으면 해당 스타일 적용
7. 범례에 사용된 요소들 추가

### 9.2 일관성 체크리스트
- [ ] 세대 번호가 파란 원형으로 표시되는가?
- [ ] 부모-자식-손자 계층이 색상과 들여쓰기로 구분되는가?
- [ ] 족속들이 녹색 태그로 표시되는가?
- [ ] 특별 주석이 노란색 박스로 강조되는가?
- [ ] 범례가 하단에 올바르게 배치되는가?
- [ ] 전체적인 색상 조화가 맞는가?

## 10. CSS 클래스 참조

### 10.1 필수 클래스 목록
```css
.container          /* 전체 컨테이너 */
.header            /* 헤더 영역 */
.content           /* 내용 영역 */
.generation        /* 세대별 섹션 */
.gen-title         /* 세대 제목 */
.gen-number        /* 세대 번호 원형 */
.family-tree       /* 족보 트리 */
.parent            /* 주요 인물 */
.children          /* 자식 컨테이너 */
.child             /* 자식 요소 */
.grandchildren     /* 손자 컨테이너 */
.grandchild        /* 손자 요소 */
.tribes            /* 족속 컨테이너 */
.tribe             /* 족속 태그 */
.special-note      /* 특별 주석 */
.legend            /* 범례 */
.legend-item       /* 범례 항목 */
.legend-color      /* 범례 색상 박스 */
```

---

**참고**: 이 가이드는 역대상 1장 족보 문서를 기반으로 작성되었으며, 다른 성경 족보나 계보 자료에도 동일하게 적용할 수 있습니다.