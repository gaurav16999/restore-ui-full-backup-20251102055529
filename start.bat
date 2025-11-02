@echo off
echo ================================================
echo   EduManage School ERP - Quick Start
echo ================================================
echo.

echo Starting Backend Server...
start "EduManage Backend" cmd /k "cd backend && python manage.py runserver"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "EduManage Frontend" cmd /k "npm run dev"

echo.
echo ================================================
echo Services are starting...
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo Admin:    http://localhost:8000/admin
echo.
echo Press any key to exit (services will keep running)
echo ================================================
pause > nul
