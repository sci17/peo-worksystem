# Let's Encrypt On Windows Docker

Use this guide for the Docker path on the Windows machine at `150.228.189.87`.

## Before You Start

- GoDaddy DNS for `peopalawan.com` must already point to `150.228.189.87`
- Port `80` must be open to the internet
- Docker Nginx can stay running on port `80`

## Create the webroot folder

```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\Administrator\Desktop\peo-worksystem\certbot\www"
New-Item -ItemType Directory -Force -Path "C:\etc\letsencrypt"
```

## Request the certificate

Use the helper script and replace the email:

```powershell
.\scripts\request-letsencrypt-cert.bat your-email@example.com
```

This uses the webroot challenge through the running Nginx container, so it does not need to bind host port `80` from a temporary certbot container.

If successful, the certificate files should appear here:

- `C:\etc\letsencrypt\live\peopalawan.com\fullchain.pem`
- `C:\etc\letsencrypt\live\peopalawan.com\privkey.pem`

## Start HTTPS

After the certificate exists:

```powershell
.\scripts\start-peo-worksystem-https.ps1 -LetsEncryptDir "C:\etc\letsencrypt"
```

## Verify

Check:

- `http://peopalawan.com`
- `https://peopalawan.com`
- `https://www.peopalawan.com`

Expected result:

- HTTP redirects to HTTPS
- HTTPS loads with a valid certificate

## If Certificate Issuance Fails

Common reasons:

- DNS has not fully propagated
- port `80` is blocked by firewall or router
- the server is not reachable from the internet
