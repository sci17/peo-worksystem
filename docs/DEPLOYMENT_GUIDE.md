# PEO Worksystem Deployment Guide

This repo supports three public deployment paths for `peopalawan.com` and `www.peopalawan.com`:

1. Docker on one public server
2. Kubernetes with ingress-nginx and cert-manager
3. AWS ECS/Fargate behind an Application Load Balancer

Use [GODADDY_DOMAIN_SETUP.md](C:/Users/Administrator/Desktop/peo-worksystem/docs/GODADDY_DOMAIN_SETUP.md:1) together with this guide.
Use [GO_LIVE_CHECKLIST.md](C:/Users/Administrator/Desktop/peo-worksystem/docs/GO_LIVE_CHECKLIST.md:1) right before switching DNS.

## 1. Docker On One Public Server

Use this path when you have one VM or dedicated server with a public IPv4 address.

### Files used

- `docker-compose.yml`
- `docker-compose.https.yml`
- `nginx/default.conf`
- `nginx/default-ssl.conf`

### GoDaddy DNS

- `A` record: `@` -> server public IPv4
- `CNAME` record: `www` -> `peopalawan.com`

### HTTP-only start

```bash
docker compose up -d
```

This brings the app up on port `80`.

### HTTPS start

1. Obtain a certificate for `peopalawan.com` and `www.peopalawan.com`
2. Make sure the certificates exist under `/etc/letsencrypt/live/peopalawan.com/`
3. Start with the HTTPS override:

```bash
docker compose -f docker-compose.yml -f docker-compose.https.yml up -d
```

On Windows, you can also use:

```powershell
.\scripts\start-peo-worksystem-https.ps1 -LetsEncryptDir "C:\etc\letsencrypt"
```

### Notes

- Open inbound ports `80` and `443`
- Once TLS works, the HTTPS override turns on secure cookies and HTTPS redirect
- The TLS Nginx config serves ACME challenge files from `/var/www/certbot`

## 2. Kubernetes

Use this path when you already have a cluster and want TLS handled by ingress plus cert-manager.

### Prerequisites

- `kubectl` configured for the target cluster
- an ingress-nginx controller installed
- cert-manager installed
- a working default StorageClass or equivalent persistent storage

### Files used

- `kubernetes-manifest.yaml`
- `issuer.yaml`
- `certificate.yaml`

### GoDaddy DNS

Point both records to the public IP of the ingress controller:

- `A` record: `@` -> ingress controller public IP
- `A` record: `www` -> ingress controller public IP

### Apply order

```bash
kubectl apply -f issuer.yaml
kubectl apply -f certificate.yaml
kubectl apply -f kubernetes-manifest.yaml
```

### Verify

```bash
kubectl get pods -n peo-worksystem
kubectl get svc -n peo-worksystem
kubectl get ingress -n peo-worksystem
kubectl describe certificate -n peo-worksystem
kubectl describe challenge -A
```

### Notes

- The repo now expects `Ingress` to be the public entrypoint
- The internal Nginx service is `ClusterIP`, not `LoadBalancer`
- `cert-manager.io/cluster-issuer: letsencrypt-prod` is already wired into the ingress

## 3. Docker Swarm

Use this only if you are deploying with Swarm instead of plain Compose.

### Files used

- `docker-stack.yml`

### Start

```bash
docker swarm init
docker stack deploy -c docker-stack.yml peo-worksystem
```

### Notes

- The stack file includes the domain hostnames
- It does not include direct TLS termination by itself
- Put a reverse proxy or load balancer with HTTPS in front of the Swarm services

## 4. AWS ECS/Fargate

Use this path when the public entrypoint is an Application Load Balancer with ACM certificates.

### Prerequisites

- ECR repository created
- ECS cluster created
- CloudWatch log group created: `/ecs/peo-worksystem`
- EFS file systems created if you want persistent shared volumes
- ACM certificate requested for `peopalawan.com` and `www.peopalawan.com`
- ALB created with listeners on `80` and `443`

### Files used

- `ecs-task-definition.json`

### GoDaddy DNS

- `CNAME` record: `www` -> ALB DNS name

For the root domain `@`, choose one:

1. Forward `peopalawan.com` to `https://www.peopalawan.com` in GoDaddy
2. Move DNS to a provider that supports apex alias records

### Register the task definition

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region REGION
```

### Create the ECS service

```bash
aws ecs create-service \
  --cluster peo-worksystem \
  --service-name peo-worksystem \
  --task-definition peo-worksystem:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=web,containerPort=8000 \
  --region REGION
```

### ALB requirements

- HTTPS listener on `443` with ACM certificate
- HTTP listener on `80` redirecting to `443`
- target group forwarding to the ECS service on container port `8000`
- health check path aligned with your app or reverse proxy setup

### Notes

- The task definition now includes the production domain names
- HTTPS-related Django settings are enabled for ECS because the ALB terminates TLS
- Replace placeholder values such as `REGION`, `ACCOUNT`, and repository URIs

## Environment Variables

Before going live, replace placeholder secrets:

- `DJANGO_SECRET_KEY`
- `DJANGO_DB_PASSWORD`
- `MYSQL_ROOT_PASSWORD`

For production:

- store secrets in AWS Secrets Manager for ECS
- use Kubernetes secrets for cluster deployments
- use host-level secret management or `.env` protection for Docker

## Final Checks

- Confirm `peopalawan.com` resolves correctly
- Confirm `www.peopalawan.com` resolves correctly
- Confirm HTTPS is valid
- Test login, static files, uploads, and WebSocket traffic
- Review logs after first live traffic
