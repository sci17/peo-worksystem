param(
    [int]$ComposeWaitSeconds = 30
)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptRoot
$logPath = Join-Path $projectRoot "auto-start-log.txt"
$dockerCliPaths = @(
    "$Env:ProgramFiles\Docker\Docker\resources\bin\docker.exe",
    "docker.exe"
)
$composeFile = Join-Path $projectRoot "docker-compose.yml"

function Write-Log {
    param([string]$Message)

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $logPath -Value "[$timestamp] [nginx-monitor] $Message"
}

function Invoke-DockerLogged {
    param(
        [string[]]$Arguments,
        [switch]$AllowFailure
    )

    $stdoutPath = Join-Path $env:TEMP ("peo-nginx-monitor-" + [guid]::NewGuid().ToString() + ".out.log")
    $stderrPath = Join-Path $env:TEMP ("peo-nginx-monitor-" + [guid]::NewGuid().ToString() + ".err.log")

    try {
        $process = Start-Process `
            -FilePath $dockerCli `
            -ArgumentList $Arguments `
            -Wait `
            -NoNewWindow `
            -PassThru `
            -RedirectStandardOutput $stdoutPath `
            -RedirectStandardError $stderrPath

        $stdout = if (Test-Path -LiteralPath $stdoutPath) {
            $content = Get-Content -LiteralPath $stdoutPath -Raw
            if ($null -ne $content) { $content.Trim() } else { "" }
        } else {
            ""
        }

        $stderr = if (Test-Path -LiteralPath $stderrPath) {
            $content = Get-Content -LiteralPath $stderrPath -Raw
            if ($null -ne $content) { $content.Trim() } else { "" }
        } else {
            ""
        }

        if ($stdout) {
            $stdout | Out-File -LiteralPath $logPath -Append -Encoding utf8
        }

        if ($stderr) {
            $stderr | Out-File -LiteralPath $logPath -Append -Encoding utf8
        }

        if ($process.ExitCode -ne 0 -and -not $AllowFailure) {
            throw "docker $($Arguments -join ' ') failed with exit code $($process.ExitCode)"
        }

        return [pscustomobject]@{
            ExitCode = $process.ExitCode
            StdOut = $stdout
            StdErr = $stderr
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

$dockerCli = $dockerCliPaths | Where-Object { (Test-Path $_) -or ($_ -eq "docker.exe") } | Select-Object -First 1
if (-not $dockerCli) {
    Write-Log "Docker CLI executable not found."
    throw "Docker CLI executable was not found."
}

Write-Log "Nginx monitor check started."

$dockerReady = $false
$deadline = (Get-Date).AddSeconds($ComposeWaitSeconds)
do {
    $dockerInfo = Invoke-DockerLogged -Arguments @("info") -AllowFailure
    if ($dockerInfo.ExitCode -eq 0) {
        $dockerReady = $true
        break
    }

    Start-Sleep -Seconds 3
} while ((Get-Date) -lt $deadline)

if (-not $dockerReady) {
    Write-Log "Docker is not ready. Skipping nginx monitor check."
    exit 0
}

$containerIdResult = Invoke-DockerLogged -Arguments @("compose", "-f", $composeFile, "ps", "-q", "nginx") -AllowFailure
$containerId = $containerIdResult.StdOut

if (-not $containerId) {
    Write-Log "Nginx container is missing. Starting nginx service."
    Invoke-DockerLogged -Arguments @("compose", "-f", $composeFile, "up", "-d", "nginx") | Out-Null
    Write-Log "Nginx service start requested."
    exit 0
}

$stateResult = Invoke-DockerLogged -Arguments @(
    "inspect",
    "--format",
    "{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}",
    $containerId
) -AllowFailure

if ($stateResult.ExitCode -ne 0 -or -not $stateResult.StdOut) {
    Write-Log "Could not inspect nginx container state. Restarting nginx service."
    Invoke-DockerLogged -Arguments @("compose", "-f", $composeFile, "restart", "nginx") | Out-Null
    Write-Log "Nginx restart requested after failed inspection."
    exit 0
}

$parts = $stateResult.StdOut.Split("|")
$status = if ($parts.Count -ge 1) { $parts[0] } else { "" }
$health = if ($parts.Count -ge 2) { $parts[1] } else { "none" }

if ($status -ne "running") {
    Write-Log "Nginx container status is '$status'. Restarting nginx service."
    Invoke-DockerLogged -Arguments @("compose", "-f", $composeFile, "restart", "nginx") | Out-Null
    Write-Log "Nginx restart requested because container was not running."
    exit 0
}

if ($health -eq "unhealthy") {
    Write-Log "Nginx container health is unhealthy. Restarting nginx service."
    Invoke-DockerLogged -Arguments @("compose", "-f", $composeFile, "restart", "nginx") | Out-Null
    Write-Log "Nginx restart requested because container was unhealthy."
    exit 0
}

Write-Log "Nginx monitor check passed. Status=$status Health=$health"
