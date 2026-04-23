@echo off
REM Setup Windows Task Scheduler for Auto-Start
REM Run this script as Administrator

echo.
echo ========================================
echo PEO Worksystem - Auto-Start Setup
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

set PROJECT_PATH=C:\Users\Administrator\Desktop\peo-worksystem
set REGISTER_SCRIPT=%PROJECT_PATH%\scripts\register-peo-autostart.ps1
set START_SCRIPT=%PROJECT_PATH%\scripts\start-peo-worksystem.ps1
set TASK_NAME=PEO Worksystem Autostart

if not exist "%REGISTER_SCRIPT%" (
    echo ERROR: Missing register script:
    echo   %REGISTER_SCRIPT%
    pause
    exit /b 1
)

if not exist "%START_SCRIPT%" (
    echo ERROR: Missing startup script:
    echo   %START_SCRIPT%
    pause
    exit /b 1
)

echo [1/3] Removing existing scheduled task (if any)...
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

echo.
echo [2/3] Creating new scheduled task...
REM Register the supported logon-based task so Docker Desktop can start in the user session.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%REGISTER_SCRIPT%" >nul 2>&1

if %errorLevel% equ 0 (
    echo Task created successfully
) else (
    echo ERROR: Failed to create scheduled task
    pause
    exit /b 1
)

echo.
echo [3/3] Verifying task...
schtasks /query /tn "%TASK_NAME%" /v
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your PEO Worksystem will now automatically start when Windows boots.
echo.
echo Task Name: %TASK_NAME%
echo Script: %START_SCRIPT%
echo Log File: %PROJECT_PATH%\auto-start-log.txt
echo.
echo This auto-start also brings up the Docker nginx service, so no manual nginx command is needed.
echo.
echo To disable auto-start, run:
echo   schtasks /delete /tn "%TASK_NAME%" /f
echo.
pause
