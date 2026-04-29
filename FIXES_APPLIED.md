# Fixes Applied for Jenkins 502 and Grafana Datasource Issues

## Date: 2026-04-30

## Issues Identified and Fixed

### 1. Jenkins 502 Error (https://jenkins.medsecure/)

**Root Cause:** The nginx reverse proxy was configured to forward requests to `http://localhost:8080`, but since nginx runs in a Docker container, `localhost` refers to the nginx container itself, not the host machine.

**Fix Applied:**
- **File:** `nginx/nginx.conf`
- **Change:** Line 149 - Changed `proxy_pass http://localhost:8080;` to `proxy_pass http://jenkins:8080;`
- **Reason:** Using the Docker service name `jenkins` allows nginx to resolve the Jenkins container via Docker's internal DNS.

### 2. Grafana Datasource Not Found (https://monitoring.medsecure/)

**Root Cause:** Multiple issues prevented Grafana from connecting to Prometheus:

#### 2.1 Missing Volume Mounts
- **File:** `docker-compose.yml`
- **Change:** Added volume mounts for Grafana provisioning:
  ```yaml
  volumes:
    - grafana-storage:/var/lib/grafana
    - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    - ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
    - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro
  ```
- **Reason:** The datasources.yml and dashboards were not being mounted into the container, so Grafana couldn't find the Prometheus datasource.

#### 2.2 Incorrect Datasource URL
- **File:** `monitoring/grafana/datasources/datasources.yml`
- **Change:** Changed `url: http://medsecure-prometheus:9090` to `url: http://prometheus:9090`
- **Change:** Updated datasource name from "MedSecure Prometheus" to "Prometheus" and uid from "medsecure-prometheus" to "prometheus"
- **Reason:** Using the Docker service name `prometheus` instead of the container name ensures proper DNS resolution within the Docker network.

#### 2.3 Dashboard Datasource UID Mismatch
- **Files:** 
  - `monitoring/grafana/dashboards/container-metrics.json`
  - `monitoring/grafana/dashboards/mongodb-metrics.json`
- **Change:** Updated all datasource references from `"uid": "medsecure-prometheus"` to `"uid": "prometheus"`
- **Reason:** Dashboards must reference the correct datasource UID to query data.

### 3. Prometheus Backend Target Incorrect

**Root Cause:** Prometheus was trying to scrape metrics from `dev-backend:5000` but the actual service name is `medsecure-backend`.

**Fix Applied:**
- **File:** `monitoring/prometheus/prometheus.yml`
- **Change:** Line 12 - Changed `targets: ['dev-backend:5000']` to `targets: ['medsecure-backend:5000']`
- **Reason:** The target must match the Docker service name defined in docker-compose.yml.

## How to Apply These Fixes

### Step 1: Rebuild and Restart Services

⚠️ **CRITICAL: You MUST use `docker compose` (v2), NOT `docker-compose` (v1)** ⚠️

Your system has both installed:
- ✅ `docker compose` v5.1.3 (modern version - **USE THIS**)
- ❌ `docker-compose` v1.24.0 (legacy - does NOT support multi-stage build targets)

The `docker-compose` v1 command will fail with errors like "contains unsupported option: 'target'" because it doesn't support multi-stage Docker builds.

**Important:** To fix Jenkins login issues, you MUST remove the Jenkins volume to reset the user database:

```bash
# Stop all running containers
docker compose down

# Remove Jenkins volume to reset Jenkins (REQUIRED for login fix)
docker volume rm medsecure-jenkins_home 2>/dev/null || true

# Rebuild and start all services
docker compose up -d --build

# View logs to verify services started correctly
docker compose logs -f
```

**Note:** Removing the Jenkins volume will reset all Jenkins data (jobs, configurations, etc.). This is necessary to fix the login issue.

### Step 2: Verify Jenkins is Working

1. Wait for Jenkins to fully start (may take 2-3 minutes)
2. Navigate to: https://jenkins.medsecure/
3. You should see the Jenkins dashboard (no more 502 error)

### Step 3: Verify Grafana Monitoring is Working

1. Navigate to: https://monitoring.medsecure/
2. Log in with credentials: `admin` / `03112004d`
3. Go to Configuration → Data Sources
4. Verify "Prometheus" datasource shows "Health: OK"
5. Open the "Container Metrics" dashboard
6. You should see data populating in the graphs (may take 1-2 minutes for initial data)

### Step 4: Verify Prometheus is Scraping Correctly

1. Access Prometheus directly at: http://localhost:9091 (or https://monitoring.medsecure:3001 if you have port forwarding)
2. Go to Status → Targets
3. Verify all targets show "UP" status

## Expected Results

### Before Fixes:
- ❌ Jenkins: 502 Bad Gateway error
- ❌ Grafana: "Datasource not found" error
- ❌ Monitoring dashboards: No data displayed

### After Fixes:
- ✅ Jenkins: Accessible and functional
- ✅ Grafana: Prometheus datasource connected and healthy
- ✅ Monitoring dashboards: Real-time container metrics displayed

## Troubleshooting

If issues persist after applying fixes:

1. **Check container status:**
   ```bash
   docker-compose ps
   ```

2. **Check nginx logs:**
   ```bash
   docker-compose logs nginx
   ```

3. **Check Grafana logs:**
   ```bash
   docker-compose logs grafana
   ```

4. **Check Prometheus logs:**
   ```bash
   docker-compose logs prometheus
   ```

5. **Verify network connectivity:**
   ```bash
   docker network inspect medsecure_net
   ```

## Files Modified

1. `nginx/nginx.conf` - Fixed Jenkins proxy_pass
2. `docker-compose.yml` - Added Grafana volume mounts
3. `monitoring/grafana/datasources/datasources.yml` - Fixed datasource URL and UID
4. `monitoring/prometheus/prometheus.yml` - Fixed backend target
5. `monitoring/grafana/dashboards/container-metrics.json` - Updated datasource UID references
6. `monitoring/grafana/dashboards/mongodb-metrics.json` - Updated datasource UID references

## Notes

- All changes use Docker service names for inter-container communication
- Grafana datasources are now properly provisioned via volume mounts
- Dashboards are mounted as read-only but can be edited via Grafana UI (changes persist in grafana-storage volume)
- Prometheus will automatically discover and scrape metrics from all configured targets