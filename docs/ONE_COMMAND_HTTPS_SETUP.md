# One-Command HTTPS Setup

If Docker Desktop gets stuck holding port `80`, use the recovery helper instead of typing each fix manually.

## Command

```powershell
.\scripts\recover-docker-and-request-cert.bat engr.elmon@gmail.com
```

## What it does

- creates the certbot and Let's Encrypt folders if needed
- runs `docker compose down`
- runs `wsl --shutdown`
- stops the Docker Desktop backend process if it is stuck
- starts Docker Desktop again
- waits for Docker to become healthy
- starts `redis`, `db`, `web`, and `nginx`
- requests the Let's Encrypt certificate
- starts the HTTPS stack

## Requirements

- GoDaddy DNS already points to `150.228.189.87`
- Windows Firewall allows inbound `80` and `443`
- your router forwards public `80` and `443` to `192.168.1.177`
- Docker Desktop is installed

## If Docker Desktop keeps reserving port 80

You can work around that by changing the host ports in your env file:

```env
HOST_HTTP_PORT=8080
HOST_HTTPS_PORT=8443
```

Then change your router forwarding to:

- public `80` -> `192.168.1.177:8080`
- public `443` -> `192.168.1.177:8443`

This keeps the public website on normal ports while avoiding a local Docker Desktop conflict on host port `80`.

## If it still fails

The remaining problem is almost certainly outside the repo:

- router forwarding
- ISP blocking inbound `80`
- CGNAT
