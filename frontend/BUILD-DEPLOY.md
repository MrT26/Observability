# Frontend Build & Deploy Quick Reference

## Build Angular Docker Image

### 1. Build Locally

```bash
cd frontend

# Build with defaults
docker build -t bankapplication-frontend:latest .

# Build with specific API URL
docker build \
  --build-arg API_URL=http://api.yourdomain.com \
  -t bankapplication-frontend:latest \
  .
```

### 2. Test Locally

```bash
# Run with default config
docker run -p 8080:80 bankapplication-frontend:latest

# Run with custom environment
docker run -p 8080:80 \
  -e ANGULAR_API_URL=http://localhost:3000 \
  -e ANGULAR_PRODUCTION=false \
  bankapplication-frontend:latest

# Access at http://localhost:8080
```

### 3. Verify Configuration

```bash
# In browser DevTools console:
window.appConfig

# Should output:
{
  "production": true,
  "apiUrl": "http://api.example.com",
  "apiTimeout": 30000,
  "logLevel": "info"
}
```

## Push to ECR

```bash
ACCOUNT_ID=your-aws-account-id
REGION=us-east-1
REPO=bankapplication-frontend

# Login to ECR
aws ecr get-login-password --region $REGION | docker login \
  --username AWS \
  --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Tag image
docker tag bankapplication-frontend:latest \
  $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:latest

docker tag bankapplication-frontend:latest \
  $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:$(git rev-parse --short HEAD)

# Push
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:$(git rev-parse --short HEAD)
```

## Deploy to Kubernetes

```bash
# Update image in deployment
kubectl set image deployment/frontend-deployment \
  frontend=$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/bankapplication-frontend:latest \
  -n bankapplication

# Or apply with environment variables set in manifest
kubectl apply -f deployment/01-frontend-deployment.yml

# Check status
kubectl rollout status deployment/frontend-deployment -n bankapplication

# Verify config loaded
kubectl exec -it <pod-name> -n bankapplication -- \
  cat /usr/share/nginx/html/assets/config.json
```

## Environment Variables in Kubernetes

Update `deployment/01-frontend-deployment.yml`:

```yaml
env:
- name: ANGULAR_API_URL
  value: "http://api.bankapplication.example.com"
- name: ANGULAR_PRODUCTION
  value: "true"
- name: ANGULAR_LOG_LEVEL
  value: "info"
```

Or use ConfigMap:

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
  namespace: bankapplication
data:
  API_URL: "http://api.bankapplication.example.com"
  PRODUCTION: "true"
  LOG_LEVEL: "info"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  template:
    spec:
      containers:
      - name: frontend
        envFrom:
        - configMapRef:
            name: frontend-config
```

## GitHub Actions Auto-Build

Workflows automatically build and push to ECR on push:

```bash
# Push triggers build and deployment
git add .
git commit -m "Update frontend"
git push origin main

# Watch via GitHub Actions
# Or check in a few minutes
```

## Docker Compose with Backend

```bash
# Create docker-compose.yml
docker-compose up --build

# Frontend: http://localhost
# Backend: http://localhost:3000
```

## File Structure

```
frontend/
├── Dockerfile                           # Main image build
├── config/
│   └── config.template.json            # Env var template
├── scripts/
│   └── docker-entrypoint.sh             # Substitution script
├── src/
│   ├── index.html                       # Loads config.js
│   └── app/environments/
│       └── enviroments.ts               # Dynamic loader
└── DOCKER-CONFIG.md                     # Full documentation
```

## Key Features

✅ Single image for all environments
✅ No rebuild needed to change API URL
✅ Environment variables passed at runtime
✅ Health checks included
✅ Minimal image size (~50MB)
✅ Kubernetes ready
✅ Docker Compose compatible

## Common Issues

**Config not loading?**
```bash
# Check container logs
docker logs <container-id>

# Verify files exist
docker exec <container-id> ls /usr/share/nginx/html/assets/
```

**API calls failing?**
```bash
# Check config in browser
window.appConfig.apiUrl

# Verify backend is accessible
curl http://api.yourdomain.com
```

**Image too large?**
- Already optimized: ~50MB
- Uses multi-stage build
- Alpine Linux for minimal footprint

## Build Commands Summary

| Command | Purpose |
|---------|---------|
| `docker build -t bankapplication-frontend:latest .` | Build image |
| `docker run -p 80:80 <image>` | Run locally |
| `docker push <image>` | Push to registry |
| `docker logs <container>` | View logs |
| `docker exec <container> cat /usr/share/nginx/html/assets/config.json` | Check config |

## Deployment Checklist

- [ ] Build image locally and test
- [ ] Push to ECR
- [ ] Update image URI in deployment file
- [ ] Set environment variables
- [ ] Deploy to Kubernetes
- [ ] Verify pods running
- [ ] Check config loaded in browser
- [ ] Test API calls
- [ ] Monitor logs

## Performance Notes

- Image size: ~50MB (Alpine + Nginx)
- Build time: 6-8 minutes
- Startup time: <5 seconds
- Memory usage: ~20MB (baseline)

## Next Steps

1. Build and test locally
2. Verify config.json generates correctly
3. Push to ECR
4. Deploy to K8s with proper env vars
5. Monitor application
6. Adjust env vars as needed

See [DOCKER-CONFIG.md](DOCKER-CONFIG.md) for complete documentation.
