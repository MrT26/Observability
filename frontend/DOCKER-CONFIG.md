# Frontend Docker Configuration Guide

## Overview

The Angular frontend is now configured to use dynamic environment variables that can be passed via Docker environment variables. This eliminates the need to rebuild the image for different environments (dev, staging, production).

## How It Works

### 1. Runtime Configuration Flow

```
Docker Environment Variables
         ↓
Dockerfile Entrypoint Script
         ↓
config.template.json (envsubst substitution)
         ↓
config.json (generated at runtime)
         ↓
config.js (loads into window.appConfig)
         ↓
environment.ts (reads from window.appConfig)
         ↓
Angular Application
```

### 2. File Structure

```
frontend/
├── Dockerfile                    # Multi-stage build with entrypoint
├── config/
│   └── config.template.json      # Template with env placeholders
├── scripts/
│   └── docker-entrypoint.sh      # Entrypoint to substitute vars
├── src/
│   ├── index.html               # Updated with config.js
│   └── app/environments/
│       └── enviroments.ts        # Dynamic config loader
└── nginx.conf                    # Nginx configuration
```

## Building the Docker Image

### Basic Build
```bash
cd frontend
docker build -t bankapplication-frontend:latest .
```

### Build with Custom API URL
```bash
docker build -t bankapplication-frontend:latest \
  --build-arg API_URL=http://api.yourdomain.com \
  .
```

## Running the Docker Image

### Default Configuration
```bash
docker run -p 80:80 bankapplication-frontend:latest
```

### With Custom Environment Variables
```bash
docker run -p 80:80 \
  -e ANGULAR_API_URL=http://api.yourdomain.com \
  -e ANGULAR_PRODUCTION=true \
  -e ANGULAR_API_TIMEOUT=30000 \
  -e ANGULAR_LOG_LEVEL=debug \
  bankapplication-frontend:latest
```

### For Kubernetes
See `deployment/01-frontend-deployment.yml` - environment variables are already configured.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| ANGULAR_API_URL | http://localhost:3000 | Backend API URL |
| ANGULAR_PRODUCTION | false | Production mode flag |
| ANGULAR_API_TIMEOUT | 30000 | API timeout in ms |
| ANGULAR_LOG_LEVEL | info | Logging level |

## Docker Compose Example

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      ANGULAR_API_URL: http://backend:3000
      ANGULAR_PRODUCTION: "false"
      ANGULAR_LOG_LEVEL: info
    depends_on:
      - backend

  backend:
    build: ./jpmcbank
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      PORT: 3000
```

Run with:
```bash
docker-compose up --build
```

## Local Development

### Development with Hot Reload
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:4200
```

### Access Backend
Update `src/app/environments/environments.ts` for local development or use environment.ts with default localhost API.

## Production Build

### Kubernetes Production Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
  namespace: bankapplication
spec:
  template:
    spec:
      containers:
      - name: frontend
        image: ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/bankapplication-frontend:latest
        env:
        - name: ANGULAR_API_URL
          value: "https://api.bankapplication.com"
        - name: ANGULAR_PRODUCTION
          value: "true"
        - name: ANGULAR_LOG_LEVEL
          value: "error"
        - name: ANGULAR_API_TIMEOUT
          value: "60000"
```

## Configuration Priority

1. **Environment Variables** (Highest priority) - Set via Docker run or K8s deployment
2. **Build Time Arguments** - Set during `docker build`
3. **Hardcoded Defaults** (Lowest priority) - In config.template.json

## File Details

### Dockerfile

Multi-stage build:
- **Stage 1 (Build)**: Node.js - builds Angular app
- **Stage 2 (Runtime)**: Nginx + Alpine - serves built app

Features:
- Health checks (curl to /)
- Entrypoint script for env substitution
- Minimal image size (~50MB)

### config.template.json

Template with environment variable placeholders using `${VAR_NAME}` syntax.

```json
{
  "production": ${ANGULAR_PRODUCTION:-false},
  "apiUrl": "${ANGULAR_API_URL:-http://localhost:3000}",
  "apiTimeout": ${ANGULAR_API_TIMEOUT:-30000},
  "logLevel": "${ANGULAR_LOG_LEVEL:-info}"
}
```

### docker-entrypoint.sh

Bash script that:
1. Substitutes environment variables using `envsubst`
2. Generates `config.json` from template
3. Creates `config.js` to load config into window object
4. Starts Nginx

### environments.ts

Dynamic loader that:
1. Checks for `window.appConfig` (set by config.js)
2. Falls back to defaults if config.js not loaded
3. Exports configuration for Angular services

## Using in Angular Services

```typescript
import { environment } from './environments/enviroments';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('API URL:', this.apiUrl);
  }

  getData() {
    return this.http.get(`${this.apiUrl}/api/data`);
  }
}
```

## Testing Configuration

### Check Generated Config

In running container:
```bash
# View generated config
docker exec <container-id> cat /usr/share/nginx/html/assets/config.json

# View logs
docker logs <container-id>
```

### Browser Console

Open browser DevTools and check:
```javascript
// Check if config loaded
window.appConfig
```

## Troubleshooting

### Config Not Loading?

1. Check container logs:
   ```bash
   docker logs <container-id>
   ```

2. Verify files exist:
   ```bash
   docker exec <container-id> ls -la /usr/share/nginx/html/assets/
   ```

3. Check browser console for errors in Network tab

### Variables Not Substituted?

1. Verify environment variables passed correctly
2. Check entrypoint script executed
3. Use `docker inspect` to see running config

### API Calls Failing?

1. Check `window.appConfig.apiUrl` in browser
2. Verify backend API is accessible
3. Check CORS headers

## CI/CD Integration

In GitHub Actions, environment variables are passed during deployment:

```yaml
env:
- name: ANGULAR_API_URL
  value: ${{ secrets.API_URL }}
- name: ANGULAR_PRODUCTION
  value: "true"
```

See `.github/workflows/frontend-cicd.yml` for complete example.

## Docker Build Arguments

Use build args for image customization:

```bash
docker build \
  --build-arg API_URL=http://api.example.com \
  -t bankapplication-frontend:v1.0 \
  .
```

Then at runtime, Docker env variables override build args:

```bash
docker run \
  -e ANGULAR_API_URL=http://different-api.com \
  bankapplication-frontend:v1.0
```

## Health Checks

The image includes built-in health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```

Kubernetes uses this automatically for liveness/readiness probes.

## Best Practices

✅ Use environment variables for environment-specific config
✅ Never hardcode sensitive values
✅ Use defaults for optional variables
✅ Document all available variables
✅ Test with different env var combinations
✅ Use health checks
✅ Keep image size minimal

❌ Don't store secrets in config
❌ Don't rebuild image for each environment
❌ Don't hardcode API URLs
❌ Don't skip health checks

## Next Steps

1. Test locally: `docker build` and `docker run`
2. Push to ECR: GitHub Actions handles this
3. Deploy to K8s: Update deployment env vars
4. Monitor: Check application in browser and logs

## References

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/docs/)
- [Angular Documentation](https://angular.io/docs)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
