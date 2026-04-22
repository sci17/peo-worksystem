@echo off
setlocal

if "%1"=="" (
  echo Usage: request-letsencrypt-cert.bat YOUR_EMAIL_ADDRESS
  exit /b 1
)

set EMAIL=%1
set DOMAIN=peopalawan.com
set WWW_DOMAIN=www.peopalawan.com
set WEBROOT=C:\Users\Administrator\Desktop\peo-worksystem\certbot\www
set LE_CONFIG_DIR=C:\etc\letsencrypt
set LE_WORK_DIR=C:\etc\letsencrypt-lib
set LE_LOGS_DIR=C:\etc\letsencrypt-log

if not exist "%LE_CONFIG_DIR%" mkdir "%LE_CONFIG_DIR%"
if not exist "%LE_WORK_DIR%" mkdir "%LE_WORK_DIR%"
if not exist "%LE_LOGS_DIR%" mkdir "%LE_LOGS_DIR%"

docker compose start nginx >nul 2>&1
if errorlevel 1 (
  docker compose up -d --no-deps --no-recreate nginx
  if errorlevel 1 exit /b 1
)

docker run --rm ^
  -v %LE_CONFIG_DIR%:/etc/letsencrypt ^
  -v %LE_WORK_DIR%:/var/lib/letsencrypt ^
  -v %LE_LOGS_DIR%:/var/log/letsencrypt ^
  -v %WEBROOT%:/var/www/certbot ^
  certbot/certbot certonly --webroot ^
  --config-dir /etc/letsencrypt ^
  --work-dir /var/lib/letsencrypt ^
  --logs-dir /var/log/letsencrypt ^
  -w /var/www/certbot ^
  --cert-name %DOMAIN% ^
  --agree-tos ^
  --no-eff-email ^
  -m %EMAIL% ^
  -d %DOMAIN% ^
  -d %WWW_DOMAIN%

endlocal
