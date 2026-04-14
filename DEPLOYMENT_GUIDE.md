# PEO Worksystem Deployment Guide

## 1. Docker Hub / Private Registry Deployment

### Tag the image
```bash
docker tag peo-worksystem-web:latest YOUR_REGISTRY/peo-worksystem-web:1.0.0
docker tag peo-worksystem-web:latest YOUR_REGISTRY/peo-worksystem-web:latest
```

### Push to registry
```bash
docker login YOUR_REGISTRY
docker push YOUR_REGISTRY/peo-worksystem-web:1.0.0
docker push YOUR_REGISTRY/peo-worksystem-web:latest
```

---

## 2. Kubernetes Deployment

### Prerequisites
- kubectl configured with cluster access
- Persistent volume provisioner available (StorageClass)

### Deploy
```bash
kubectl apply -f kubernetes-manifest.yaml
```

### Verify deployment
```bash
kubectl get -n peo-worksystem pods
kubectl get -n peo-worksystem svc
kubectl logs -n peo-worksystem -l app=peo-worksystem-web
```

### Update ALLOWED_HOSTS
Edit `kubernetes-manifest.yaml` line 140 to your domain before deploying.

### Access the app
```bash
# Get LoadBalancer IP
kubectl get svc -n peo-worksystem peo-worksystem-web

# Port-forward for local testing
kubectl port-forward -n peo-worksystem svc/peo-worksystem-web 8000:80
```

### Scale replicas
```bash
kubectl scale deployment peo-worksystem-web -n peo-worksystem --replicas=5
```

---

## 3. Docker Swarm Deployment

### Prerequisites
- Docker Swarm initialized: `docker swarm init`
- Nodes available (or single node for testing)

### Deploy stack
```bash
docker stack deploy -c docker-stack.yml peo-worksystem
```

### Verify services
```bash
docker stack services peo-worksystem
docker service logs peo-worksystem_web
```

### Scale services
```bash
docker service scale peo-worksystem_web=5
docker service scale peo-worksystem_db=1
```

### Update service
```bash
docker service update --image peo-worksystem-web:v2 peo-worksystem_web
```

---

## 4. AWS ECS/Fargate Deployment

### Prerequisites
- AWS Account with ECS permissions
- ECR repository created
- CloudWatch log group created: `/ecs/peo-worksystem`
- EFS file systems created (for persistent data)

### Register task definition
```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region REGION
```

### Create ECS service
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

### Update service with new image
```bash
aws ecs update-service \
  --cluster peo-worksystem \
  --service peo-worksystem \
  --force-new-deployment \
  --region REGION
```

---

## 5. Docker Compose (Development/Single Host)

### Start locally
```bash
docker compose up -d
```

### Stop
```bash
docker compose down
```

### View logs
```bash
docker compose logs -f web
docker compose logs -f db
```

---

## Environment Variables

Create `.env` file with:
```
DJANGO_DB_NAME=peo_database
DJANGO_DB_USER=django_user
DJANGO_DB_PASSWORD=secure_password
MYSQL_ROOT_PASSWORD=secure_root_password
```

For Kubernetes/Swarm, update secrets in manifests.
For AWS ECS, use AWS Secrets Manager.

---

## Health Checks & Monitoring

- **MySQL**: Healthcheck via `mysqladmin ping`
- **Django**: Healthcheck via `/admin/` endpoint
- **Logs**: Check container logs for errors
- **Memory**: Both containers limited to 1GB each
- **CPU**: Appropriate resource requests/limits set

---

## Rollback

### Kubernetes
```bash
kubectl rollout history -n peo-worksystem deployment peo-worksystem-web
kubectl rollout undo -n peo-worksystem deployment peo-worksystem-web
```

### Docker Swarm
```bash
docker service update --image peo-worksystem-web:old-version peo-worksystem_web
```

### AWS ECS
```bash
aws ecs update-service --cluster peo-worksystem --service peo-worksystem --task-definition peo-worksystem:PREVIOUS_VERSION
```

---

## Next Steps

1. Replace `YOUR_REGISTRY` with your actual registry (Docker Hub, ECR, etc.)
2. Replace `REGION` and `ACCOUNT` in AWS templates
3. Update `DJANGO_ALLOWED_HOSTS` with your domain
4. Store credentials securely (Secrets Manager, etc.)
5. Test health endpoints after deployment
6. Set up monitoring and alerting (CloudWatch, Prometheus, Datadog)
7. Configure CI/CD pipeline for automatic image building and deployment
