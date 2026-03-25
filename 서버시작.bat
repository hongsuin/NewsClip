@echo off
chcp 65001 > nul
echo [DailyClip] 서버 시작 중...

:: 8080번 포트 사용 중인 프로세스 자동 종료
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr "0.0.0.0:8080.*LISTENING"') do (
  echo [DailyClip] 포트 8080 점유 PID %%a 종료 중...
  taskkill /F /PID %%a > nul 2>&1
)

timeout /t 1 /nobreak > nul

:: 서버 시작
cd /d "%~dp0server"
echo [DailyClip] http://localhost:8080 에서 실행 중
echo [DailyClip] 종료하려면 이 창을 닫으세요.
echo.
node index.js
