param(
    [int]$DockerWaitSeconds = 300
)

$ErrorActionPreference = "Stop"
$projectRoot = "C:\Users\Administrator\Desktop\peo-worksystem"
$logPath = Join-Path $projectRoot "auto-start-log.txt"
$dockerDesktopPaths = @(
    "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
    "$Env:ProgramFiles\Docker\Docker\resources\Docker Desktop.exe"
)
$dockerCliPaths = @(
    "$Env:ProgramFiles\Docker\Docker\resources\bin\docker.exe",
    "docker.exe"
)

function Write-Log {
    param([string]$Message)

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $logPath -Value "[$timestamp] $Message"
}

function Invoke-DockerLogged {
    param(
        [string[]]$Arguments
    )

    $stdoutPath = Join-Path $env:TEMP ("peo-docker-" + [guid]::NewGuid().ToString() + ".out.log")
    $stderrPath = Join-Path $env:TEMP ("peo-docker-" + [guid]::NewGuid().ToString() + ".err.log")

    try {
        $process = Start-Process `
            -FilePath $dockerCli `
            -ArgumentList $Arguments `
            -Wait `
            -NoNewWindow `
            -PassThru `
            -RedirectStandardOutput $stdoutPath `
            -RedirectStandardError $stderrPath

        foreach ($path in @($stdoutPath, $stderrPath)) {
            if (Test-Path -LiteralPath $path) {
                Get-Content -LiteralPath $path | Out-File -LiteralPath $logPath -Append -Encoding utf8
            }
        }

        if ($process.ExitCode -ne 0) {
            throw "docker $($Arguments -join ' ') failed with exit code $($process.ExitCode)"
        }
    } finally {
        foreach ($path in @($stdoutPath, $stderrPath)) {
            if (Test-Path -LiteralPath $path) {
                Remove-Item -LiteralPath $path -Force
            }
        }
    }
}

Set-Location -LiteralPath $projectRoot
Write-Log "=== Autostart run started ==="

$dockerDesktop = $dockerDesktopPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $dockerDesktop) {
    Write-Log "Docker Desktop executable not found."
    throw "Docker Desktop executable was not found."
}

$dockerCli = $dockerCliPaths | Where-Object { (Test-Path $_) -or ($_ -eq "docker.exe") } | Select-Object -First 1
Write-Log "Using Docker CLI: $dockerCli"

$dockerReady = $false
try {
    Invoke-DockerLogged -Arguments @("info")
    $dockerReady = $true
    Write-Log "Docker was already ready."
} catch {
    Write-Log "Docker not ready yet. Starting Docker Desktop."
    $dockerReady = $false
}

if (-not $dockerReady) {
    Start-Process -FilePath $dockerDesktop | Out-Null

    $deadline = (Get-Date).AddSeconds($DockerWaitSeconds)
    do {
        Start-Sleep -Seconds 5
        try {
            Invoke-DockerLogged -Arguments @("info")
            $dockerReady = $true
            Write-Log "Docker became ready."
        } catch {
            $dockerReady = $false
            Write-Log "Waiting for Docker..."
        }
    } while (-not $dockerReady -and (Get-Date) -lt $deadline)
}

if (-not $dockerReady) {
    Write-Log "Docker Desktop did not become ready in time."
    throw "Docker Desktop did not become ready within $DockerWaitSeconds seconds."
}

Write-Log "Running docker compose up -d"
Invoke-DockerLogged -Arguments @("compose", "-f", (Join-Path $projectRoot "docker-compose.yml"), "up", "-d")

Write-Log "Running docker compose ps"
Invoke-DockerLogged -Arguments @("compose", "-f", (Join-Path $projectRoot "docker-compose.yml"), "ps")
Write-Log "=== Autostart run finished ==="
