# Windows Autostart

This project can start automatically on Windows login without opening Command Prompt or Docker Desktop manually.

## What was added

- `scripts/start-peo-worksystem.ps1`
  - Starts Docker Desktop if needed
  - Waits until Docker is ready
  - Runs `docker compose up -d`
  - Writes startup details to `auto-start-log.txt`
- `scripts/register-peo-autostart.ps1`
  - Creates a Windows Scheduled Task at user logon
- `scripts/start-peo-worksystem.bat`
  - Simple wrapper for manual testing

## One-time setup

Run this in PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\register-peo-autostart.ps1
```

## How it works

- Your Docker Compose services already use `restart: unless-stopped`
- When Windows login happens, the scheduled task runs
- The script starts Docker Desktop if it is not running yet
- After Docker is ready, it runs `docker compose up -d`

## Important note

This setup is designed for **automatic startup after Windows sign-in**. Docker Desktop is a user-session application, so this is the most reliable approach on a normal Windows PC.

## Test it now

```powershell
.\scripts\start-peo-worksystem.bat
```

## Troubleshooting

- If the site does not open after reboot, check `auto-start-log.txt` in the project root.
- `docker-compose.yml` now uses `8000:80` for Nginx so it listens on any current LAN IP, not just one fixed address.
