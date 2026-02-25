# Testing Guide - Kubernetes Deployment

## 1. Verify Deployment Status

```bash
# Check all resources
kubectl get all -n bankapplication

# Check pods
kubectl get pods -n bankapplication -o wide

# Check services
kubectl get svc -n bankapplication

# Check ingress
kubectl get ingress -n bankapplication

# Get ALB DNS
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "ALB DNS: $ALB_DNS"
```

## 2. Test ALB Health (Without Host Header)

```bash
# Get ALB DNS
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test basic connectivity to ALB
curl -v http://$ALB_DNS/
```

## 3. Test Host-Based Routing with curl

### Frontend Routing

```bash
# Get ALB DNS
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test frontend with correct host header
curl -H "Host: bankapplication.example.com" http://$ALB_DNS/

# Should return HTML content or 200 OK
```

### Backend Routing

```bash
# Get ALB DNS
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test backend with correct host header
curl -H "Host: api.bankapplication.example.com" http://$ALB_DNS/

# Should return backend response (check logs if error)
```

## 4. Complete Testing Script

Save this as `test-deployment.sh`:

```bash
#!/bin/bash

set -e

echo "========================================"
echo "Bank Application - Deployment Test"
echo "========================================"

# Get ALB DNS
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

if [ -z "$ALB_DNS" ]; then
    echo "❌ ALB DNS not found. Ingress may not be ready yet."
    echo "Run: kubectl get ingress -n bankapplication to check status"
    exit 1
fi

echo "✓ ALB DNS: $ALB_DNS"
echo ""

# Test 1: Basic ALB connectivity
echo "Test 1: Basic ALB Connectivity"
echo "Command: curl -v http://$ALB_DNS/"
echo "---"
if curl -s -f http://$ALB_DNS/ > /dev/null 2>&1; then
    echo "✓ ALB is responding"
else
    echo "⚠ ALB not responding yet (may still be initializing)"
fi
echo ""

# Test 2: Frontend routing
echo "Test 2: Frontend Host Routing"
echo "Command: curl -H 'Host: bankapplication.example.com' http://$ALB_DNS/"
echo "---"
FRONTEND_RESPONSE=$(curl -s -H "Host: bankapplication.example.com" http://$ALB_DNS/ | head -n 20)
if [ ! -z "$FRONTEND_RESPONSE" ]; then
    echo "✓ Frontend responding"
    echo "Response (first 20 lines):"
    echo "$FRONTEND_RESPONSE"
else
    echo "❌ Frontend not responding"
fi
echo ""

# Test 3: Backend routing
echo "Test 3: Backend Host Routing"
echo "Command: curl -H 'Host: api.bankapplication.example.com' http://$ALB_DNS/"
echo "---"
BACKEND_RESPONSE=$(curl -s -w "\n%{http_code}" -H "Host: api.bankapplication.example.com" http://$ALB_DNS/)
HTTP_CODE=$(echo "$BACKEND_RESPONSE" | tail -n 1)
BODY=$(echo "$BACKEND_RESPONSE" | head -n -1)
echo "HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo "✓ Backend responding (status: $HTTP_CODE)"
else
    echo "⚠ Backend status: $HTTP_CODE"
fi
if [ ! -z "$BODY" ]; then
    echo "Response:"
    echo "$BODY" | head -n 5
fi
echo ""

# Test 4: Pod status
echo "Test 4: Pod Status"
echo "---"
kubectl get pods -n bankapplication -o wide
echo ""

# Test 5: Service connectivity
echo "Test 5: Service Connectivity (from debug pod)"
echo "---"
echo "Testing frontend service..."
kubectl run -it --rm debug-frontend --image=busybox --restart=Never -n bankapplication -- \
    wget -O- http://frontend-service:80/ 2>/dev/null | head -n 5
echo ""

echo "Testing backend service..."
kubectl run -it --rm debug-backend --image=busybox --restart=Never -n bankapplication -- \
    wget -O- http://backend-service:3000/ 2>/dev/null | head -n 5
echo ""

echo "========================================"
echo "Testing Complete"
echo "========================================"
```

Make it executable and run:
```bash
chmod +x test-deployment.sh
./test-deployment.sh
```

## 5. Direct curl Commands for Testing

### Get ALB DNS first:
```bash
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "ALB: $ALB_DNS"
```

### Test Frontend:
```bash
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl -v -H "Host: bankapplication.example.com" http://$ALB_DNS/
```

### Test Backend:
```bash
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl -v -H "Host: api.bankapplication.example.com" http://$ALB_DNS/
```

### Test with Custom Headers:
```bash
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Frontend with headers
curl -H "Host: bankapplication.example.com" \
     -H "User-Agent: TestClient/1.0" \
     -H "Accept: text/html" \
     http://$ALB_DNS/

# Backend with headers
curl -H "Host: api.bankapplication.example.com" \
     -H "Content-Type: application/json" \
     http://$ALB_DNS/
```

## 6. Test with HTTP Status Code:
```bash
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Get status code only
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: bankapplication.example.com" http://$ALB_DNS/

# Get full response with status
curl -s -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" \
     -H "Host: bankapplication.example.com" \
     http://$ALB_DNS/
```

## 7. Local Testing with Route53/Hosts File

If you want to test without specifying Host header:

### Update /etc/hosts (macOS/Linux):
```bash
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Get ALB IP (if it's a CNAME, this won't work directly)
# For AWS ALB, you need Route53 DNS records instead

# Or use the Host header method above
```

### Using dig to check DNS:
```bash
# If Route53 is configured
dig bankapplication.example.com
dig api.bankapplication.example.com
```

## 8. Check Backend Response Format

```bash
ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Backend might expect JSON, so test with POST
curl -X POST \
     -H "Host: api.bankapplication.example.com" \
     -H "Content-Type: application/json" \
     -d '{"test":"data"}' \
     http://$ALB_DNS/

# Or check available endpoints
curl -H "Host: api.bankapplication.example.com" http://$ALB_DNS/api/health
```

## 9. Verify Pod Communication

```bash
# Test frontend pod can reach backend service
kubectl exec -it deployment/frontend-deployment -n bankapplication -- sh
# Inside pod:
curl http://backend-service:3000/

# Test backend pod
kubectl exec -it deployment/backend-deployment -n bankapplication -- sh
# Inside pod:
curl http://localhost:3000/
```

## 10. Ingress Controller Logs

```bash
# Check AWS Load Balancer Controller logs
kubectl logs -l app.kubernetes.io/name=aws-load-balancer-controller -n bankapplication -f

# Check ALB creation logs
kubectl logs deployment/aws-load-balancer-controller -n bankapplication --tail=50
```

## 11. Integration Test Script

Save as `integration-test.sh`:

```bash
#!/bin/bash

ALB_DNS=$(kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Testing with ALB: $ALB_DNS"
echo ""

# Counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_endpoint() {
    local host=$1
    local path=$2
    local expected_code=$3
    local name=$4
    
    echo -n "Testing $name... "
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $host" "http://$ALB_DNS$path")
    
    if [ "$HTTP_CODE" = "$expected_code" ]; then
        echo "✓ PASS (HTTP $HTTP_CODE)"
        ((TESTS_PASSED++))
    else
        echo "✗ FAIL (Expected $expected_code, got $HTTP_CODE)"
        ((TESTS_FAILED++))
    fi
}

# Run tests
test_endpoint "bankapplication.example.com" "/" "200" "Frontend Root"
test_endpoint "bankapplication.example.com" "/index.html" "200" "Frontend Index"
test_endpoint "api.bankapplication.example.com" "/" "200" "Backend Root"
test_endpoint "api.bankapplication.example.com" "/api" "200" "Backend API Path"

echo ""
echo "Results: $TESTS_PASSED passed, $TESTS_FAILED failed"

if [ $TESTS_FAILED -eq 0 ]; then
    echo "✓ All tests passed!"
    exit 0
else
    echo "✗ Some tests failed"
    exit 1
fi
```

Run with:
```bash
chmod +x integration-test.sh
./integration-test.sh
```

## 12. Real-world verification order

1. **Check ALB is created:**
   ```bash
   kubectl get ingress -n bankapplication
   ```

2. **Get ALB DNS:**
   ```bash
   kubectl get ingress bankapplication-ingress -n bankapplication -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
   ```

3. **Test frontend:**
   ```bash
   ALB_DNS=<from-step-2>
   curl -H "Host: bankapplication.example.com" http://$ALB_DNS/
   ```

4. **Test backend:**
   ```bash
   curl -H "Host: api.bankapplication.example.com" http://$ALB_DNS/
   ```

5. **Check logs if failing:**
   ```bash
   kubectl logs -l app=frontend -n bankapplication -f
   kubectl logs -l app=backend -n bankapplication -f
   ```
