@echo off
echo Starting all microservices...

REM Open new terminal for User Service
start cmd /k "cd /d %~dp0 && npx dotenv -e .env -- nest start user-service --watch"

REM Wait 3 seconds
timeout /t 3 /nobreak

REM Open new terminal for Chat Service
start cmd /k "cd /d %~dp0 && npx dotenv -e .env -- nest start chat-service --watch"

REM Wait 3 seconds
timeout /t 3 /nobreak

REM Open new terminal for Notification Service
start cmd /k "cd /d %~dp0 && npx dotenv -e .env -- nest start notification-service --watch"

echo All services are starting...
echo Check the opened terminals for status.
pause
