@echo off
echo Starting Cardiac Arrest Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d "D:\Mini Project\Cardiac-Arrest\Basic Backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d "D:\Mini Project\Cardiac-Arrest\frontend" && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:8080
echo.
echo Press any key to exit...
pause >nul
