@echo off
setlocal
docker compose up -d postgres
cd apps\api
call npm install
call npm run setup
echo.
echo Admin: admin@novashop.vn / 123456
echo Customer: customer@gmail.com / 123456
echo Backend: http://localhost:4000
echo Frontend: http://localhost:5173
