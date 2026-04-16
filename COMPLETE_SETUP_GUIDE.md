# PEO Worksystem - Complete Multi-Device File Sharing Setup

## Quick Start (5 Minutes)

### For Administrator (Server):

**Step 1: Open PowerShell as Administrator**
- Press `Win + X`
- Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

**Step 2: Run Setup Script**
```powershell
cd C:\Users\Administrator\Desktop\peo-worksystem
.\setup-smb-share.ps1
```

**Step 3: Note Your Information**
The script will display:
- Your LAN IP address
- Web app URL: `http://192.168.1.177:8000`
- File share path: `\\192.168.1.177\peo-shared-files`
- Username: `peo-admin`
- Password: `Peo@SharedAccess123`

**Step 4: Start Services** (if not already running)
```powershell
cd C:\Users\Administrator\Desktop\peo-worksystem
docker compose up -d
```

---

### For Other Users (Clients) - Windows PC:

**Step 1: Open File Explorer**

**Step 2: Map Network Drive**
- Click "This PC" in left sidebar
- Click "Map network drive"
- Drive letter: Z (or any available)
- Folder: `\\192.168.1.177\peo-shared-files`
- ☑ Reconnect at sign-in
- Username: `peo-admin`
- Password: `Peo@SharedAccess123`
- Click Finish

**Step 3: Access the Web App**
- Open browser
- Go to: `http://192.168.1.177:8000`
- Login with your credentials

Now you can:
- Upload files through the web interface
- Download files through the web interface
- Browse all shared files in File Explorer (`Z:` drive)

---

## File Sharing Architecture

```
┌─────────────────────────────────────────────────────┐
│         PEO Worksystem Server (Your Laptop)         │
│  IP: 192.168.1.177                                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Docker Containers                           │   │
│  │ ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │ │  Django  │  │  Nginx   │  │  MySQL   │   │   │
│  │ │   Web    │  │  Server  │  │Database  │   │   │
│  │ └──────────┘  └──────────┘  └──────────┘   │   │
│  │       ↓             ↓                       │   │
│  │  Shared Media Volume (/shared/media)        │   │
│  └─────────────────────────────────────────────┘   │
│            ↓                                        │
│  ┌──────────────────────────────────────────┐      │
│  │ Windows Folder                           │      │
│  │ C:\ProgramData\peo-worksystem-shared     │      │
│  └──────────────────────────────────────────┘      │
│            ↓                                        │
│  ┌──────────────────────────────────────────┐      │
│  │ SMB/CIFS Network Share                   │      │
│  │ \\192.168.1.177\peo-shared-files         │      │
│  └──────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
          ↓              ↓             ↓
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Windows  │   │   Mac    │   │  Linux   │
    │   PC 1   │   │  Laptop  │   │   PC 2   │
    │ Devices  │   │ Devices  │   │ Devices  │
    └──────────┘   └──────────┘   └──────────┘
   Web + SMB      Web + SMB       Web + SMB
```

---

## How It Works

### When Admin Uploads a Document:

1. **Web Interface Upload**
   - Admin logs in: `http://192.168.1.177:8000`
   - Uploads document (PDF, Word, Excel, etc.)
   
2. **File Storage**
   - Document saved to Django media folder
   - Docker container writes to shared volume
   - Volume persists to Windows folder
   
3. **Network Sharing**
   - SMB share broadcasts folder on network
   - All LAN users can access via file explorer OR web
   
4. **User Access**
   - Users download from web interface
   - OR browse files in mapped network drive
   - All users see same files (no duplicates)

### Key Points:
✅ **Single Source of Truth** — One folder stores all files
✅ **Multi-Device Access** — Windows, Mac, Linux all supported
✅ **Two Access Methods** — Web app + network share
✅ **No Data Duplication** — Files sync automatically
✅ **User-Level Access** — Database tracks who uploaded what

---

## Complete Setup Instructions

### Part 1: SMB Network Share Setup (Admin - Windows)

**Requirements:**
- Administrator access on the server computer
- PowerShell 5.0 or higher (Windows 10+)
- Docker Desktop running

**Execute:**
```powershell
# 1. Open PowerShell as Administrator
# 2. Navigate to project folder
cd C:\Users\Administrator\Desktop\peo-worksystem

# 3. Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 4. Run setup script
.\setup-smb-share.ps1

# 5. Answer any prompts (press Y to continue)
# 6. Wait for completion message
```

**What Gets Created:**
```
Folder: C:\ProgramData\peo-worksystem-shared
User: peo-admin (password: Peo@SharedAccess123)
Share: \\COMPUTERNAME\peo-shared-files
Permissions: Full access for peo-admin and Everyone
```

### Part 2: Docker Services (Admin - Server)

**Ensure Docker is running:**
```bash
# Restart services
cd C:\Users\Administrator\Desktop\peo-worksystem
docker compose down
docker compose up -d

# Wait 30 seconds for services to start
# Then verify:
docker compose ps
```

**Expected output:**
```
NAME                     STATUS
peo-worksystem-db-1      Up (healthy)
peo-worksystem-web-1     Up (healthy)
peo-worksystem-nginx-1   Up (healthy)
```

### Part 3: For Each LAN User (Windows)

**Map Network Drive:**

Option A (Recommended - Easy):
1. Open File Explorer
2. Press `Ctrl + L` (go to address bar)
3. Type: `\\192.168.1.177\peo-shared-files`
4. Press Enter
5. Username: `peo-admin`
6. Password: `Peo@SharedAccess123`
7. ☑ Remember my credentials
8. Click OK

Option B (Formal Method):
1. File Explorer → This PC
2. Ribbon → Map network drive
3. Drive: `Z:`
4. Folder: `\\192.168.1.177\peo-shared-files`
5. ☑ Reconnect at sign-in
6. Finish
7. Enter credentials when prompted

**Access Web App:**
1. Open browser (Chrome, Firefox, Edge, etc.)
2. Type in address bar: `http://192.168.1.177:8000`
3. Login with your username/password
4. Upload and download files

### Part 4: For Mac Users

**Via Finder:**
1. Finder → Go → Connect to Server
2. Address: `smb://192.168.1.177/peo-shared-files`
3. Username: `peo-admin`
4. Password: `Peo@SharedAccess123`
5. Click Connect

**Via Disk Utility:**
1. Applications → Utilities → Disk Utility
2. File → Connect to Server
3. Same details as above

### Part 5: For Linux Users

**Mount via Terminal:**
```bash
# Create mount point
mkdir -p ~/peo-shared

# Mount share
sudo mount -t cifs //192.168.1.177/peo-shared-files ~/peo-shared \
  -o username=peo-admin,password=Peo@SharedAccess123

# Check mounted
mount | grep peo-shared
```

**Or use File Manager:**
- File Manager → Network
- SMB Shares
- Connect to server: `smb://192.168.1.177/peo-shared-files`

---

## File Access Examples

### Scenario: Admin uploads a contract on laptop

**Step 1:** Admin logs in
```
URL: http://192.168.1.177:8000
Username: admin
Password: (admin password)
```

**Step 2:** Upload file
- Click "Upload Document"
- Select "contract_2026.pdf"
- Click Upload
- File saved to database and disk

**Step 3:** Other users access it

**On Windows PC:**
- Open File Explorer
- Navigate to Z: drive (mapped share)
- See "contract_2026.pdf"
- Double-click to open or right-click to download

**On Mac:**
- Open Finder
- Go to "peo-shared-files" share
- Find "contract_2026.pdf"
- Download or open directly

**Via Web App:**
- Any device
- Login: `http://192.168.1.177:8000`
- View documents section
- Download "contract_2026.pdf"

---

## Verification Checklist

After setup, verify everything works:

- [ ] `http://192.168.1.177:8000` loads in browser
- [ ] Can login with credentials
- [ ] Can upload a test file
- [ ] File appears in web app
- [ ] Can browse `\\192.168.1.177\peo-shared-files` on Windows
- [ ] Test file visible in file explorer
- [ ] Can download from web app
- [ ] Can download from network share
- [ ] Works from multiple devices simultaneously

---

## Troubleshooting

### "Cannot access network share"
```powershell
# Check share exists
Get-SmbShare -Name peo-shared-files

# Check path
Get-Item -Path C:\ProgramData\peo-worksystem-shared

# Test connectivity
ping 192.168.1.177
net view \\192.168.1.177
```

### "Access Denied" error
- Username: `peo-admin` (case-sensitive)
- Password: `Peo@SharedAccess123`
- Try: `COMPUTERNAME\peo-admin` as username
- Restart: `net stop lanmanserver && net start lanmanserver`

### Can't connect via web app
```bash
# Check Docker status
docker compose ps

# Check logs
docker compose logs web

# Restart services
docker compose restart
```

### Files uploaded but not showing in share
```bash
# Check volume permissions
docker compose exec web ls -la /shared/media

# Rebuild volume
docker volume rm peo-worksystem_shared_media
docker compose down && docker compose up -d
```

### Slow file transfers
- Check network: Should be 1 Gbps over wired connection
- Use wired Ethernet instead of Wi-Fi
- Check for other heavy network users
- Reduce file size if possible

---

## Security Considerations

⚠️ **Current setup is for LAN-only, trusted users**

For production deployment with public access:
1. Change default password: `Peo@SharedAccess123`
2. Use HTTPS/SSL certificates
3. Implement VPN for remote access
4. Add per-user file permissions
5. Enable audit logging
6. Regular backup strategy
7. Firewall rules

---

## Backup & Recovery

### Daily Backup Script
```powershell
# Create backup folder
mkdir C:\Backups -ErrorAction SilentlyContinue

# Backup shared files
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item -Path "C:\ProgramData\peo-worksystem-shared" `
          -Destination "C:\Backups\peo-shared_$timestamp" -Recurse
          
# Keep last 7 days
Get-ChildItem -Path "C:\Backups" -Filter "peo-shared_*" | 
  Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} | 
  Remove-Item -Recurse -Force
```

### Database Backup
```bash
# Backup MySQL database
docker exec peo-worksystem-db-1 mysqldump \
  -u django_user -p peo_database > backup.sql
# Password: django_pass

# Restore from backup
docker exec -i peo-worksystem-db-1 mysql \
  -u django_user -p peo_database < backup.sql
```

---

## Support & Next Steps

1. ✅ Run `.\setup-smb-share.ps1` as admin
2. ✅ Run `docker compose up -d`
3. ✅ Access `http://192.168.1.177:8000`
4. ✅ Create superuser: `docker compose exec web python manage.py createsuperuser`
5. ✅ Map network drive on all client machines
6. ✅ Test file uploads and downloads
7. ✅ Share with team!

For issues, check:
- `docker compose logs` for container errors
- Network connectivity: `ping 192.168.1.177`
- SMB service status: `Get-Service LanmanServer`
- File permissions: `icacls C:\ProgramData\peo-worksystem-shared`
