# Go-Live Checklist

Use this checklist right before pointing GoDaddy DNS to the live system.

## Shared

- Replace placeholder secrets in `.env` or your secret store
- Confirm `DJANGO_ALLOWED_HOSTS` includes `peopalawan.com` and `www.peopalawan.com`
- Confirm `DJANGO_CSRF_TRUSTED_ORIGINS` uses the final HTTPS URLs
- Confirm database backups are working
- Confirm uploads, static files, login, and background jobs work in staging

## Docker

- Server has a stable public IPv4 address
- GoDaddy `A` record for `@` points to that IPv4
- GoDaddy `CNAME` for `www` points to `peopalawan.com`
- Ports `80` and `443` are open
- Certificates exist for `peopalawan.com` under your Let's Encrypt directory
- Start with:

```powershell
.\scripts\start-peo-worksystem-https.ps1 -LetsEncryptDir "C:\etc\letsencrypt"
```

## Kubernetes

- ingress-nginx is installed
- cert-manager is installed
- ingress controller has a public IP
- GoDaddy `A` record for `@` points to that public IP
- GoDaddy `A` record for `www` points to that public IP
- Apply manifests in this order:

```bash
kubectl apply -f issuer.yaml
kubectl apply -f certificate.yaml
kubectl apply -f kubernetes-manifest.yaml
```

## ECS

- ACM certificate issued for `peopalawan.com` and `www.peopalawan.com`
- ALB listener `443` uses that ACM certificate
- ALB listener `80` redirects to `443`
- GoDaddy `www` CNAME points to the ALB DNS name
- Root domain forwarding or alias strategy is in place for `@`
- ECS task definition placeholders are replaced with real AWS values

## Final Validation

- `http://peopalawan.com` redirects to HTTPS
- `https://peopalawan.com` loads successfully
- `https://www.peopalawan.com` loads successfully
- Browser shows a valid certificate
- Admin login works
- File upload works
- Static assets load without mixed-content errors
- WebSocket features work over HTTPS
