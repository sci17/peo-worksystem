param(
    [Parameter(Mandatory = $true)]
    [string]$Email,
    [string]$Domain = "peopalawan.com",
    [int]$DockerWaitSeconds = 180
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptRoot
$dockerDesktopCandidates = @(
    "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
    "$Env:ProgramFiles\Docker\Docker\resources\Docker Desktop.exe"
)

function Wait-ForDocker {
    param([int]$TimeoutSeconds)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        Start-Sleep -Seconds 5
        try {
            docker info *> $null
            return $true
        } catch {
        }
    } while ((Get-Date) -lt $deadline)

    return $false
}

function Get-Port80Listeners {
    $lines = netstat -ano | Select-String "LISTENING"
    $lines | Where-Object { $_.Line -match "^\s*TCP\s+0\.0\.0\.0:80\s" -or $_.Line -match "^\s*TCP\s+127\.0\.0\.1:80\s" }
}

Set-Location -LiteralPath $projectRoot

New-Item -ItemType Directory -Force -Path (Join-Path $projectRoot "certbot\www\.well-known\acme-challenge") | Out-Null
New-Item -ItemType Directory -Force -Path "C:\etc\letsencrypt" | Out-Null

Write-Host "Stopping Docker Compose stack if present..."
try {
    docker compose down
} catch {
    Write-Host "Compose down skipped: $($_.Exception.Message)"
}

Write-Host "Shutting down WSL..."
try {
    wsl --shutdown
} catch {
    Write-Host "WSL shutdown skipped: $($_.Exception.Message)"
}

Write-Host "Stopping Docker Desktop background process if running..."
$dockerBackend = Get-Process -Name "com.docker.backend" -ErrorAction SilentlyContinue
if ($dockerBackend) {
    $dockerBackend | Stop-Process -Force
}

Write-Host "Checking whether port 80 is free..."
$listeners = Get-Port80Listeners
if ($listeners) {
    Write-Host "Port 80 still has listeners:"
    $listeners | ForEach-Object { Write-Host $_.Line }
}

$dockerDesktop = $dockerDesktopCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $dockerDesktop) {
    throw "Docker Desktop executable not found."
}

Write-Host "Starting Docker Desktop..."
Start-Process -FilePath $dockerDesktop | Out-Null

Write-Host "Waiting for Docker to become healthy..."
if (-not (Wait-ForDocker -TimeoutSeconds $DockerWaitSeconds)) {
    throw "Docker Desktop did not become ready within $DockerWaitSeconds seconds."
}

Write-Host "Bringing up redis, db, web, and nginx..."
docker compose up -d redis db web nginx
if ($LASTEXITCODE -ne 0) {
    throw "docker compose up failed."
}

Write-Host "Requesting Let's Encrypt certificate..."
& (Join-Path $scriptRoot "request-letsencrypt-cert.bat") $Email
if ($LASTEXITCODE -ne 0) {
    throw "Certificate request failed."
}

Write-Host "Starting HTTPS stack..."
& (Join-Path $scriptRoot "start-peo-worksystem-https.ps1") -LetsEncryptDir "C:\etc\letsencrypt" -Domain $Domain
if ($LASTEXITCODE -ne 0) {
    throw "HTTPS startup failed."
}

Write-Host ""
Write-Host "Done. Test these URLs:"
Write-Host "  https://$Domain"
Write-Host "  https://www.$Domain"
