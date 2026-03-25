# 📰 NewsClip

> 오늘의 뉴스가 내일의 면접 답변이 된다

취준생을 위한 뉴스 스크랩 & 메모 서비스입니다.
URL만 붙여넣으면 뉴스 제목·썸네일·요약을 자동으로 저장하고, 날짜별로 아카이브할 수 있습니다.

---

## 주요 기능

- 🔗 **뉴스 URL 스크랩** — URL 입력 시 제목·썸네일·요약 자동 추출
- 📁 **날짜별 아카이브** — 저장한 클립을 날짜 기준으로 그룹핑
- ✏️ **메모** — 각 클립에 면접 키워드·생각 메모 (자동 저장)
- 🔍 **날짜 필터** — 특정 날짜의 클립만 모아보기
- 🔐 **회원가입 / 로그인** — JWT 기반 인증, 내 클립만 관리

---

## 기술 스택

| 구분 | 기술 |
|---|---|
| 프론트엔드 | HTML · CSS · Vanilla JS |
| 백엔드 | Node.js · Express |
| 데이터베이스 | SQLite (better-sqlite3) |
| 인증 | JWT · bcrypt |
| 스크래핑 | axios · cheerio |

---

## 프로젝트 구조

```
make_web/
├── landing/          # 랜딩 페이지
├── app/              # 로그인·대시보드 페이지
├── server/           # Node.js 백엔드
│   ├── routes/       # API 라우트 (auth, clips, scrape)
│   ├── models/       # DB 모델 (User, Clip)
│   ├── middleware/   # JWT 인증 미들웨어
│   └── utils/        # 스크래핑 유틸리티
└── 서버시작.bat       # 서버 실행 스크립트 (Windows)
```

---

## 로컬 실행 방법

### 1. 의존성 설치

```bash
cd server
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 `JWT_SECRET` 값을 변경하세요.

```
PORT=8080
JWT_SECRET=나만의_비밀키
DB_PATH=./dailyclip.db
```

### 3. 서버 실행

```bash
# Windows
서버시작.bat 더블클릭

# 또는 터미널에서
cd server
node index.js
```

### 4. 브라우저에서 열기

- VS Code **Live Server** 로 `landing/index.html` 실행
- 또는 `app/login.html` 직접 열기

---

## API

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/clips` | 클립 목록 조회 |
| POST | `/api/clips` | 클립 저장 |
| PATCH | `/api/clips/:id/memo` | 메모 수정 |
| DELETE | `/api/clips/:id` | 클립 삭제 |
| POST | `/api/scrape` | URL 메타 정보 추출 |
