#!/bin/bash
# Start Nginx with MedSecure configuration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NGINX_CONF="$SCRIPT_DIR/nginx.conf"

echo "=== MedSecure Nginx Starter ==="
echo "Config: $NGINX_CONF"
echo "Project: $PROJECT_ROOT"
echo ""

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx not found. Installing..."
    sudo apt-get update && sudo apt-get install -y nginx
fi


# echo "🔧 Ensuring nginx headers-more module is installed (libnginx-mod-http-headers-more)..."
# sudo apt-get update && sudo apt-get install -y libnginx-mod-http-headers-more || true

echo "🔧 Copying SSL certs to /etc/nginx/ssl/..."
sudo mkdir -p /etc/nginx/ssl/ && sudo cp "$SCRIPT_DIR"/ssl/medsecure.* /etc/nginx/ssl/ || echo "SSL copy failed, using project path"


echo "🔍 Testing Nginx configuration..."
sudo nginx -t -c "$NGINX_CONF"

if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

# Stop any existing nginx using this config


# Start nginx
echo "🚀 Starting Nginx..."
sudo nginx -c "$NGINX_CONF"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Nginx started successfully!"
    echo ""
    echo "Access your app at:"
    echo "  • https://medsecure.com"
    echo "  • https://localhost"
    echo "  • https://medsecure.local"
    echo "  • https://jenkins.medsecure"
    echo "  • https://monitoring.medsecure"
    echo ""
    echo "API endpoint: https://medsecure.com/api"
    echo "Jenkins: https://jenkins.medsecure"
    echo "Monitoring: https://monitoring.medsecure"
    echo ""
    echo "To stop: sudo nginx -s stop -c $NGINX_CONF"
else
    echo "❌ Failed to start Nginx"
    exit 1
fi

