# PEO Worksystem - Auto Start Script
# This script starts the entire Docker Compose system on Windows startup

$ProjectPath = "C:\Users\Administrator\Desktop\peo-worksystem"
$LogPath = "$ProjectPath\auto-start-log.txt"

# Log function
function Log {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogPath -Value "[$Timestamp] $Message"
    Write-Host "[$Timestamp] $Message"
}

# Start logging
Log "=== PEO Worksystem Auto-Start initiated ==="

# Change to project directory
try {
    Set-Location $ProjectPath
    Log "Changed to project directory: $ProjectPath"
} catch {
    Log "ERROR: Could not change to project directory - $_"
    exit 1
}

# Wait a bit for Docker daemon to be ready
Log "Waiting for Docker daemon to be ready..."
Start-Sleep -Seconds 5

# Check if Docker is running
function Wait-Docker {
    param(
        [int]$MaxRetries = 30,
        [int]$DelaySecs = 2
    )
    for ($i = 0; $i -lt $MaxRetries; $i++) {
        try {
            docker ps >$null 2>&1
            if ($?) {
                Log "Docker daemon is ready"
                return $true
            }
        } catch {}
        Log "Docker not ready yet, waiting... (attempt $($i + 1)/$MaxRetries)"
        Start-Sleep -Seconds $DelaySecs
    }
    return $false
}

# Execute Docker Compose command with error handling
function Invoke-DockerCompose {
    param(
        [string]$Command,
        [string]$Description
    )
    Log $Description
    try {
        & docker compose $Command.Split()
        if ($?) {
            Log "$Description succeeded"
            return $true
        } else {
            Log "ERROR: $Description failed"
            return $false
        }
    } catch {
        Log "ERROR: Exception during $Description - $_"
        return $false
    }
}

if (-not (Wait-Docker)) {
    Log "ERROR: Docker daemon did not become ready after waiting"
    exit 1
}

if (-not (Invoke-DockerCompose "build --pull=false" "Building Docker Compose images...")) {
    exit 1
}

if (-not (Invoke-DockerCompose "up -d" "Starting Docker Compose services...")) {
    exit 1
}

# Wait for services to be healthy
Log "Waiting for services to stabilize..."
Start-Sleep -Seconds 15

# Verify services are running
Log "Verifying services..."
docker compose ps | Out-String | ForEach-Object { Log $_ }

Log "=== Auto-Start completed successfully ==="
