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
set SCRIPT_PATH=%PROJECT_PATH%\auto-start-system.ps1
set TASK_NAME=PEO-Worksystem-AutoStart

echo [1/3] Removing existing scheduled task (if any)...
taskkill /F /IM auto-start-system.ps1 >nul 2>&1
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

echo.
echo [2/3] Creating new scheduled task...
REM Create task to run at startup with highest privileges
schtasks /create /tn "%TASK_NAME%" /tr "powershell -ExecutionPolicy Bypass -NoProfile -File \"%SCRIPT_PATH%\"" /sc onstart /ru SYSTEM /f >nul 2>&1

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
echo Script: %SCRIPT_PATH%
echo Log File: %PROJECT_PATH%\auto-start-log.txt
echo.
echo To disable auto-start, run:
echo   schtasks /delete /tn "%TASK_NAME%" /f
echo.
pause
