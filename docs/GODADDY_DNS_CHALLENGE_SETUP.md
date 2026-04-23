# GoDaddy DNS Challenge Setup

Use this path when your router does not support inbound port forwarding for Let's Encrypt HTTP validation.

## Why this works

This method validates ownership through DNS TXT records in GoDaddy instead of public port `80`.

## Command

Run:

```powershell
.\scripts\request-letsencrypt-cert-dns.bat engr.elmon@gmail.com
```

Certbot will print one or more TXT values. Depending on the identifier being validated, the TXT name can be either:

- `_acme-challenge.peopalawan.com`
- `_acme-challenge.www.peopalawan.com`

## What to add in GoDaddy

For each TXT record Certbot asks for:

- Type: `TXT`
- Name: use the exact name Certbot prints
- Value: the token printed by Certbot
- TTL: `1/2 Hour` or the lowest available

If Certbot gives two TXT values for the same name, add both TXT records before continuing.
If it gives a second prompt for `www`, that record name is usually `_acme-challenge.www`.

## After adding the TXT records

Wait a few minutes, then verify:

```powershell
nslookup -type=TXT _acme-challenge.peopalawan.com 8.8.8.8
nslookup -type=TXT _acme-challenge.www.peopalawan.com 8.8.8.8
```

When the TXT values appear, go back to the Certbot window and press Enter to continue.

## After certificate issuance succeeds

Start HTTPS:

```powershell
.\scripts\start-peo-worksystem-https-dns.bat
```

## Test

- `https://peopalawan.com`
- `https://www.peopalawan.com`

## Notes

- This avoids the Starlink router forwarding issue entirely.
- Keep the cert files in `C:\etc\letsencrypt`.
