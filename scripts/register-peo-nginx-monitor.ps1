param(
    [string]$TaskName = "PEO Worksystem Nginx Monitor",
    [int]$RepeatMinutes = 5
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptRoot
$monitorScript = Join-Path $projectRoot "scripts\monitor-nginx.ps1"

if (-not (Test-Path -LiteralPath $monitorScript)) {
    throw "Nginx monitor script not found: $monitorScript"
}

$taskCommand = "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$monitorScript`""

& schtasks.exe `
    /Create `
    /TN $TaskName `
    /TR $taskCommand `
    /SC MINUTE `
    /MO $RepeatMinutes `
    /RL HIGHEST `
    /IT `
    /F

if ($LASTEXITCODE -ne 0) {
    throw "schtasks.exe failed with exit code $LASTEXITCODE"
}

Write-Host "Scheduled task created: $TaskName"
