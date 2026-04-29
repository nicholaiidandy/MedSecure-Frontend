# MedSecure Fixes

## Jenkins Login (Complete)
- [x] Reset jenkins_home volume
- [x] Restart services
- [x] Test initial pw then admin/03112004d at https://jenkins.medsecure

## Grafana Container Metrics (In Progress)
Status: Approved for cadvisor addition

1. [ ] Add cadvisor service to docker-compose.yml
2. [ ] sudo docker compose up -d cadvisor prometheus grafana nginx
3. [ ] Wait 2min
4. [ ] sudo docker compose logs prometheus (cadvisor target UP)
5. [ ] Test https://monitoring.medsecure/d/container-metrics?orgId=1 (data shows)
6. [ ] Mark complete
