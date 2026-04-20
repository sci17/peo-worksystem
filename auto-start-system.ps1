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
$maxRetries = 30
$retryCount = 0
$dockerReady = $false

while ($retryCount -lt $maxRetries) {
    try {
        docker ps >$null 2>&1
        if ($?) {
            $dockerReady = $true
            Log "Docker daemon is ready"
            break
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Log "Docker not ready yet, waiting... (attempt $retryCount/$maxRetries)"
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $dockerReady) {
    Log "ERROR: Docker daemon did not become ready after waiting"
    exit 1
}

# Start Docker Compose services
Log "Starting Docker Compose services..."
try {
    docker compose up -d
    if ($?) {
        Log "Docker Compose services started successfully"
    } else {
        Log "ERROR: Failed to start Docker Compose services"
        exit 1
    }
} catch {
    Log "ERROR: Exception during docker compose up - $_"
    exit 1
}

# Wait for services to be healthy
Log "Waiting for services to stabilize..."
Start-Sleep -Seconds 15

# Verify services are running
Log "Verifying services..."
docker compose ps | Out-String | ForEach-Object { Log $_ }

Log "=== Auto-Start completed successfully ==="
