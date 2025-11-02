# EduManage Complete Startup Script
# This script starts the complete school ERP system with all features

Write-Host "🚀 Starting EduManage School ERP System..." -ForegroundColor Green
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonVersion = python --version
    Write-Host "✅ $pythonVersion installed" -ForegroundColor Green
} else {
    Write-Host "❌ Python not found. Please install Python 3.10+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing/Verifying Dependencies..." -ForegroundColor Yellow

# Install backend dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
Set-Location backend
$pipInstall = pip install -r requirements.txt 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some backend dependencies may have issues. Continuing..." -ForegroundColor Yellow
}
Set-Location ..

# Install frontend dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🗄️  Setting up Database..." -ForegroundColor Yellow
Set-Location backend

# Check if database exists
if (-not (Test-Path "db.sqlite3")) {
    Write-Host "Creating database..." -ForegroundColor Cyan
    python manage.py migrate
    Write-Host "✅ Database created" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "👤 Creating superuser..." -ForegroundColor Yellow
    Write-Host "You'll need to create an admin account:"
    python manage.py createsuperuser
} else {
    Write-Host "✅ Database exists" -ForegroundColor Green
    Write-Host "Running pending migrations..." -ForegroundColor Cyan
    python manage.py migrate --no-input
}

Set-Location ..

Write-Host ""
Write-Host "🔥 Starting Services..." -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "Starting Django Backend on http://localhost:8000" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\backend'; python manage.py runserver"

# Wait for backend to start
Start-Sleep -Seconds 3

# Check if backend started
$backendRunning = Test-Port -Port 8000
if ($backendRunning) {
    Write-Host "✅ Backend started successfully on http://localhost:8000" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend may take a moment to start..." -ForegroundColor Yellow
}

# Start Frontend
Write-Host "Starting React Frontend..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD'; npm run dev"

# Wait for frontend to start
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "🎉 EduManage is Starting!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:5173 (or check terminal for actual port)" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 Admin Panel: http://localhost:8000/admin" -ForegroundColor Cyan
Write-Host "📖 API Docs: http://localhost:8000/api/docs/" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Test Accounts:" -ForegroundColor Yellow
Write-Host "   Admin: Use the superuser you created" -ForegroundColor White
Write-Host "   Teacher: Create from admin panel" -ForegroundColor White
Write-Host "   Student: Create from admin panel" -ForegroundColor White
Write-Host "   Parent: Create from admin panel" -ForegroundColor White
Write-Host ""
Write-Host "📋 Features Available:" -ForegroundColor Yellow
Write-Host "   ✅ Admin Dashboard - Complete management system" -ForegroundColor White
Write-Host "   ✅ Teacher Portal - Classes, grades, attendance" -ForegroundColor White
Write-Host "   ✅ Student Portal - Courses, assignments, grades" -ForegroundColor White
Write-Host "   ✅ Parent Portal - Track children's progress (Phase 1 Complete!)" -ForegroundColor White
Write-Host "   ✅ Communication - Messages and notifications" -ForegroundColor White
Write-Host "   ✅ Academic Management - Classes, subjects, exams" -ForegroundColor White
Write-Host "   ✅ HR & Payroll - Staff management" -ForegroundColor White
Write-Host "   ✅ Finance - Fees, expenses, accounting" -ForegroundColor White
Write-Host ""
Write-Host "🔧 To Stop Services:" -ForegroundColor Yellow
Write-Host "   Close the PowerShell windows that opened" -ForegroundColor White
Write-Host "   Or press Ctrl+C in each terminal" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Yellow
Write-Host "   - QUICK_START.md - Getting started guide" -ForegroundColor White
Write-Host "   - PHASE11_PART1_COMPLETE.md - Parent Portal features" -ForegroundColor White
Write-Host "   - PROJECT_README.md - Complete project documentation" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "Happy Learning! 🎓" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit this window (services will keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
