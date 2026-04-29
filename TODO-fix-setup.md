# Fix MedSecure Setup: Blank Page, Preserve Jenkins/Grafana Creds
Status: In Progress

## Issues Identified
- Docker Compose v1 validation errors (cadvisor privileged, volumes/networks)
- Docker socket sudo perms needed
- Services not running → blank https://medsecure.com
- Jenkins/Grafana creds already set via env/volumes/init.groovy → no reset

## Steps
- [ ] 1. Check Docker Compose version: `docker compose version`
- [x] 2. Fix docker-compose.yml: Comment cadvisor service for compatibility
- [ ] 3. `sudo docker compose down` (ignore errors)
- [ ] 4. `sudo docker compose build --no-cache`
- [ ] 5. `sudo docker compose up -d`
- [ ] 6. `sudo docker compose ps` (all Up)
- [ ] 7. `sudo docker compose logs frontend-builder nginx backend`
- [ ] 8. Test:
  | URL | Expected | Creds |
  |-----|----------|-------|
  | https://medsecure.com | React app loads | - |
  | https://jenkins.medsecure | Jenkins dashboard | admin/03112004d |
  | https://monitoring.medsecure | Grafana | admin/03112004d |
- [ ] 9. If frontend build fails → check npm run build
- [ ] 10. Mark complete, remove TODO

Post-setup: Browser https://medsecure.com (accept self-signed cert)

Sudo pw: nicholai
