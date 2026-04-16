# File Sharing Setup Guide - Multi-Device Access

## Problem
When the admin uploads a document from a laptop, other users on different devices (PCs, tablets, etc.) cannot access it.

## Solution Overview
Files are stored in a network-shared folder that all users can access via SMB/CIFS (Windows file sharing), both through the web interface AND directly via file explorer.

---

## Setup Steps

### Step 1: Run SMB Share Setup Script (Admin Only)
Run PowerShell as Administrator:

```powershell
cd C:\Users\Administrator\Desktop\peo-worksystem
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-smb-share.ps1
```

**What it does:**
- Creates folder: `C:\ProgramData\peo-worksystem-shared`
- Creates user: `peo-admin` (password: `Peo@SharedAccess123`)
- Creates SMB network share: `\\COMPUTERNAME\peo-shared-files`
- Sets permissions for multi-user access

**Output will show:**
```
Share Name: peo-shared-files
Share Path: \\COMPUTERNAME\peo-shared-files
Username: COMPUTERNAME\peo-admin
Password: Peo@SharedAccess123
Your LAN IP: 192.168.1.177
```

### Step 2: Restart Docker Services
After the share is created, restart services:

```bash
cd C:\Users\Administrator\Desktop\peo-worksystem
docker compose down
docker compose up -d
```

This mounts the shared folder inside the Docker container so uploaded files are accessible to all users.

---

## Accessing Files - For End Users

### Option 1: Through Web Application (Recommended)
1. Open browser: `http://192.168.1.177:8000`
2. Login with credentials
3. Upload/download files through the web interface
4. Files automatically available to all users

### Option 2: Via Windows Network Share (Direct Access)

**On Windows PC:**
1. Open File Explorer
2. Click "Map network drive"
3. Folder: `\\192.168.1.177\peo-shared-files`
4. Username: `peo-admin`
5. Password: `Peo@SharedAccess123`
6. Check "Reconnect at sign-in"
7. Click Finish

Now you have a network drive (e.g., `Z:`) with all shared files.

**Alternatively (faster):**
- Press `Win + R`
- Type: `\\192.168.1.177\peo-shared-files`
- Enter credentials when prompted

### Option 3: On Mac

1. Finder → Go → Connect to Server
2. Address: `smb://192.168.1.177/peo-shared-files`
3. Username: `peo-admin`
4. Password: `Peo@SharedAccess123`
5. Click Connect

### Option 4: On Linux

```bash
# Mount SMB share
mkdir -p ~/peo-shared
sudo mount -t cifs //192.168.1.177/peo-shared-files ~/peo-shared \
  -o username=peo-admin,password=Peo@SharedAccess123
```

Or use file manager and enter: `smb://192.168.1.177/peo-shared-files`

---

## How File Sharing Works

### When Admin Uploads via Web:
1. Admin logs into web app at `http://192.168.1.177:8000`
2. Uploads document → Saved to `/shared/media` in Docker
3. Docker volume mounts to Windows folder: `C:\ProgramData\peo-worksystem-shared`
4. SMB share provides network access to folder
5. All LAN users can access via:
   - Web app (automatic)
   - Network share (manual browsing)
   - Direct download link

### File Flow:
```
Admin uploads → Django Web App 
  ↓
Saves to container /shared/media
  ↓
Docker volume maps to Windows folder
  ↓
SMB share makes it network-accessible
  ↓
All users can access via web or file explorer
```

---

## Network Configuration

### Current Setup (LAN):
- **Server IP**: 192.168.1.177
- **Web App**: http://192.168.1.177:8000
- **File Share**: \\192.168.1.177\peo-shared-files
- **Database**: Internal (MySQL)
- **Storage**: Shared Windows folder

### Multi-Device Access:
| Device Type | Web Access | File Share | Method |
|-------------|-----------|------------|--------|
| Windows PC | ✅ Yes | ✅ Yes | Browser + File Explorer |
| Laptop | ✅ Yes | ✅ Yes | Browser + File Explorer |
| Mac | ✅ Yes | ✅ Yes | Browser + Finder |
| Linux | ✅ Yes | ✅ Yes | Browser + File Manager |
| Tablet | ✅ Yes | ⚠️ Limited | Browser only |
| Mobile | ✅ Yes | ⚠️ Limited | Browser only |

---

## Troubleshooting

### Can't see the share on network?
```powershell
# Check if share exists
Get-SmbShare -Name peo-shared-files

# Verify folder permissions
icacls C:\ProgramData\peo-worksystem-shared

# Test connectivity
ping 192.168.1.177
net view \\192.168.1.177
```

### Access Denied when accessing share?
1. Verify username: `peo-admin`
2. Verify password: `Peo@SharedAccess123`
3. Restart SMB service: `net stop lanmanserver && net start lanmanserver`
4. Restart Docker containers: `docker compose restart`

### Files uploaded but not visible in share?
```bash
# Check Docker volume
docker volume ls
docker volume inspect peo-worksystem_shared_media

# Check file permissions in container
docker compose exec web ls -la /shared/media
```

### Slow file access?
- SMB is slower over Wi-Fi; use wired connection if possible
- Check network bandwidth: `ipconfig | findstr IPv4`
- Consider moving to dedicated NAS for large files

### Can't upload files from web?
1. Check write permissions: `icacls C:\ProgramData\peo-worksystem-shared /grant "peo-admin:F"`
2. Verify container has access: `docker compose logs web`
3. Check disk space: `dir C:\ProgramData\peo-worksystem-shared`

---

## Security Notes

⚠️ **For LAN-only use (development/internal network):**

Current setup is suitable for:
- Internal office network
- Trusted users only
- Non-sensitive documents
- Protected network firewall

For production with sensitive data:
- Use VPN for remote access
- Implement encryption at rest
- Use SSL/HTTPS
- Implement proper authentication
- Audit file access logs
- Change default credentials
- Restrict access by user role

---

## Advanced: Change Share Credentials

To change the default password:

```powershell
# Set new password for peo-admin user
$NewPassword = ConvertTo-SecureString "NewPassword123!" -AsPlainText -Force
Set-LocalUser -Name peo-admin -Password $NewPassword
```

Then update any stored credentials on client machines.

---

## File Organization Structure

```
\\SERVER\peo-shared-files/
├── documents/
├── uploads/
├── reports/
├── exports/
└── archives/
```

Organize files by category for easier management:
```bash
docker compose exec web mkdir -p /shared/media/{documents,uploads,reports,exports,archives}
```

---

## Backup Shared Files

Regular backups of shared files:

```bash
# Create backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item -Path "C:\ProgramData\peo-worksystem-shared" `
          -Destination "C:\Backups\peo-shared-$timestamp" -Recurse

# Or use Docker
docker run --rm -v peo-worksystem_shared_media:/data `
  -v C:\Backups:/backup `
  alpine tar czf /backup/shared-media-$timestamp.tar.gz -C /data .
```

---

## Summary

✅ **All users can now:**
- Upload documents via web interface
- Download files from web interface
- Browse all files via network share
- Access from Windows, Mac, Linux
- Share documents across multiple devices

✅ **Admin benefits:**
- Centralized file storage
- Easy multi-user management
- No data silos per device
- Simple backup strategy
- LAN-wide accessibility

Get started: Run `.\setup-smb-share.ps1` as admin, then restart Docker!
