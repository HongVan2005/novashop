$ErrorActionPreference = "Stop"
docker compose up -d postgres
Set-Location apps/api
npm install
npm run setup
Write-Host ""
Write-Host "Admin: admin@novashop.vn / 123456"
Write-Host "Customer: customer@gmail.com / 123456"
Write-Host ""
Write-Host "Backend: http://localhost:4000"
Write-Host "Frontend: http://localhost:5173"
