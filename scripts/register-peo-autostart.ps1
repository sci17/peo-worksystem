param(
    [string]$TaskName = "PEO Worksystem Autostart",
    [string]$Delay = "PT30S"
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptRoot
$startupScript = Join-Path $projectRoot "scripts\start-peo-worksystem.ps1"
. (Join-Path $scriptRoot "deployment-machine.ps1")

if (-not (Test-Path -LiteralPath $startupScript)) {
    throw "Startup script not found: $startupScript"
}

if (-not (Test-IsDeploymentMachine)) {
    throw "This autostart task can only be registered on deployment machine '$(Get-DeploymentComputerName)'. Current machine is '$env:COMPUTERNAME'."
}

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$startupScript`""

$trigger = New-ScheduledTaskTrigger -AtLogOn
$trigger.Delay = $Delay

$principal = New-ScheduledTaskPrincipal `
    -UserId "$env:USERDOMAIN\$env:USERNAME" `
    -LogonType Interactive `
    -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2)

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Starts Docker Desktop and runs docker compose up -d for the PEO Worksystem." `
    -Force | Out-Null

Write-Host "Scheduled task created: $TaskName"
