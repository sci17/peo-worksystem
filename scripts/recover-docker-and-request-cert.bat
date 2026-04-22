@echo off
if "%1"=="" (
  echo Usage: recover-docker-and-request-cert.bat YOUR_EMAIL_ADDRESS
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Administrator\Desktop\peo-worksystem\scripts\recover-docker-and-request-cert.ps1" -Email "%~1"
