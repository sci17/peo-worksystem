@echo off
setlocal

set EMAIL=%~1
set CERT_DIR=C:\etc\letsencrypt\live\peopalawan.com
set FULLCHAIN=%CERT_DIR%\fullchain.pem
set PRIVKEY=%CERT_DIR%\privkey.pem
set CREDENTIALS=C:\Users\Administrator\Desktop\peo-worksystem\secrets\godaddy.ini

if exist "%FULLCHAIN%" if exist "%PRIVKEY%" goto start_https

if "%EMAIL%"=="" (
  echo TLS certificate not found: %FULLCHAIN%
  echo.
  echo To issue the certificate automatically with GoDaddy API:
  echo   .\scripts\start-peo-worksystem-https-dns.bat your-email@example.com
  echo.
  echo Or use the manual DNS challenge:
  echo   .\scripts\request-letsencrypt-cert-dns.bat your-email@example.com
  exit /b 1
)

if not exist "%CREDENTIALS%" (
  echo TLS certificate not found: %FULLCHAIN%
  echo Missing GoDaddy credentials file: %CREDENTIALS%
  echo.
  echo Either create that file and rerun:
  echo   .\scripts\start-peo-worksystem-https-dns.bat %EMAIL%
  echo.
  echo Or use the manual DNS challenge:
  echo   .\scripts\request-letsencrypt-cert-dns.bat %EMAIL%
  exit /b 1
)

call "C:\Users\Administrator\Desktop\peo-worksystem\scripts\request-letsencrypt-cert-godaddy-api.bat" %EMAIL%
if errorlevel 1 (
  echo.
  echo GoDaddy API issuance did not complete. Falling back to webroot validation for peopalawan.com and www.peopalawan.com...
  call "C:\Users\Administrator\Desktop\peo-worksystem\scripts\request-letsencrypt-cert.bat" %EMAIL%
  if errorlevel 1 exit /b 1
)

:start_https
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Administrator\Desktop\peo-worksystem\scripts\start-peo-worksystem-https.ps1" -LetsEncryptDir "C:\etc\letsencrypt" -Domain "peopalawan.com"

endlocal
