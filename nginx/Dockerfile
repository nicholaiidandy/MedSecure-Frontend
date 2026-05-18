FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     ca-certificates wget gnupg2 lsb-release nginx-extras \
  && rm -rf /var/lib/apt/lists/*

# Create required dirs
RUN mkdir -p /var/log/nginx \
  /var/cache/nginx \
  /var/lib/nginx/body \
  /var/lib/nginx/fastcgi \
  /var/lib/nginx/proxy \
  /run/nginx \
  && chown -R www-data:www-data /var/log/nginx /var/cache/nginx /var/lib/nginx /run/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY ssl/ /etc/nginx/ssl/

RUN chown -R root:www-data /etc/nginx/ssl \
  && chmod 750 /etc/nginx/ssl \
  && chmod 640 /etc/nginx/ssl/medsecure.key \
  && chmod 644 /etc/nginx/ssl/medsecure.crt

# 🔥 penting: pastikan USER terakhir sebelum CMD
USER www-data

# optional tapi lebih aman untuk Semgrep:
WORKDIR /etc/nginx

CMD ["nginx", "-g", "daemon off;"]
