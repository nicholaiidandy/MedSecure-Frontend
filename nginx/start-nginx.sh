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

# Test configuration
echo "🔍 Testing Nginx configuration..."
sudo nginx -t -c "$NGINX_CONF"

if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

# Stop any existing nginx using this config
echo "🛑 Stopping existing Nginx (if running)..."
sudo nginx -s stop -c "$NGINX_CONF" 2>/dev/null || true

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
    echo ""
    echo "API endpoint: https://medsecure.com/api"
    echo ""
    echo "To stop: sudo nginx -s stop -c $NGINX_CONF"
else
    echo "❌ Failed to start Nginx"
    exit 1
fi

