@echo off
REM PEO Worksystem - File Sharing and Docker Setup Script
REM Run this as Administrator

echo.
echo ========================================
echo PEO Worksystem - Multi-Device Setup
echo ========================================
echo.

REM Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click Command Prompt or PowerShell and select "Run as administrator"
    pause
    exit /b 1
)

REM Change to project directory
cd /d "C:\Users\Administrator\Desktop\peo-worksystem"
if %errorLevel% neq 0 (
    echo ERROR: Could not find project directory
    pause
    exit /b 1
)

echo [1/4] Stopping Docker services...
docker compose down >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: Docker compose down failed
)
echo.

echo [2/4] Setting up SMB file sharing...
powershell -ExecutionPolicy Bypass -File .\setup-smb-share.ps1
if %errorLevel% neq 0 (
    echo ERROR: SMB share setup failed
    pause
    exit /b 1
)
echo.

echo [3/4] Starting Docker services...
docker compose up -d
if %errorLevel% neq 0 (
    echo ERROR: Docker compose up failed
    pause
    exit /b 1
)
timeout /t 10 /nobreak
echo.

echo [4/4] Verifying services...
docker compose ps
echo.

REM Get local IP
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr "IPv4" ^| findstr "192\.168\."') do set IP=%%A
set IP=%IP: =%

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Web Application: http://%IP%:8000
echo Network Share: \\%IP%\peo-shared-files
echo.
echo Username: peo-admin
echo Password: Peo@SharedAccess123
echo.
echo Next Steps:
echo 1. Open browser: http://%IP%:8000
echo 2. Create Django superuser: docker compose exec web python manage.py createsuperuser
echo 3. Map network drive on other machines to \\%IP%\peo-shared-files
echo 4. All uploaded files will be accessible to all LAN users
echo.
pause
