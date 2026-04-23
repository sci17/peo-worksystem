# GoDaddy API Automation

This is the fully automated path for issuing the certificate without manually copying TXT records.

## What you need

You need a GoDaddy API key and secret from:

- https://developer.godaddy.com/keys

## Create the credentials file

1. Create this folder:

```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\Administrator\Desktop\peo-worksystem\secrets"
```

2. Copy:

- `.godaddy-api.example.ini`

to:

- `C:\Users\Administrator\Desktop\peo-worksystem\secrets\godaddy.ini`

3. Replace the placeholder values with your real key and secret.

If you are using an OTE/test key, also add:

```ini
dns_godaddy_api_url = https://api.ote-godaddy.com
```

## Request the certificate automatically

```powershell
.\scripts\request-letsencrypt-cert-godaddy-api.bat engr.elmon@gmail.com
```

This uses the `certbot-dns-godaddy` plugin in Docker to create and remove the TXT records automatically for `peopalawan.com` and `www.peopalawan.com`.

Before Certbot runs, the helper script now tests your GoDaddy API credentials against the domain so you get a clearer error if the key is invalid or from the wrong environment.

## Start HTTPS

You can either issue first and then start HTTPS:

```powershell
.\scripts\request-letsencrypt-cert-godaddy-api.bat engr.elmon@gmail.com
.\scripts\start-peo-worksystem-https-dns.bat
```

Or use the one-step wrapper, which requests the certificate automatically if it is still missing:

```powershell
.\scripts\start-peo-worksystem-https-dns.bat engr.elmon@gmail.com
```

If the GoDaddy DNS plugin cannot complete issuance for the `www` hostname, the wrapper falls back to the standard webroot challenge for `peopalawan.com` and `www.peopalawan.com`.

## Notes

- This avoids the Starlink router forwarding issue.
- Keep the credentials file private.
- GoDaddy DNS propagation can be slow, so the script waits 900 seconds before validation.
- The automated script requests `peopalawan.com` and `www.peopalawan.com` instead of a wildcard certificate.
