#!/bin/bash
# Generate self-signed SSL certificate for local development
# For production, replace with certificates from a trusted CA (Let's Encrypt, etc.)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="$SCRIPT_DIR/ssl"

mkdir -p "$SSL_DIR"

echo "Generating self-signed SSL certificate for MedSecure..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$SSL_DIR/medsecure.key" \
  -out "$SSL_DIR/medsecure.crt" \
  -subj "/C=US/ST=State/L=City/O=MedSecure/CN=medsecure.com" \
  -addext "subjectAltName=DNS:localhost,DNS:medsecure.local,DNS:medsecure.com,DNS:www.medsecure.com,DNS:jenkins.medsecure,DNS:monitoring.medsecure,IP:127.0.0.1"

echo "SSL certificate generated:"
echo "  Certificate: $SSL_DIR/medsecure.crt"
echo "  Private Key: $SSL_DIR/medsecure.key"
echo ""
echo "To trust this certificate in your browser:"
echo "  Chrome: chrome://settings/certificates -> Authorities -> Import -> $SSL_DIR/medsecure.crt"
echo "  Firefox: about:preferences#privacy -> View Certificates -> Authorities -> Import"
echo ""
echo "Add to /etc/hosts:"
echo "  127.0.0.1  medsecure.local"
echo "  127.0.0.1  medsecure.com"
echo "  127.0.0.1  www.medsecure.com"
echo "  127.0.0.1  jenkins.medsecure"
echo "  127.0.0.1  monitoring.medsecure"
