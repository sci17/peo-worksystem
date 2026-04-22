@echo off
setlocal

set EMAIL=%~1
set DOMAIN=%~2
if "%DOMAIN%"=="" set DOMAIN=peopalawan.com
set REQUEST_WWW_DOMAIN=%~3
set WWW_DOMAIN=%~3
if "%WWW_DOMAIN%"=="" set WWW_DOMAIN=www.%DOMAIN%
if /I "%WWW_DOMAIN%"=="-" set WWW_DOMAIN=
if "%REQUEST_WWW_DOMAIN%"=="" set REQUEST_WWW_DOMAIN=%WWW_DOMAIN%
if "%REQUEST_WWW_DOMAIN%"=="-" set REQUEST_WWW_DOMAIN=-
set CERT_DIR=C:\etc\letsencrypt\live\%DOMAIN%
set FULLCHAIN=%CERT_DIR%\fullchain.pem
set PRIVKEY=%CERT_DIR%\privkey.pem
set CREDENTIALS=C:\Users\Administrator\Desktop\peo-worksystem\secrets\godaddy.ini

if exist "%FULLCHAIN%" if exist "%PRIVKEY%" goto start_https

if "%EMAIL%"=="" (
  echo TLS certificate not found: %FULLCHAIN%
  echo.
  echo To issue the certificate automatically with GoDaddy API:
  echo   .\scripts\start-peo-worksystem-https-dns.bat your-email@example.com %DOMAIN% [WWW_DOMAIN]
  echo.
  echo Or use the manual DNS challenge:
  echo   .\scripts\request-letsencrypt-cert-dns.bat your-email@example.com %DOMAIN%
  exit /b 1
)

if not exist "%CREDENTIALS%" (
  echo TLS certificate not found: %FULLCHAIN%
  echo Missing GoDaddy credentials file: %CREDENTIALS%
  echo.
  echo Either create that file and rerun:
  echo   .\scripts\start-peo-worksystem-https-dns.bat %EMAIL% %DOMAIN% [WWW_DOMAIN]
  echo.
  echo Or use the manual DNS challenge:
  echo   .\scripts\request-letsencrypt-cert-dns.bat %EMAIL% %DOMAIN%
  exit /b 1
)

call "C:\Users\Administrator\Desktop\peo-worksystem\scripts\request-letsencrypt-cert-godaddy-api.bat" %EMAIL% %DOMAIN% %REQUEST_WWW_DOMAIN%
if errorlevel 1 (
  echo.
  if "%WWW_DOMAIN%"=="" (
    echo GoDaddy API issuance did not complete. Falling back to webroot validation for %DOMAIN% only...
  ) else (
    echo GoDaddy API issuance did not complete. Falling back to webroot validation for %DOMAIN% and %WWW_DOMAIN%...
  )
  call "C:\Users\Administrator\Desktop\peo-worksystem\scripts\request-letsencrypt-cert.bat" %EMAIL% %DOMAIN% %REQUEST_WWW_DOMAIN%
  if errorlevel 1 exit /b 1
)

:start_https
if "%WWW_DOMAIN%"=="" (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Administrator\Desktop\peo-worksystem\scripts\start-peo-worksystem-https.ps1" -LetsEncryptDir "C:\etc\letsencrypt" -Domain "%DOMAIN%" -CertificateName "%DOMAIN%" -DisableWwwDomain
) else (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Administrator\Desktop\peo-worksystem\scripts\start-peo-worksystem-https.ps1" -LetsEncryptDir "C:\etc\letsencrypt" -Domain "%DOMAIN%" -WwwDomain "%WWW_DOMAIN%" -CertificateName "%DOMAIN%"
)

endlocal
