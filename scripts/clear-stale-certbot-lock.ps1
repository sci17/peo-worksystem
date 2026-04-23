param(
    [string]$LetsEncryptDir = "C:\etc\letsencrypt"
)

$ErrorActionPreference = "Stop"

$lockPath = Join-Path $LetsEncryptDir ".certbot.lock"

if (-not (Test-Path -LiteralPath $lockPath)) {
    exit 0
}

$runningCertbotProcess = Get-Process -Name "certbot" -ErrorAction SilentlyContinue
$runningCertbotContainer = $null

try {
    $dockerOutput = & docker ps --format "{{.Image}} {{.Names}}" 2>$null
    if ($LASTEXITCODE -eq 0 -and $dockerOutput) {
        $runningCertbotContainer = $dockerOutput | Select-String "certbot"
    }
} catch {
    $runningCertbotContainer = $null
}

if ($runningCertbotProcess -or $runningCertbotContainer) {
    Write-Host "Certbot appears to still be running. Leaving lock file in place:"
    Write-Host "  $lockPath"
    exit 0
}

Remove-Item -LiteralPath $lockPath -Force
Write-Host "Removed stale Certbot lock:"
Write-Host "  $lockPath"
