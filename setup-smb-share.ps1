#!/usr/bin/env powershell
# Setup SMB File Sharing for PEO Worksystem Media Files

param(
    [string]$ShareName = "peo-shared-files",
    [string]$SharedPath = "C:\ProgramData\peo-worksystem-shared",
    [string]$Username = "peo-admin",
    [string]$Password = "Peo@SharedAccess123"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PEO Worksystem - SMB Share Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Create shared folder
Write-Host "`n[1/5] Creating shared folder..." -ForegroundColor Yellow
if (!(Test-Path $SharedPath)) {
    New-Item -ItemType Directory -Path $SharedPath -Force | Out-Null
    Write-Host "✓ Created: $SharedPath" -ForegroundColor Green
} else {
    Write-Host "✓ Folder exists: $SharedPath" -ForegroundColor Green
}

# Step 2: Create local user for share access
Write-Host "`n[2/5] Creating shared access user..." -ForegroundColor Yellow
try {
    $userExists = Get-LocalUser -Name $Username -ErrorAction SilentlyContinue
    if (!$userExists) {
        $securePassword = ConvertTo-SecureString $Password -AsPlainText -Force
        New-LocalUser -Name $Username -Password $securePassword -Description "PEO Worksystem Shared Access" -PasswordNeverExpires | Out-Null
        Write-Host "✓ Created user: $Username" -ForegroundColor Green
    } else {
        Write-Host "✓ User exists: $Username" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ User creation may require admin privileges" -ForegroundColor Yellow
}

# Step 3: Set folder permissions
Write-Host "`n[3/5] Setting folder permissions..." -ForegroundColor Yellow
try {
    $acl = Get-Acl $SharedPath
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("$env:COMPUTERNAME\$Username", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.SetAccessRule($rule)
    Set-Acl -Path $SharedPath -AclObject $acl
    Write-Host "✓ Permissions set for user: $Username" -ForegroundColor Green
} catch {
    Write-Host "⚠ Permission setting error: $_" -ForegroundColor Yellow
}

# Step 4: Create SMB share
Write-Host "`n[4/5] Creating SMB network share..." -ForegroundColor Yellow
try {
    $shareExists = Get-SmbShare -Name $ShareName -ErrorAction SilentlyContinue
    if (!$shareExists) {
        New-SmbShare -Name $ShareName -Path $SharedPath -FullAccess "$env:COMPUTERNAME\$Username", "Everyone" -Description "PEO Worksystem shared documents and files" | Out-Null
        Write-Host "✓ Created SMB share: \\$env:COMPUTERNAME\$ShareName" -ForegroundColor Green
    } else {
        Write-Host "✓ Share already exists: \\$env:COMPUTERNAME\$ShareName" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Error creating share: $_" -ForegroundColor Red
    Write-Host "  Make sure to run as Administrator" -ForegroundColor Red
    exit 1
}

# Step 5: Display access information
Write-Host "`n[5/5] Share Configuration Complete" -ForegroundColor Green
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Network Share Details" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Share Name: $ShareName"
Write-Host "Share Path: \\$env:COMPUTERNAME\$ShareName"
Write-Host "Local Path: $SharedPath"
Write-Host "Username: $env:COMPUTERNAME\$Username"
Write-Host "Password: $Password"
Write-Host "`nAccess Instructions for LAN Users:" -ForegroundColor Cyan
Write-Host "1. On Windows PC: File Explorer → Map network drive"
Write-Host "2. Folder: \\$env:COMPUTERNAME\$ShareName"
Write-Host "3. Username: $env:COMPUTERNAME\$Username"
Write-Host "4. Password: $Password"
Write-Host ""
Write-Host "On Mac/Linux:" -ForegroundColor Cyan
Write-Host "smb://$env:COMPUTERNAME/$ShareName"
Write-Host "`n========================================" -ForegroundColor Cyan

# Get local IP
$localIP = (Get-NetIPAddress -AddressFamily IPv4 -AddressState Preferred | Where-Object {$_.InterfaceAlias -notmatch "Docker"} | Select-Object -First 1).IPAddress
if ($localIP) {
    Write-Host "`nYour LAN IP: $localIP" -ForegroundColor Cyan
    Write-Host "Web App: http://$($localIP):8000" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

Write-Host "`n✓ Setup Complete! All users on the LAN can now access shared files." -ForegroundColor Green
