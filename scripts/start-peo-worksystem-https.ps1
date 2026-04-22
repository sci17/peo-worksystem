param(
    [string]$LetsEncryptDir = "C:\etc\letsencrypt",
    [string]$Domain = "peopalawan.com"
)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptRoot
$composeFile = Join-Path $projectRoot "docker-compose.yml"
$httpsComposeFile = Join-Path $projectRoot "docker-compose.https.yml"
$certDir = Join-Path $LetsEncryptDir ("live\" + $Domain)
$fullchainPath = Join-Path $certDir "fullchain.pem"
$privkeyPath = Join-Path $certDir "privkey.pem"

if (-not (Test-Path -LiteralPath $composeFile)) {
    throw "Missing compose file: $composeFile"
}

if (-not (Test-Path -LiteralPath $httpsComposeFile)) {
    throw "Missing HTTPS override file: $httpsComposeFile"
}

if (-not (Test-Path -LiteralPath $fullchainPath)) {
    throw @"
TLS certificate not found: $fullchainPath

Issue a certificate first, then rerun this command.

Automated GoDaddy API flow:
  .\scripts\start-peo-worksystem-https-dns.bat your-email@example.com

Manual DNS challenge flow:
  .\scripts\request-letsencrypt-cert-dns.bat your-email@example.com
  .\scripts\start-peo-worksystem-https-dns.bat
"@
}

if (-not (Test-Path -LiteralPath $privkeyPath)) {
    throw "TLS private key not found: $privkeyPath"
}

$env:LETSENCRYPT_DIR = $LetsEncryptDir
$env:NGINX_CONF_PATH = "./nginx/default-ssl.conf"

Set-Location -LiteralPath $projectRoot
docker compose -f $composeFile -f $httpsComposeFile up -d
if ($LASTEXITCODE -ne 0) {
    throw "docker compose HTTPS startup failed."
}

docker compose -f $composeFile -f $httpsComposeFile ps
if ($LASTEXITCODE -ne 0) {
    throw "docker compose HTTPS status check failed."
}
