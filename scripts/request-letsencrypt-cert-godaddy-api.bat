@echo off
setlocal

if "%1"=="" (
  echo Usage: request-letsencrypt-cert-godaddy-api.bat YOUR_EMAIL_ADDRESS [DOMAIN] [WWW_DOMAIN]
  echo Use "-" for WWW_DOMAIN to issue a certificate for the primary domain only.
  exit /b 1
)

set EMAIL=%1
set DOMAIN=%~2
if "%DOMAIN%"=="" set DOMAIN=peopalawan.com
set WWW_DOMAIN=%~3
if "%WWW_DOMAIN%"=="" set WWW_DOMAIN=www.%DOMAIN%
if /I "%WWW_DOMAIN%"=="-" set WWW_DOMAIN=
set CREDENTIALS=C:\Users\Administrator\Desktop\peo-worksystem\secrets\godaddy.ini
set LE_CONFIG_DIR=C:\etc\letsencrypt
set LE_WORK_DIR=C:\etc\letsencrypt-lib
set LE_LOGS_DIR=C:\etc\letsencrypt-log

if not exist "%LE_CONFIG_DIR%" mkdir "%LE_CONFIG_DIR%"
if not exist "%LE_WORK_DIR%" mkdir "%LE_WORK_DIR%"
if not exist "%LE_LOGS_DIR%" mkdir "%LE_LOGS_DIR%"

if not exist "%CREDENTIALS%" (
  echo Missing GoDaddy credentials file: %CREDENTIALS%
  echo Copy .godaddy-api.example.ini to that path and add your real API key and secret.
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Administrator\Desktop\peo-worksystem\scripts\clear-stale-certbot-lock.ps1"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Administrator\Desktop\peo-worksystem\scripts\test-godaddy-api.ps1" -CredentialsPath "%CREDENTIALS%" -Domain "%DOMAIN%"
if errorlevel 1 exit /b 1

if "%WWW_DOMAIN%"=="" (
  docker run --rm ^
    -v %LE_CONFIG_DIR%:/etc/letsencrypt ^
    -v %LE_WORK_DIR%:/var/lib/letsencrypt ^
    -v %LE_LOGS_DIR%:/var/log/letsencrypt ^
    -v C:\Users\Administrator\Desktop\peo-worksystem\secrets:/run/secrets:ro ^
    miigotu/certbot-dns-godaddy certbot certonly ^
    --config-dir /etc/letsencrypt ^
    --work-dir /var/lib/letsencrypt ^
    --logs-dir /var/log/letsencrypt ^
    --authenticator dns-godaddy ^
    --dns-godaddy-credentials /run/secrets/godaddy.ini ^
    --dns-godaddy-propagation-seconds 900 ^
    --cert-name %DOMAIN% ^
    --keep-until-expiring ^
    --non-interactive ^
    --agree-tos ^
    --server https://acme-v02.api.letsencrypt.org/directory ^
    --email %EMAIL% ^
    -d %DOMAIN%
) else (
  docker run --rm ^
    -v %LE_CONFIG_DIR%:/etc/letsencrypt ^
    -v %LE_WORK_DIR%:/var/lib/letsencrypt ^
    -v %LE_LOGS_DIR%:/var/log/letsencrypt ^
    -v C:\Users\Administrator\Desktop\peo-worksystem\secrets:/run/secrets:ro ^
    miigotu/certbot-dns-godaddy certbot certonly ^
    --config-dir /etc/letsencrypt ^
    --work-dir /var/lib/letsencrypt ^
    --logs-dir /var/log/letsencrypt ^
    --authenticator dns-godaddy ^
    --dns-godaddy-credentials /run/secrets/godaddy.ini ^
    --dns-godaddy-propagation-seconds 900 ^
    --cert-name %DOMAIN% ^
    --keep-until-expiring ^
    --non-interactive ^
    --agree-tos ^
    --server https://acme-v02.api.letsencrypt.org/directory ^
    --email %EMAIL% ^
    -d %DOMAIN% ^
    -d %WWW_DOMAIN%
)

endlocal
