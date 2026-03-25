# DailyClip — 실제 기능 구현 개발 로드맵

> 현재 상태: 정적 랜딩 페이지 (HTML/CSS/JS)
> 목표: 뉴스 URL 저장 · 요약 · 아카이브 기능이 동작하는 풀스택 웹 서비스

---

## 기술 스택 결정

| 레이어 | 선택지 A (추천 · 입문) | 선택지 B (확장성) |
|---|---|---|
| **프론트엔드** | Vanilla JS + fetch API | React (Vite) |
| **백엔드** | Node.js + Express | FastAPI (Python) |
| **데이터베이스** | SQLite (로컬 개발) → PostgreSQL | MongoDB |
| **인증** | JWT (Access + Refresh Token) | Supabase Auth |
| **뉴스 스크래핑** | Cheerio + axios | Puppeteer (JS 렌더링 필요 시) |
| **배포** | Render / Railway (무료 티어) | Vercel + PlanetScale |

> 이 문서는 **선택지 A** 기준(Node.js + Express + SQLite)으로 작성됩니다.

---

## 전체 프로젝트 구조 (목표)

```
make_web/
├── landing/              # 기존 랜딩 페이지 (정적)
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server/               # 백엔드 (Node.js + Express)
│   ├── index.js          # 서버 진입점
│   ├── routes/
│   │   ├── auth.js       # 회원가입·로그인 API
│   │   ├── clips.js      # 뉴스 저장·조회·삭제 API
│   │   └── scrape.js     # URL 스크래핑 API
│   ├── middleware/
│   │   └── auth.js       # JWT 검증 미들웨어
│   ├── models/
│   │   ├── db.js         # DB 연결 (better-sqlite3)
│   │   ├── User.js       # 유저 스키마·쿼리
│   │   └── Clip.js       # 클립 스키마·쿼리
│   ├── utils/
│   │   └── scraper.js    # Cheerio 스크래핑 로직
│   ├── .env              # 환경변수 (gitignore)
│   └── package.json
│
├── app/                  # 프론트엔드 앱 (로그인 후 대시보드)
│   ├── index.html        # 대시보드 메인
│   ├── login.html        # 로그인·회원가입 페이지
│   ├── style.css
│   └── app.js
│
├── DEVELOPMENT.md        # 이 문서
└── checklist.md          # 랜딩 페이지 체크리스트 (완료)
```

---

## Phase 1 — 백엔드 기반 세팅

### 1-1. Node.js 프로젝트 초기화

- [ ] `server/` 폴더 생성 후 `npm init -y` 실행
- [ ] 필수 패키지 설치
  ```bash
  npm install express cors dotenv better-sqlite3 bcrypt jsonwebtoken axios cheerio
  npm install -D nodemon
  ```
- [ ] `package.json`에 `"dev": "nodemon index.js"` 스크립트 추가
- [ ] `server/.env` 파일 생성
  ```
  PORT=3000
  JWT_SECRET=여기에_랜덤_비밀키_입력
  DB_PATH=./dailyclip.db
  ```
- [ ] `server/.gitignore` 에 `.env`, `*.db`, `node_modules/` 추가

### 1-2. Express 서버 기본 구성

- [ ] `server/index.js` 작성
  - [ ] `express()` 인스턴스 생성
  - [ ] `cors()` 미들웨어 적용 (랜딩/앱 도메인 허용)
  - [ ] `express.json()` 미들웨어 적용
  - [ ] 라우터 연결 (`/api/auth`, `/api/clips`, `/api/scrape`)
  - [ ] `PORT` 환경변수로 서버 실행
- [ ] 브라우저 또는 curl로 `http://localhost:3000` 응답 확인

### 1-3. 데이터베이스 스키마 설계

- [ ] `server/models/db.js` 작성 (better-sqlite3 연결)
- [ ] `users` 테이블 생성
  ```sql
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    email     TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
  ```
- [ ] `clips` 테이블 생성
  ```sql
  CREATE TABLE IF NOT EXISTS clips (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    url         TEXT NOT NULL,
    title       TEXT,
    summary     TEXT,
    thumbnail   TEXT,
    source      TEXT,
    clipped_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  ```
- [ ] 서버 시작 시 테이블 자동 생성 확인

---

## Phase 2 — 인증 시스템 (회원가입 · 로그인)

### 2-1. 회원가입 API

- [ ] `POST /api/auth/register` 엔드포인트 구현
  - [ ] `email`, `password` 입력값 검증 (빈 값, 이메일 형식)
  - [ ] `bcrypt.hash(password, 10)` 로 비밀번호 해싱
  - [ ] `users` 테이블에 저장
  - [ ] 이메일 중복 시 `409 Conflict` 응답
  - [ ] 성공 시 `201 Created` + 유저 정보(id, email) 응답

### 2-2. 로그인 API

- [ ] `POST /api/auth/login` 엔드포인트 구현
  - [ ] 이메일로 유저 조회, 없으면 `401` 응답
  - [ ] `bcrypt.compare()` 로 비밀번호 검증
  - [ ] `jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })` 토큰 발급
  - [ ] 성공 시 `{ token, user: { id, email } }` 응답

### 2-3. JWT 인증 미들웨어

- [ ] `server/middleware/auth.js` 작성
  - [ ] `Authorization: Bearer <token>` 헤더 파싱
  - [ ] `jwt.verify()` 로 토큰 검증
  - [ ] `req.user` 에 디코딩된 페이로드 주입
  - [ ] 토큰 없거나 만료 시 `401` 응답

### 2-4. 인증 테스트

- [ ] Postman 또는 curl로 회원가입 요청 성공 확인
- [ ] 로그인 후 JWT 토큰 반환 확인
- [ ] 잘못된 비밀번호로 로그인 시 `401` 응답 확인

---

## Phase 3 — 뉴스 URL 스크래핑

### 3-1. 스크래퍼 유틸리티

- [ ] `server/utils/scraper.js` 작성
  - [ ] `axios.get(url)` 로 HTML 가져오기 (User-Agent 헤더 설정)
  - [ ] `cheerio.load(html)` 로 파싱
  - [ ] 다음 순서로 제목 추출 시도
    1. `<meta property="og:title">`
    2. `<meta name="twitter:title">`
    3. `<title>` 태그
  - [ ] 썸네일 이미지 URL 추출
    1. `<meta property="og:image">`
    2. `<meta name="twitter:image">`
  - [ ] 요약 텍스트 추출
    1. `<meta property="og:description">`
    2. `<meta name="description">`
  - [ ] 도메인 추출 (출처 표시용): `new URL(url).hostname`
  - [ ] `{ title, thumbnail, summary, source }` 반환

### 3-2. 스크래핑 API

- [ ] `POST /api/scrape` 엔드포인트 구현 (JWT 인증 필요)
  - [ ] `url` 파라미터 검증 (빈 값, 유효한 URL 형식)
  - [ ] `scraper.js` 호출하여 메타 정보 추출
  - [ ] 성공 시 추출된 데이터 반환 (저장은 별도 API)
  - [ ] 스크래핑 실패(접근 차단, 타임아웃 등) 시 적절한 에러 응답
- [ ] 네이버 뉴스, 연합뉴스, 조선일보 등 주요 뉴스 사이트 스크래핑 테스트

---

## Phase 4 — 클립 저장 · 조회 · 삭제 API

### 4-1. 클립 저장

- [ ] `POST /api/clips` 엔드포인트 구현 (JWT 인증 필요)
  - [ ] 내부적으로 스크래퍼 호출하거나, 클라이언트에서 받은 데이터 저장
  - [ ] `clips` 테이블에 `user_id` 포함하여 INSERT
  - [ ] 성공 시 생성된 클립 데이터 반환

### 4-2. 클립 목록 조회

- [ ] `GET /api/clips` 엔드포인트 구현 (JWT 인증 필요)
  - [ ] 현재 로그인 유저의 클립만 반환 (`WHERE user_id = ?`)
  - [ ] 최신순 정렬 (`ORDER BY clipped_at DESC`)
  - [ ] 날짜별 필터링 쿼리 파라미터 지원 (`?date=2025-03-25`)

### 4-3. 클립 단건 조회

- [ ] `GET /api/clips/:id` 엔드포인트 구현
  - [ ] 다른 유저의 클립 접근 시 `403 Forbidden` 응답

### 4-4. 클립 삭제

- [ ] `DELETE /api/clips/:id` 엔드포인트 구현
  - [ ] 본인 클립만 삭제 가능하도록 `user_id` 검증

---

## Phase 5 — 프론트엔드 앱 (대시보드)

### 5-1. 인증 페이지 (`app/login.html`)

- [ ] 로그인 폼 마크업 (이메일, 비밀번호, 로그인 버튼)
- [ ] 회원가입 폼 마크업 (탭 전환 또는 별도 섹션)
- [ ] `app.js` 에서 폼 제출 시 `POST /api/auth/login` 호출
- [ ] 응답받은 JWT 토큰을 `localStorage.setItem('token', ...)` 저장
- [ ] 로그인 성공 시 `app/index.html` 로 리다이렉트
- [ ] 이미 로그인된 상태면 로그인 페이지 접근 시 대시보드로 리다이렉트

### 5-2. 대시보드 페이지 (`app/index.html`)

- [ ] 페이지 진입 시 `localStorage` 에 토큰 없으면 `login.html` 로 리다이렉트
- [ ] 상단 네비게이션
  - [ ] DailyClip 로고 (링크)
  - [ ] 로그아웃 버튼 (토큰 삭제 + 리다이렉트)
- [ ] URL 입력 영역
  - [ ] URL 입력 `<input>` + "스크랩하기" 버튼
  - [ ] 버튼 클릭 시 `POST /api/clips` 호출 (Authorization 헤더 포함)
  - [ ] 로딩 스피너 표시 (스크래핑 중)
  - [ ] 성공 시 클립 목록에 즉시 추가 (낙관적 업데이트 또는 목록 재조회)
  - [ ] 실패 시 에러 메시지 표시
- [ ] 클립 목록
  - [ ] 페이지 로드 시 `GET /api/clips` 호출하여 목록 렌더링
  - [ ] 각 클립 카드: 썸네일, 제목, 출처, 저장 날짜, 삭제 버튼
  - [ ] 날짜별 그룹핑 표시 (예: "2025년 3월 25일 (3개)")
  - [ ] 클립이 없을 때 빈 상태 안내 메시지
- [ ] 날짜 필터
  - [ ] `<input type="date">` 로 특정 날짜 클립 필터링
  - [ ] 필터 초기화 버튼

### 5-3. 랜딩 페이지 CTA 연결

- [ ] `landing/script.js` 의 CTA 버튼 클릭 시
  - [ ] `localStorage` 에 토큰 있으면 → `app/index.html` 로 이동
  - [ ] 없으면 → `app/login.html` 로 이동
- [ ] 모달 "서비스 준비 중" 메시지를 실제 로그인 페이지 링크로 교체

---

## Phase 6 — 보안 강화

- [ ] 입력값 길이 제한 (URL 최대 2000자, 이메일 최대 255자)
- [ ] `helmet` 패키지로 보안 헤더 설정
  ```bash
  npm install helmet
  ```
- [ ] Rate limiting 적용 (로그인 API: 1분에 5회 제한)
  ```bash
  npm install express-rate-limit
  ```
- [ ] SQL Injection 방지: prepared statement 사용 확인 (better-sqlite3 기본 지원)
- [ ] CORS 허용 도메인 `*` → 실제 도메인으로 제한
- [ ] `.env` 파일이 `.gitignore` 에 포함되어 있는지 재확인

---

## Phase 7 — 배포

### 7-1. 배포 전 준비

- [ ] `server/` 에 `Procfile` 생성: `web: node index.js`
- [ ] `package.json` 에 `"start": "node index.js"` 스크립트 추가
- [ ] SQLite → PostgreSQL 마이그레이션 (Render 등 배포 환경)
  - [ ] `npm install pg` 설치
  - [ ] `db.js` 를 pg Pool 방식으로 교체
  - [ ] SQL 쿼리 PostgreSQL 문법 검토

### 7-2. Render.com 배포 (무료)

- [ ] GitHub에 레포지토리 push
- [ ] Render에서 "New Web Service" 생성
- [ ] `server/` 경로를 루트 디렉토리로 설정
- [ ] 환경변수(`JWT_SECRET`, `DATABASE_URL` 등) Render 대시보드에서 설정
- [ ] 배포 후 API 엔드포인트 동작 확인

### 7-3. 프론트엔드 정적 배포 (Netlify / GitHub Pages)

- [ ] `landing/` 과 `app/` 폴더를 정적 호스팅에 배포
- [ ] `app.js` 의 API 기본 URL을 배포된 백엔드 주소로 변경
  ```js
  const API_BASE = 'https://your-app.onrender.com/api';
  ```

---

## 개발 순서 요약 (권장)

```
Phase 1 (백엔드 세팅)
  → Phase 2 (인증 API + Postman 테스트)
    → Phase 3 (스크래핑 유틸리티)
      → Phase 4 (클립 CRUD API)
        → Phase 5-1 (로그인 페이지)
          → Phase 5-2 (대시보드)
            → Phase 5-3 (랜딩 연결)
              → Phase 6 (보안)
                → Phase 7 (배포)
```

---

## API 명세 요약

| Method | Path | 인증 | 설명 |
|---|---|---|---|
| POST | `/api/auth/register` | X | 회원가입 |
| POST | `/api/auth/login` | X | 로그인 → JWT 발급 |
| POST | `/api/scrape` | O | URL 메타 정보 추출 |
| GET | `/api/clips` | O | 내 클립 목록 조회 |
| POST | `/api/clips` | O | 클립 저장 |
| GET | `/api/clips/:id` | O | 클립 단건 조회 |
| DELETE | `/api/clips/:id` | O | 클립 삭제 |

---

## 참고 자료

- [Express 공식 문서](https://expressjs.com/)
- [better-sqlite3 GitHub](https://github.com/WiseLibs/better-sqlite3)
- [Cheerio 공식 문서](https://cheerio.js.org/)
- [JWT 소개 (jwt.io)](https://jwt.io/introduction)
- [bcrypt npm](https://www.npmjs.com/package/bcrypt)
