# Deployment Readiness

Current assessment based on the repo config and the local auto-start logs.

## Most Ready Path

`Docker` is the most ready path right now.

Why:

- the local machine is already using Docker Desktop
- the autostart logs show the Docker stack comes up successfully
- the current running path already includes `web`, `nginx`, `db`, `redis`, `celery`, and `celery-beat`
- the repo now includes a dedicated HTTPS override for Docker

## Docker Status

What looks good:

- the autostart log shows all core services starting successfully on April 22, 2026
- Nginx is mapped on host port `80`
- the app health checks are passing in the startup log
- domain hostnames are already configured for `peopalawan.com` and `www.peopalawan.com`

What is still needed:

- real TLS certificate files for `peopalawan.com`
- GoDaddy DNS pointed to the real public server IP
- firewall open on ports `80` and `443`
- production secrets should come from `.env.production` instead of the current `.env`

## Kubernetes Status

What looks good:

- ingress, certificate, and issuer manifests are present
- the ingress hostnames and TLS secret names match the target domain
- the manifest now expects ingress to be the public entrypoint

What is still needed:

- a real Kubernetes cluster
- ingress-nginx installed
- cert-manager installed
- a public ingress IP
- persistent storage available in the cluster

## ECS Status

What looks good:

- the task definition has the correct domain names
- TLS-aware Django settings are included for ALB termination

What is still needed:

- real AWS account values
- ECR image URI
- ALB, target group, and ACM certificate
- ECS cluster and service creation
- a GoDaddy DNS target for `www`

## Recommendation

If you want the fastest path to a live GoDaddy domain, use Docker first.

It requires the fewest external systems because you mainly need:

- one public server
- one public IP
- one TLS certificate
- GoDaddy DNS records
