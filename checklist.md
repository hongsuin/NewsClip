# 구현 체크리스트 — DailyClip 랜딩 페이지

---

## 1. 프로젝트 초기 세팅

- [ ] `landing/` 폴더 생성
- [ ] `index.html` 생성
- [ ] `style.css` 생성
- [ ] `script.js` 생성
- [ ] `index.html` 상단에 서비스명 주석 작성 (`<!-- SERVICE_NAME: DailyClip -->`)
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">` 추가
- [ ] Google Fonts CDN link 태그 추가 (`DM Serif Display`, `Noto Sans KR`)
- [ ] Pretendard CDN link 태그 추가 (`jsdelivr`)
- [ ] `style.css` 기본 reset CSS 작성 (`*, box-sizing, margin, padding`)
- [ ] CSS 변수 (`:root`) 로 컬러 팔레트 정의
  - [ ] `--bg: #F7F5F0`
  - [ ] `--point: #2563EB`
  - [ ] `--text: #111111`
  - [ ] `--text-sub: #6B7280`
  - [ ] `--card-bg: #FFFFFF`
  - [ ] `--border: #E5E7EB`
- [ ] `font-family: 'Pretendard', 'Noto Sans KR', sans-serif` 전역 적용

---

## 2. Section 1 — Hero

- [ ] HTML 마크업 작성
  - [ ] 헤드라인 `"오늘의 뉴스가 내일의 면접 답변이 된다"`
  - [ ] 서브 카피 텍스트
  - [ ] Primary CTA 버튼 (`"무료로 시작하기"`) + `aria-label` 적용
  - [ ] Secondary 버튼 (`"둘러보기"`) + `aria-label` 적용
  - [ ] CSS 뉴스 카드 목업 UI (`aria-hidden="true"`)
- [ ] CSS 스타일
  - [ ] 배경 오프화이트 + SVG `feTurbulence` 노이즈 텍스처
  - [ ] 헤드라인 `DM Serif Display` 폰트 + `clamp()` 유동 크기
  - [ ] Primary 버튼: 포인트 컬러 배경, 호버 시 darken + `scale(1.03)`
  - [ ] Secondary 버튼: 아웃라인 스타일
  - [ ] CSS 카드 목업 UI 디자인
- [ ] JS
  - [ ] 페이지 로드 시 헤드라인 슬라이드업 애니메이션 (`@keyframes` or JS class toggle)
  - [ ] Primary 버튼 클릭 → 모달 열기
  - [ ] Secondary 버튼 클릭 → `#how-it-works` smooth scroll

---

## 3. Section 2 — Problem

- [ ] HTML 마크업 작성
  - [ ] 섹션 제목 `"혹시 이런 경험 있으신가요?"`
  - [ ] Pain Point 카드 3개 마크업
- [ ] CSS 스타일
  - [ ] 카드 레이아웃 (3열 → 반응형 1열)
  - [ ] 타이포그래피 중심 디자인 (아이콘 없음)
  - [ ] 카드 테두리 / 배경 스타일
- [ ] JS
  - [ ] Intersection Observer 등록 (fade-in)

---

## 4. Section 3 — How It Works

- [ ] HTML 마크업 작성
  - [ ] `id="how-it-works"` 속성 부여 (scroll target)
  - [ ] 섹션 제목 `"딱 3단계로 끝"`
  - [ ] Step 1 / 2 / 3 마크업 (번호 + 제목 + 설명)
- [ ] CSS 스타일
  - [ ] Step 가로 배열 레이아웃
  - [ ] Step 번호 스타일 (원형 또는 타이포 강조)
  - [ ] Step 사이 연결 화살표 (`::after` pseudo-element)
  - [ ] 반응형: 모바일에서 세로 배열 전환
- [ ] JS
  - [ ] Intersection Observer 등록 (fade-in)

---

## 5. Section 4 — Feature Highlight

- [ ] HTML 마크업 작성
  - [ ] 기능 카드 4개 마크업
  - [ ] 각 카드에 `"출시 예정"` 배지 요소 포함
- [ ] CSS 스타일
  - [ ] 4열 카드 그리드 레이아웃
  - [ ] 카드 기본 스타일 (배경, 테두리, 패딩)
  - [ ] `"출시 예정"` 배지 스타일
  - [ ] 카드 호버: `transform: translateY(-6px)` + `box-shadow` 강조
  - [ ] 반응형: 태블릿 2열, 모바일 1열
- [ ] JS
  - [ ] Intersection Observer 등록 (fade-in)

---

## 6. Section 5 — CTA Banner

- [ ] HTML 마크업 작성
  - [ ] 헤드라인 `"오늘의 기록이 내일의 경쟁력이 됩니다"`
  - [ ] 서브 카피
  - [ ] `"무료로 시작하기"` 버튼 + `aria-label` 적용
- [ ] CSS 스타일
  - [ ] 배경 포인트 컬러 `#2563EB` 블록
  - [ ] 텍스트 흰색 처리
  - [ ] 버튼 스타일 (배경 흰색, 텍스트 포인트 컬러)
- [ ] JS
  - [ ] 버튼 클릭 → 모달 열기 (Section 1과 동일)
  - [ ] Intersection Observer 등록 (fade-in)

---

## 7. Section 6 — Footer

- [ ] HTML 마크업 작성
  - [ ] 서비스명 + 소개 한 줄
  - [ ] 개인정보처리방침 링크 (`href="#"`)
  - [ ] 이용약관 링크 (`href="#"`)
  - [ ] Copyright 텍스트
- [ ] CSS 스타일
  - [ ] Footer 배경 / 텍스트 색상
  - [ ] 링크 hover 스타일

---

## 8. 모달

- [ ] HTML 마크업 작성
  - [ ] 모달 오버레이 + 카드 구조
  - [ ] 메시지: `"서비스 준비 중입니다"`
  - [ ] 닫기 버튼 + `aria-label="닫기"` 적용
- [ ] CSS 스타일
  - [ ] 오버레이: `position: fixed`, `background: rgba(0,0,0,0.5)`
  - [ ] 카드 중앙 정렬
  - [ ] 열림/닫힘 상태 클래스 (`is-open`)
  - [ ] fade-in 트랜지션
- [ ] JS
  - [ ] 열기 함수 작성
  - [ ] 닫기: 닫기 버튼 클릭
  - [ ] 닫기: 오버레이 외부 클릭
  - [ ] 닫기: ESC 키 입력

---

## 9. 반응형

- [ ] Desktop (1280px+) 기본 레이아웃 확인
- [ ] Tablet (768px~1279px) 레이아웃 확인
  - [ ] 카드 2열 전환
  - [ ] 패딩 축소
- [ ] Mobile (767px 이하) 레이아웃 확인
  - [ ] 카드 1열 전환
  - [ ] 폰트 크기 축소 (`clamp()`)
  - [ ] CTA 버튼 `width: 100%`

---

## 10. 접근성 & 퍼포먼스

- [ ] 모든 CTA 버튼 `aria-label` 확인
- [ ] CSS 목업 UI `aria-hidden="true"` 확인
- [ ] 폰트 CDN에 `font-display: swap` 파라미터 확인
- [ ] `prefers-reduced-motion: reduce` 미디어 쿼리 작성
  - [ ] 해당 환경에서 모든 `transition` / `animation` 비활성화 확인

---

## 11. 최종 검수

- [ ] 브라우저 직접 열기(`index.html`) 로 전체 동작 확인
- [ ] Chrome 최신 버전 레이아웃 확인
- [ ] Firefox 최신 버전 레이아웃 확인
- [ ] Safari 최신 버전 레이아웃 확인
- [ ] 스크롤 fade-in 전 섹션 동작 확인
- [ ] 모달 열기 / 닫기 (버튼, 외부 클릭, ESC) 확인
- [ ] `"둘러보기"` → smooth scroll 확인
- [ ] Feature 카드 `"출시 예정"` 배지 노출 확인
- [ ] W3C HTML 유효성 검사 통과 확인
- [ ] 콘솔 에러 없음 확인

---
