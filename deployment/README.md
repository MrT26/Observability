# Bank Application - Kubernetes Deployment

Simple Kubernetes deployment for Bank Application on AWS EKS using AWS Load Balancer Controller.

## Files Overview

| File | Purpose |
|------|---------|
| 01-frontend-deployment.yml | Angular frontend (2 replicas) |
| 02-backend-deployment.yml | Node.js backend (2 replicas) |
| 03-frontend-service.yml | Frontend internal service |
| 04-backend-service.yml | Backend internal service |
| 05-aws-load-balancer-controller.yml | AWS ALB controller |
| 06-ingress.yml | ALB routing rules |

## Prerequisites

- AWS EKS cluster
- kubectl configured
- Docker images in ECR:
  - `ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/bankapplication-frontend:latest`
  - `ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/bankapplication-backend:latest`

## Quick Deploy

### 1. Create Namespace
```bash
kubectl create namespace bankapplication
```

### 2. Update Account ID
Replace `ACCOUNT_ID` in deployment YAML files with your AWS account ID.

### 3. Deploy All
```bash
kubectl apply -f deployment/
```

### 4. Check Status
```bash
kubectl get all -n bankapplication
kubectl get ingress -n bankapplication
```

### 5. Get ALB DNS
```bash
kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

## Testing

See [TESTING.md](TESTING.md) for comprehensive testing guide with curl commands for:
- Host-based routing verification
- ALB connectivity testing
- Frontend and backend routing
- Integration tests

Quick test:
```bash
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test frontend
curl -H "Host: bankapplication.example.com" http://$ALB_DNS/

# Test backend
curl -H "Host: api.bankapplication.example.com" http://$ALB_DNS/
```

## Common Commands

### View Logs
```bash
# Frontend
kubectl logs -l app=frontend -n bankapplication -f

# Backend  
kubectl logs -l app=backend -n bankapplication -f

# Load Balancer Controller
kubectl logs -l app.kubernetes.io/name=aws-load-balancer-controller -n bankapplication -f
```

### Scale Deployment
```bash
# Scale frontend to 3 replicas
kubectl scale deployment frontend-deployment --replicas=3 -n bankapplication

# Scale backend to 3 replicas
kubectl scale deployment backend-deployment --replicas=3 -n bankapplication
```

### Update Image
```bash
kubectl set image deployment/frontend-deployment \
  frontend=ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/bankapplication-frontend:v1.0 \
  -n bankapplication
```

### Delete All
```bash
kubectl delete namespace bankapplication
```

## Configuration

Edit deployment files to customize:
- **Replicas**: Change `replicas: 2` value
- **Image**: Update ECR image URI
- **Resources**: Adjust CPU/memory requests and limits
- **Domain**: Edit ingress hostnames in 06-ingress.yml

## Troubleshooting

Check pod status:
```bash
kubectl describe pod <pod-name> -n bankapplication
kubectl logs <pod-name> -n bankapplication
```

Check ingress status:
```bash
kubectl describe ingress bankapplication-ingress -n bankapplication
```

Check controller:
```bash
kubectl describe deployment aws-load-balancer-controller -n bankapplication
```
