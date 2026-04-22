# GoDaddy Domain Setup

This project is configured to use:

- `peopalawan.com`
- `www.peopalawan.com`

The application configs in Docker Compose, Docker Swarm, Kubernetes, and ECS now use those hostnames consistently.

## GoDaddy DNS Records

Create these records in GoDaddy DNS for the deployment target you actually use.

### Option 1: Docker on one public server

Use this when Nginx/Docker is running on a single VM or physical server with a public IPv4 address.

- `A` record
  - Host: `@`
  - Points to: your server public IPv4
- `CNAME` record
  - Host: `www`
  - Points to: `peopalawan.com`

Notes:

- Open ports `80` and `443` on the server firewall.
- Install TLS on the server or on the reverse proxy in front of Docker.
- Only enable `DJANGO_SECURE_SSL_REDIRECT`, secure cookies, and HSTS after HTTPS is working on that server path.
- Do not point DNS at an old temporary IP unless it is the current live public IP.

### Option 2: Kubernetes

Use this when traffic enters the cluster through an ingress controller.

- `A` record
  - Host: `@`
  - Points to: the public IP of the ingress controller service
- `A` record
  - Host: `www`
  - Points to: the same public IP

Notes:

- Install `ingress-nginx` in the cluster.
- Install `cert-manager` in the cluster.
- Apply `issuer.yaml`, `certificate.yaml`, and `kubernetes-manifest.yaml`.
- This repo now expects the internal Nginx service to stay `ClusterIP` and the ingress controller to be the public entrypoint.

Helpful checks:

```bash
kubectl get svc -A
kubectl get ingress -n peo-worksystem
kubectl describe certificate -n peo-worksystem
kubectl describe challenge -A
```

### Option 3: AWS ECS/Fargate

Use this when the public entrypoint is an AWS Application Load Balancer.

- `CNAME` record
  - Host: `www`
  - Points to: your ALB DNS name

For the root domain `@`, GoDaddy DNS does not support a normal apex CNAME. Use one of these:

1. Forward `peopalawan.com` to `https://www.peopalawan.com`
2. Move DNS hosting to a provider that supports apex alias records, such as Route 53

Notes:

- Attach an ACM certificate for `peopalawan.com` and `www.peopalawan.com` to the ALB HTTPS listener.
- Route HTTP on port `80` to HTTPS on port `443`.
- Point the ECS service target group at the Django/Nginx container port you expose behind the ALB.

## App Settings Included In This Repo

These settings are already prepared in the deployment files:

- `DJANGO_ALLOWED_HOSTS=peopalawan.com,www.peopalawan.com`
- `DJANGO_CSRF_TRUSTED_ORIGINS=https://peopalawan.com,https://www.peopalawan.com`
- `DJANGO_SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO:https`
- `DJANGO_USE_X_FORWARDED_HOST=True`
- secure cookies and HSTS enabled for production

## What Still Depends On Your Infrastructure

This repo cannot know your live public endpoint ahead of time. Before going live, replace DNS targets with your actual:

- server public IP
- ingress controller public IP
- AWS ALB DNS name

## Recommended Go-Live Checklist

- Set a strong `DJANGO_SECRET_KEY`
- Replace default database passwords
- Confirm `peopalawan.com` and `www.peopalawan.com` resolve correctly
- Confirm HTTPS certificate issuance succeeded
- Test login, file upload, WebSocket traffic, and static files over HTTPS
