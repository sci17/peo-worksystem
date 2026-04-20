param(
    [int]$DockerWaitSeconds = 180
)

$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\Administrator\Desktop\peo-worksystem"
$dockerDesktopPaths = @(
    "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
    "$Env:ProgramFiles\Docker\Docker\resources\Docker Desktop.exe"
)

Set-Location -LiteralPath $projectRoot

$dockerDesktop = $dockerDesktopPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $dockerDesktop) {
    throw "Docker Desktop executable was not found."
}

$dockerReady = $false
try {
    docker info | Out-Null
    $dockerReady = $true
} catch {
    $dockerReady = $false
}

if (-not $dockerReady) {
    Start-Process -FilePath $dockerDesktop | Out-Null

    $deadline = (Get-Date).AddSeconds($DockerWaitSeconds)
    do {
        Start-Sleep -Seconds 5
        try {
            docker info | Out-Null
            $dockerReady = $true
        } catch {
            $dockerReady = $false
        }
    } while (-not $dockerReady -and (Get-Date) -lt $deadline)
}

if (-not $dockerReady) {
    throw "Docker Desktop did not become ready within $DockerWaitSeconds seconds."
}

docker compose up -d
