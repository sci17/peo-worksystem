param(
    [int]$DockerWaitSeconds = 300
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$startupScript = Join-Path $projectRoot "scripts\start-peo-worksystem.ps1"

if (-not (Test-Path -LiteralPath $startupScript)) {
    throw "Startup script not found: $startupScript"
}

& $startupScript -DockerWaitSeconds $DockerWaitSeconds
