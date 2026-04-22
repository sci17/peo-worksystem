@echo off
setlocal

if "%1"=="" (
  echo Usage: request-letsencrypt-cert-dns.bat YOUR_EMAIL_ADDRESS
  exit /b 1
)

set EMAIL=%1
set DOMAIN=peopalawan.com
set WWW_DOMAIN=www.peopalawan.com
set LE_CONFIG_DIR=C:\etc\letsencrypt
set LE_WORK_DIR=C:\etc\letsencrypt-lib
set LE_LOGS_DIR=C:\etc\letsencrypt-log

if not exist "%LE_CONFIG_DIR%" mkdir "%LE_CONFIG_DIR%"
if not exist "%LE_WORK_DIR%" mkdir "%LE_WORK_DIR%"
if not exist "%LE_LOGS_DIR%" mkdir "%LE_LOGS_DIR%"

docker run --rm -it ^
  -v %LE_CONFIG_DIR%:/etc/letsencrypt ^
  -v %LE_WORK_DIR%:/var/lib/letsencrypt ^
  -v %LE_LOGS_DIR%:/var/log/letsencrypt ^
  certbot/certbot certonly --manual ^
  --config-dir /etc/letsencrypt ^
  --work-dir /var/lib/letsencrypt ^
  --logs-dir /var/log/letsencrypt ^
  --preferred-challenges dns ^
  --cert-name %DOMAIN% ^
  --agree-tos ^
  --no-eff-email ^
  -m %EMAIL% ^
  -d %DOMAIN% ^
  -d %WWW_DOMAIN%

endlocal
