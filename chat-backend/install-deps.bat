@echo off
echo ========================================
echo Installing Chat Backend Dependencies
echo ========================================
echo.

echo [1/3] Installing production dependencies...
npm install uuid @nestjs/terminus http-proxy-middleware prom-client @aws-sdk/client-s3 amqplib amqp-connection-manager

echo.
echo [2/3] Installing development dependencies...
npm install -D @types/uuid @types/multer @types/amqplib

echo.
echo [3/3] Installing all dependencies from package.json...
npm install

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo You can now run the services:
echo   npx dotenv -e .env -- nest start user-service --watch
echo   npx dotenv -e .env -- nest start chat-service --watch
echo   npx dotenv -e .env -- nest start notification-service --watch
echo   npx dotenv -e .env -- nest start api-gateway --watch
echo.
pause
