# SM-Genie Startup Script
# This script starts both the backend and frontend servers

Write-Host "🚀 Starting SM-Genie Application..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "server.js")) {
    Write-Host "❌ Error: Please run this script from C:\sm-genie directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow

# Check backend node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Check frontend node_modules
if (-not (Test-Path "sm-platform\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    cd sm-platform
    npm install
    cd ..
}

Write-Host "✅ Dependencies ready!" -ForegroundColor Green
Write-Host ""

# Create log directory
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

Write-Host "🔧 Starting Backend Server (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🔥 Backend Server Starting...' -ForegroundColor Green; node server.js"

Start-Sleep -Seconds 3

Write-Host "🎨 Starting Frontend Server (Port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\sm-platform'; Write-Host '🎨 Frontend Server Starting...' -ForegroundColor Blue; npm run dev"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✨ SM-Genie is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "📍 Frontend: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏳ Wait 10-15 seconds for Next.js to compile..." -ForegroundColor Cyan
Write-Host "🌐 Then open: http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tip: Two PowerShell windows will open - keep both running!" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to exit this window (servers will keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
