param(
    [string]$TaskName = "PEO Worksystem Autostart"
)

$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\Administrator\Desktop\peo-worksystem"
$startupScript = Join-Path $projectRoot "scripts\start-peo-worksystem.ps1"

if (-not (Test-Path -LiteralPath $startupScript)) {
    throw "Startup script not found: $startupScript"
}

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$startupScript`""

$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2)

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Starts Docker Desktop and runs docker compose up -d for the PEO Worksystem." `
    -Force | Out-Null

Write-Host "Scheduled task created: $TaskName"
