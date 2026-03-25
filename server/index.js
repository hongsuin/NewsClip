require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { ready: dbReady } = require('./models/db');
const authRouter = require('./routes/auth');
const clipsRouter = require('./routes/clips');
const scrapeRouter = require('./routes/scrape');

const app = express();
const PORT = process.env.PORT || 3000;

// file:// (null), Live Server (5500), 로컬호스트 전체 허용
app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
}));
app.use(express.json());

// 정적 파일 서빙 - app 폴더
app.use('/app', express.static(path.join(__dirname, '../app')));

// 정적 파일 서빙 - landing 폴더
app.use('/landing', express.static(path.join(__dirname, '../landing')));

// 루트 경로를 landing으로 리디렉션
app.get('/', (req, res) => {
  res.redirect('/landing/');
});

app.use('/api/auth', authRouter);
app.use('/api/clips', clipsRouter);
app.use('/api/scrape', scrapeRouter);

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DailyClip API' });
});

// 존재하지 않는 경로
app.use((req, res) => {
  res.status(404).json({ error: '요청한 경로를 찾을 수 없습니다.' });
});

// 데이터베이스 초기화 후 서버 시작
async function startServer() {
  try {
    await dbReady;
    console.log('Database ready');
    
    const server = app.listen(PORT, () => {
      console.log(`DailyClip 서버 실행 중: http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[오류] 포트 ${PORT}이 이미 사용 중입니다.`);
        console.error(`해결: "서버시작.bat" 파일을 실행하거나,`);
        console.error(`      아래 명령어로 점유 프로세스를 종료하세요:`);
        console.error(`      netstat -ano | findstr :${PORT}  → taskkill /F /PID <PID번호>\n`);
      } else {
        console.error('[서버 오류]', err.message);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
