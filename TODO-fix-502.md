# Fix 502 Errors on Subdomains

## Steps:
1. [x] Update docker-compose.yml (done)
   - Add `jenkins` service
   - Add frontend volume to nginx: `./dist:/usr/share/nginx/html:ro`
   - Add to nginx depends_on: jenkins, grafana

2. [x] Update nginx/nginx.conf (done)
   - medsecure.com /api/ proxy_pass: `http://127.0.0.1:5000` → `http://backend:5000`
   - monitoring.medsecure / proxy_pass: `http://127.0.0.1:3001` → `http://grafana:3000`
   - jenkins.medsecure / proxy_pass: `http://127.0.0.1:8080` → `http://jenkins:8080`

3. [ ] `sudo docker compose down && sudo docker compose up -d --build`

4. [ ] `sudo docker compose logs -f nginx`

5. [ ] Test:
   - curl -k https://localhost (main)
   - curl -k -H 'Host: jenkins.medsecure.com' https://localhost
   - curl -k -H 'Host: monitoring.medsecure.com' https://localhost

Status: Starting Step 1
