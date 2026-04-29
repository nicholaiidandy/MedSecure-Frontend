FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates wget gnupg2 lsb-release \
  && apt-get install -y --no-install-recommends nginx-extras \
  && rm -rf /var/lib/apt/lists/*

# Create nginx directories
RUN mkdir -p /var/log/nginx /var/cache/nginx /run/nginx

# Copy MedSecure nginx config and ssl (if present)
COPY nginx.conf /etc/nginx/nginx.conf
COPY ssl/ /etc/nginx/ssl/

# Ensure default user permissions
RUN chown -R www-data:www-data /var/lib/nginx || true

CMD ["nginx", "-g", "daemon off;"]
