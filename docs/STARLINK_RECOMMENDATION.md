# Starlink Recommendation

The current Starlink router setup does not expose port-forward settings, so HTTP-01 validation is not reliable here.

Recommended path:

1. Use GoDaddy API automation or DNS challenge in GoDaddy to issue the certificate
2. Start the HTTPS stack locally
3. Use the existing domain DNS already pointed at `150.228.189.87`

## Commands

Issue certificate with GoDaddy API automation:

```powershell
.\scripts\request-letsencrypt-cert-godaddy-api.bat engr.elmon@gmail.com
```

Or issue certificate manually with DNS challenge:

```powershell
.\scripts\request-letsencrypt-cert-dns.bat engr.elmon@gmail.com
```

Start HTTPS after the cert is issued:

```powershell
.\scripts\start-peo-worksystem-https-dns.bat
```
