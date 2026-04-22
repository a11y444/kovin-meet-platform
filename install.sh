#!/bin/bash

# ============================================================================
# KOVIN Meet - Self-Hosted Installation Script
# ============================================================================
# This script automatically installs and configures all dependencies for
# KOVIN Meet on a Debian/Ubuntu server including:
# - Docker & Docker Compose
# - PostgreSQL
# - Redis
# - MinIO (S3-compatible storage)
# - LiveKit (self-hosted WebRTC SFU)
# - Coturn (TURN server for NAT traversal)
# - Nginx reverse proxy
# - Certbot SSL certificates
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root (use sudo)"
   exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    log_error "Cannot detect OS. This script supports Debian/Ubuntu only."
    exit 1
fi

log_info "Detected OS: $OS $VER"

if [[ ! "$OS" =~ "Ubuntu" && ! "$OS" =~ "Debian" ]]; then
    log_error "This script only supports Ubuntu and Debian."
    exit 1
fi

# ============================================================================
# CONFIGURATION
# ============================================================================

echo ""
echo "============================================"
echo "  KOVIN Meet - Installation Configuration  "
echo "============================================"
echo ""

# Get domain name
read -p "Enter your domain name (e.g., meet.example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    log_error "Domain name is required"
    exit 1
fi

# Get email for SSL
read -p "Enter your email for SSL certificates: " SSL_EMAIL
if [ -z "$SSL_EMAIL" ]; then
    log_error "Email is required for SSL certificates"
    exit 1
fi

# Get server public IP
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com)
log_info "Detected server IP: $SERVER_IP"

# Generate secure passwords and keys
generate_password() {
    openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32
}

generate_api_key() {
    openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 48
}

# Configuration variables
POSTGRES_PASSWORD=$(generate_password)
REDIS_PASSWORD=$(generate_password)
MINIO_ROOT_USER="kovinadmin"
MINIO_ROOT_PASSWORD=$(generate_password)
LIVEKIT_API_KEY="API$(generate_api_key | head -c 12)"
LIVEKIT_API_SECRET=$(generate_api_key)
NEXTAUTH_SECRET=$(generate_api_key)
TURN_SECRET=$(generate_password)

# Installation directory
INSTALL_DIR="/opt/kovin-meet"

log_info "Configuration complete. Starting installation..."
echo ""

# ============================================================================
# INSTALL DEPENDENCIES
# ============================================================================

log_info "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

log_info "Installing required packages..."
apt-get install -y -qq \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    jq \
    ufw \
    fail2ban

# ============================================================================
# INSTALL DOCKER
# ============================================================================

log_info "Installing Docker..."

# Remove old versions
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings

# Detect distro for correct Docker repo
if [[ "$OS" =~ "Ubuntu" ]]; then
    DOCKER_DISTRO="ubuntu"
elif [[ "$OS" =~ "Debian" ]]; then
    DOCKER_DISTRO="debian"
fi

curl -fsSL https://download.docker.com/linux/${DOCKER_DISTRO}/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository (use bookworm for Debian 13 trixie as it may not be available yet)
CODENAME=$(. /etc/os-release && echo "$VERSION_CODENAME")
if [[ "$CODENAME" == "trixie" ]]; then
    CODENAME="bookworm"
fi

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${DOCKER_DISTRO} \
  ${CODENAME} stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

log_success "Docker installed successfully"

# ============================================================================
# CREATE INSTALLATION DIRECTORY
# ============================================================================

log_info "Creating installation directory..."
mkdir -p $INSTALL_DIR
mkdir -p $INSTALL_DIR/data/postgres
mkdir -p $INSTALL_DIR/data/redis
mkdir -p $INSTALL_DIR/data/minio
mkdir -p $INSTALL_DIR/data/livekit
mkdir -p $INSTALL_DIR/data/recordings
mkdir -p $INSTALL_DIR/config
mkdir -p $INSTALL_DIR/certs
mkdir -p $INSTALL_DIR/logs

# ============================================================================
# CREATE LIVEKIT CONFIGURATION
# ============================================================================

log_info "Creating LiveKit configuration..."

cat > $INSTALL_DIR/config/livekit.yaml << EOF
port: 7880
rtc:
  port_range_start: 50000
  port_range_end: 60000
  tcp_port: 7881
  use_external_ip: true
  enable_loopback_candidate: false

redis:
  address: redis:6379
  password: ${REDIS_PASSWORD}

turn:
  enabled: true
  domain: ${DOMAIN}
  tls_port: 5349
  udp_port: 3478
  external_tls: true

keys:
  ${LIVEKIT_API_KEY}: ${LIVEKIT_API_SECRET}

logging:
  level: info
  json: true

room:
  enabled_codecs:
    - mime: audio/opus
    - mime: video/VP8
    - mime: video/H264
  max_participants: 100
  empty_timeout: 300
  departure_timeout: 20

webhook:
  urls:
    - https://${DOMAIN}/api/webhooks/livekit
  api_key: ${LIVEKIT_API_KEY}
EOF

# ============================================================================
# CREATE COTURN CONFIGURATION
# ============================================================================

log_info "Creating Coturn configuration..."

cat > $INSTALL_DIR/config/turnserver.conf << EOF
# Coturn TURN Server Configuration
listening-port=3478
tls-listening-port=5349
listening-ip=0.0.0.0
external-ip=${SERVER_IP}
relay-ip=0.0.0.0
min-port=49152
max-port=65535

# Authentication
use-auth-secret
static-auth-secret=${TURN_SECRET}
realm=${DOMAIN}

# Logging
log-file=/var/log/turnserver.log
verbose

# Performance
total-quota=100
bps-capacity=0
stale-nonce=600
no-multicast-peers

# Security
no-cli
fingerprint
lt-cred-mech

# SSL
cert=/etc/letsencrypt/live/${DOMAIN}/fullchain.pem
pkey=/etc/letsencrypt/live/${DOMAIN}/privkey.pem
EOF

# ============================================================================
# CREATE NGINX CONFIGURATION
# ============================================================================

log_info "Creating Nginx configuration..."

cat > $INSTALL_DIR/config/nginx.conf << 'NGINX_EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=conn:10m;

    # Upstream definitions
    upstream nextjs {
        server app:3000;
        keepalive 32;
    }

    upstream livekit {
        server livekit:7880;
        keepalive 32;
    }

    upstream minio {
        server minio:9000;
        keepalive 32;
    }

    # HTTP redirect to HTTPS
    server {
        listen 80;
        listen [::]:80;
        server_name DOMAIN_PLACEHOLDER;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # Main HTTPS server
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name DOMAIN_PLACEHOLDER;

        ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        add_header Strict-Transport-Security "max-age=63072000" always;
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # Next.js application
        location / {
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }

        # LiveKit WebSocket
        location /rtc {
            proxy_pass http://livekit;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 86400;
            proxy_send_timeout 86400;
        }

        # LiveKit API
        location /twirp {
            proxy_pass http://livekit;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # MinIO storage
        location /storage/ {
            rewrite ^/storage/(.*) /$1 break;
            proxy_pass http://minio;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            client_max_body_size 1G;
        }

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
NGINX_EOF

# Replace domain placeholder
sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" $INSTALL_DIR/config/nginx.conf

# ============================================================================
# CREATE DOCKER COMPOSE FILE
# ============================================================================

log_info "Creating Docker Compose configuration..."

cat > $INSTALL_DIR/docker-compose.yml << EOF
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: kovin-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: kovin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: kovin_meet
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kovin -d kovin_meet"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - kovin-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: kovin-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - ./data/redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - kovin-network

  # MinIO Object Storage
  minio:
    image: minio/minio:latest
    container_name: kovin-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - ./data/minio:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - kovin-network

  # LiveKit Server
  livekit:
    image: livekit/livekit-server:latest
    container_name: kovin-livekit
    restart: unless-stopped
    command: --config /etc/livekit.yaml
    ports:
      - "7881:7881/tcp"
      - "50000-60000:50000-60000/udp"
    volumes:
      - ./config/livekit.yaml:/etc/livekit.yaml:ro
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - kovin-network

  # Coturn TURN Server
  coturn:
    image: coturn/coturn:latest
    container_name: kovin-coturn
    restart: unless-stopped
    ports:
      - "3478:3478/tcp"
      - "3478:3478/udp"
      - "5349:5349/tcp"
      - "5349:5349/udp"
      - "49152-65535:49152-65535/udp"
    volumes:
      - ./config/turnserver.conf:/etc/coturn/turnserver.conf:ro
      - ./certs:/etc/letsencrypt:ro
    networks:
      - kovin-network

  # Next.js Application
  app:
    image: node:20-alpine
    container_name: kovin-app
    restart: unless-stopped
    working_dir: /app
    command: sh -c "npm install && npm run build && npm start"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://kovin:${POSTGRES_PASSWORD}@postgres:5432/kovin_meet
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      NEXTAUTH_URL: https://${DOMAIN}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      LIVEKIT_URL: wss://${DOMAIN}
      LIVEKIT_API_KEY: ${LIVEKIT_API_KEY}
      LIVEKIT_API_SECRET: ${LIVEKIT_API_SECRET}
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      MINIO_BUCKET: kovin-recordings
      STORAGE_URL: https://${DOMAIN}/storage
    volumes:
      - ./app:/app
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - kovin-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: kovin-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/letsencrypt:ro
      - ./certbot-webroot:/var/www/certbot:ro
    depends_on:
      - app
      - livekit
      - minio
    networks:
      - kovin-network

  # Certbot for SSL
  certbot:
    image: certbot/certbot
    container_name: kovin-certbot
    volumes:
      - ./certs:/etc/letsencrypt
      - ./certbot-webroot:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait \$\${!}; done;'"
    networks:
      - kovin-network

networks:
  kovin-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF

# ============================================================================
# CREATE ENVIRONMENT FILE
# ============================================================================

log_info "Creating environment file..."

cat > $INSTALL_DIR/.env << EOF
# KOVIN Meet Environment Configuration
# Generated on $(date)

# Domain
DOMAIN=${DOMAIN}
SERVER_IP=${SERVER_IP}

# PostgreSQL
POSTGRES_USER=kovin
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=kovin_meet
DATABASE_URL=postgresql://kovin:${POSTGRES_PASSWORD}@postgres:5432/kovin_meet

# Redis
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# MinIO
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_BUCKET=kovin-recordings

# LiveKit
LIVEKIT_URL=wss://${DOMAIN}
LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}

# Coturn
TURN_SECRET=${TURN_SECRET}

# NextAuth
NEXTAUTH_URL=https://${DOMAIN}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# Storage
STORAGE_URL=https://${DOMAIN}/storage
EOF

chmod 600 $INSTALL_DIR/.env

# ============================================================================
# CONFIGURE FIREWALL
# ============================================================================

log_info "Configuring firewall..."

ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Essential ports
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# LiveKit ports
ufw allow 7881/tcp comment 'LiveKit TCP'
ufw allow 50000:60000/udp comment 'LiveKit RTC'

# TURN server ports
ufw allow 3478/tcp comment 'TURN TCP'
ufw allow 3478/udp comment 'TURN UDP'
ufw allow 5349/tcp comment 'TURN TLS'
ufw allow 5349/udp comment 'TURN DTLS'
ufw allow 49152:65535/udp comment 'TURN relay'

ufw --force enable

log_success "Firewall configured"

# ============================================================================
# OBTAIN SSL CERTIFICATES
# ============================================================================

log_info "Obtaining SSL certificates..."

# Check if port 80 is in use and stop conflicting services
log_info "Checking for services using port 80..."
PORT80_PID=$(lsof -t -i:80 2>/dev/null || true)
if [ -n "$PORT80_PID" ]; then
    log_warning "Port 80 is in use. Stopping conflicting services..."
    
    # Try to stop common web servers
    systemctl stop apache2 2>/dev/null || true
    systemctl stop nginx 2>/dev/null || true
    systemctl stop httpd 2>/dev/null || true
    systemctl stop lighttpd 2>/dev/null || true
    
    # Wait a moment
    sleep 2
    
    # Check again
    PORT80_PID=$(lsof -t -i:80 2>/dev/null || true)
    if [ -n "$PORT80_PID" ]; then
        log_warning "Still have processes on port 80. Attempting to kill..."
        kill -9 $PORT80_PID 2>/dev/null || true
        sleep 2
    fi
fi

# Also check port 443
PORT443_PID=$(lsof -t -i:443 2>/dev/null || true)
if [ -n "$PORT443_PID" ]; then
    log_warning "Port 443 is in use. Stopping conflicting services..."
    kill -9 $PORT443_PID 2>/dev/null || true
    sleep 2
fi

# Disable common web servers from auto-starting
systemctl disable apache2 2>/dev/null || true
systemctl disable nginx 2>/dev/null || true
systemctl disable httpd 2>/dev/null || true

# Create certbot webroot
mkdir -p $INSTALL_DIR/certbot-webroot

# Remove any existing temp-nginx container
docker stop temp-nginx 2>/dev/null || true
docker rm temp-nginx 2>/dev/null || true

# Start nginx temporarily for ACME challenge
log_info "Starting temporary nginx for SSL certificate verification..."
docker run -d --name temp-nginx -p 80:80 \
    -v $INSTALL_DIR/certbot-webroot:/var/www/certbot \
    -v $INSTALL_DIR/config/nginx-certbot.conf:/etc/nginx/conf.d/default.conf \
    nginx:alpine

# Create simple nginx config for certbot
mkdir -p $INSTALL_DIR/config
cat > $INSTALL_DIR/config/nginx-certbot.conf << 'CERTBOT_NGINX'
server {
    listen 80;
    server_name _;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 200 'KOVIN Meet - SSL Setup in Progress';
        add_header Content-Type text/plain;
    }
}
CERTBOT_NGINX

# Restart temp-nginx with the config
docker stop temp-nginx 2>/dev/null || true
docker rm temp-nginx 2>/dev/null || true

docker run -d --name temp-nginx -p 80:80 \
    -v $INSTALL_DIR/certbot-webroot:/var/www/certbot \
    -v $INSTALL_DIR/config/nginx-certbot.conf:/etc/nginx/conf.d/default.conf \
    nginx:alpine

if [ $? -ne 0 ]; then
    log_error "Failed to start temporary nginx. Port 80 may still be in use."
    log_error "Please manually stop the service using port 80 and run the installer again."
    log_error "Run: sudo lsof -i:80    to find the process"
    log_error "Run: sudo kill -9 <PID> to stop it"
    exit 1
fi

sleep 5

# Obtain certificate
log_info "Requesting SSL certificate from Let's Encrypt..."
docker run --rm \
    -v $INSTALL_DIR/certs:/etc/letsencrypt \
    -v $INSTALL_DIR/certbot-webroot:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $SSL_EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

CERT_RESULT=$?

# Stop temporary nginx
docker stop temp-nginx 2>/dev/null || true
docker rm temp-nginx 2>/dev/null || true

if [ $CERT_RESULT -ne 0 ]; then
    log_error "Failed to obtain SSL certificate. Please check:"
    log_error "1. Your domain ($DOMAIN) points to this server's IP ($SERVER_IP)"
    log_error "2. Port 80 is accessible from the internet"
    log_error "3. Your DNS records are properly configured"
    exit 1
fi

log_success "SSL certificates obtained"

# ============================================================================
# CREATE SYSTEMD SERVICE
# ============================================================================

log_info "Creating systemd service..."

cat > /etc/systemd/system/kovin-meet.service << EOF
[Unit]
Description=KOVIN Meet Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${INSTALL_DIR}
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable kovin-meet.service

# ============================================================================
# CREATE MANAGEMENT SCRIPTS
# ============================================================================

log_info "Creating management scripts..."

# Start script
cat > $INSTALL_DIR/start.sh << 'EOF'
#!/bin/bash
cd /opt/kovin-meet
docker compose up -d
echo "KOVIN Meet started"
EOF
chmod +x $INSTALL_DIR/start.sh

# Stop script
cat > $INSTALL_DIR/stop.sh << 'EOF'
#!/bin/bash
cd /opt/kovin-meet
docker compose down
echo "KOVIN Meet stopped"
EOF
chmod +x $INSTALL_DIR/stop.sh

# Restart script
cat > $INSTALL_DIR/restart.sh << 'EOF'
#!/bin/bash
cd /opt/kovin-meet
docker compose down
docker compose up -d
echo "KOVIN Meet restarted"
EOF
chmod +x $INSTALL_DIR/restart.sh

# Logs script
cat > $INSTALL_DIR/logs.sh << 'EOF'
#!/bin/bash
cd /opt/kovin-meet
docker compose logs -f
EOF
chmod +x $INSTALL_DIR/logs.sh

# Backup script
cat > $INSTALL_DIR/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/kovin-meet/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "Starting backup..."

# Backup PostgreSQL
docker exec kovin-postgres pg_dump -U kovin kovin_meet > $BACKUP_DIR/postgres_$TIMESTAMP.sql

# Backup configuration
tar -czf $BACKUP_DIR/config_$TIMESTAMP.tar.gz -C /opt/kovin-meet config .env

# Backup MinIO data
tar -czf $BACKUP_DIR/minio_$TIMESTAMP.tar.gz -C /opt/kovin-meet/data minio

echo "Backup completed: $BACKUP_DIR"

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t postgres_*.sql | tail -n +8 | xargs -r rm
ls -t config_*.tar.gz | tail -n +8 | xargs -r rm
ls -t minio_*.tar.gz | tail -n +8 | xargs -r rm
EOF
chmod +x $INSTALL_DIR/backup.sh

# Update script
cat > $INSTALL_DIR/update.sh << 'EOF'
#!/bin/bash
cd /opt/kovin-meet

echo "Pulling latest images..."
docker compose pull

echo "Restarting services..."
docker compose up -d

echo "Cleaning up old images..."
docker image prune -f

echo "Update complete"
EOF
chmod +x $INSTALL_DIR/update.sh

# ============================================================================
# CREATE CRON JOBS
# ============================================================================

log_info "Setting up cron jobs..."

# SSL renewal
(crontab -l 2>/dev/null; echo "0 3 * * * cd /opt/kovin-meet && docker compose exec certbot certbot renew --quiet") | crontab -

# Daily backup
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/kovin-meet/backup.sh >> /opt/kovin-meet/logs/backup.log 2>&1") | crontab -

# ============================================================================
# START SERVICES
# ============================================================================

log_info "Starting KOVIN Meet services..."

cd $INSTALL_DIR
docker compose up -d

# Wait for services to be ready
log_info "Waiting for services to be ready..."
sleep 30

# ============================================================================
# INITIALIZE DATABASE
# ============================================================================

log_info "Initializing database..."

# Run Prisma migrations
docker exec kovin-app npx prisma migrate deploy 2>/dev/null || true
docker exec kovin-app npx prisma db push 2>/dev/null || true

# ============================================================================
# PRINT SUMMARY
# ============================================================================

echo ""
echo "============================================"
echo "  KOVIN Meet Installation Complete!        "
echo "============================================"
echo ""
log_success "Installation completed successfully!"
echo ""
echo "Your KOVIN Meet platform is now available at:"
echo "  https://${DOMAIN}"
echo ""
echo "============================================"
echo "  IMPORTANT CREDENTIALS (SAVE THESE!)      "
echo "============================================"
echo ""
echo "PostgreSQL:"
echo "  User: kovin"
echo "  Password: ${POSTGRES_PASSWORD}"
echo "  Database: kovin_meet"
echo ""
echo "Redis Password: ${REDIS_PASSWORD}"
echo ""
echo "MinIO:"
echo "  Access Key: ${MINIO_ROOT_USER}"
echo "  Secret Key: ${MINIO_ROOT_PASSWORD}"
echo "  Console: https://${DOMAIN}:9001"
echo ""
echo "LiveKit:"
echo "  API Key: ${LIVEKIT_API_KEY}"
echo "  API Secret: ${LIVEKIT_API_SECRET}"
echo ""
echo "NextAuth Secret: ${NEXTAUTH_SECRET}"
echo ""
echo "TURN Secret: ${TURN_SECRET}"
echo ""
echo "============================================"
echo "  MANAGEMENT COMMANDS                      "
echo "============================================"
echo ""
echo "Start:    ${INSTALL_DIR}/start.sh"
echo "Stop:     ${INSTALL_DIR}/stop.sh"
echo "Restart:  ${INSTALL_DIR}/restart.sh"
echo "Logs:     ${INSTALL_DIR}/logs.sh"
echo "Backup:   ${INSTALL_DIR}/backup.sh"
echo "Update:   ${INSTALL_DIR}/update.sh"
echo ""
echo "SystemD:  systemctl [start|stop|restart] kovin-meet"
echo ""
echo "============================================"
echo "  NEXT STEPS                               "
echo "============================================"
echo ""
echo "1. Copy your Next.js application to: ${INSTALL_DIR}/app/"
echo "2. Run: cd ${INSTALL_DIR} && docker compose restart app"
echo "3. Create your first superadmin user"
echo "4. Configure your DNS to point to: ${SERVER_IP}"
echo ""
echo "For support, visit: https://github.com/your-repo/kovin-meet"
echo ""

# Save credentials to file
cat > $INSTALL_DIR/credentials.txt << EOF
KOVIN Meet Credentials
Generated: $(date)

Domain: ${DOMAIN}
Server IP: ${SERVER_IP}

PostgreSQL:
  User: kovin
  Password: ${POSTGRES_PASSWORD}
  Database: kovin_meet

Redis Password: ${REDIS_PASSWORD}

MinIO:
  Access Key: ${MINIO_ROOT_USER}
  Secret Key: ${MINIO_ROOT_PASSWORD}

LiveKit:
  API Key: ${LIVEKIT_API_KEY}
  API Secret: ${LIVEKIT_API_SECRET}

NextAuth Secret: ${NEXTAUTH_SECRET}
TURN Secret: ${TURN_SECRET}
EOF

chmod 600 $INSTALL_DIR/credentials.txt
log_warning "Credentials saved to: ${INSTALL_DIR}/credentials.txt"
log_warning "Please store these credentials securely and delete this file!"
