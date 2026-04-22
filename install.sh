#!/bin/bash
# =============================================================================
# KOVIN Meet - Complete Self-Hosted Installation Script
# =============================================================================
# Tested on: Ubuntu 22.04 LTS (RECOMMENDED)
# 
# Usage:
#   1. Get a fresh Ubuntu 22.04 VPS
#   2. Point your domain to the server IP
#   3. SSH as root and run:
#      git clone https://github.com/a11y444/kovin-meet-platform.git
#      cd kovin-meet-platform
#      chmod +x install.sh
#      ./install.sh
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[*]${NC} $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# =============================================================================
# CHECKS
# =============================================================================

[ "$EUID" -ne 0 ] && err "Run as root: sudo ./install.sh"

clear
echo "========================================"
echo "     KOVIN Meet - Installation"
echo "========================================"
echo ""

# =============================================================================
# CONFIGURATION
# =============================================================================

read -p "Domain (e.g., meet.example.com): " DOMAIN
[ -z "$DOMAIN" ] && err "Domain required"

read -p "Email for SSL: " EMAIL
[ -z "$EMAIL" ] && EMAIL="admin@$DOMAIN"

read -p "Superadmin email [$EMAIL]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-$EMAIL}

read -sp "Superadmin password (min 8 chars, Enter for random): " ADMIN_PASS
echo ""
if [ -z "$ADMIN_PASS" ] || [ ${#ADMIN_PASS} -lt 8 ]; then
    ADMIN_PASS=$(openssl rand -base64 12)
    warn "Generated password: $ADMIN_PASS"
fi

# Generate all secrets
PG_PASS=$(openssl rand -hex 16)
REDIS_PASS=$(openssl rand -hex 16)
AUTH_SECRET=$(openssl rand -base64 32)
LK_KEY="API$(openssl rand -hex 6)"
LK_SECRET=$(openssl rand -base64 32)
TURN_SECRET=$(openssl rand -hex 16)
MINIO_USER="kovin"
MINIO_PASS=$(openssl rand -hex 16)

SERVER_IP=$(curl -s -4 ifconfig.me 2>/dev/null || curl -s icanhazip.com)
DIR="/opt/kovin-meet"

echo ""
log "Domain: $DOMAIN"
log "Server IP: $SERVER_IP"
echo ""

# =============================================================================
# SYSTEM UPDATE
# =============================================================================

log "Updating system..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
ok "System updated"

# =============================================================================
# INSTALL PACKAGES
# =============================================================================

log "Installing packages..."
apt-get install -y -qq curl wget git jq ufw openssl

# Docker
if ! command -v docker &>/dev/null; then
    log "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi
ok "Docker ready"

# Node.js 20
if ! command -v node &>/dev/null; then
    log "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
fi
ok "Node.js $(node -v)"

# PM2
npm install -g pm2 --silent 2>/dev/null
ok "PM2 ready"

# =============================================================================
# DIRECTORIES
# =============================================================================

log "Creating directories..."
rm -rf "$DIR" 2>/dev/null || true
mkdir -p "$DIR"/{data/postgres,data/redis,data/minio,certs,config}

# Copy app from current directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/package.json" ]; then
    mkdir -p "$DIR/app"
    rsync -a --exclude='node_modules' --exclude='.next' --exclude='.git' "$SCRIPT_DIR/" "$DIR/app/"
    ok "App copied"
else
    err "Run from kovin-meet-platform directory"
fi

# =============================================================================
# SSL CERTIFICATE
# =============================================================================

log "Setting up SSL..."
CERT_DIR="$DIR/certs/live/$DOMAIN"
mkdir -p "$CERT_DIR"

# Check for existing cert
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    cp -L /etc/letsencrypt/live/$DOMAIN/*.pem "$CERT_DIR/"
    ok "Using existing Let's Encrypt cert"
else
    # Try to get Let's Encrypt cert
    apt-get install -y -qq certbot
    if certbot certonly --standalone --non-interactive --agree-tos -m "$EMAIL" -d "$DOMAIN" 2>/dev/null; then
        cp -L /etc/letsencrypt/live/$DOMAIN/*.pem "$CERT_DIR/"
        ok "Got Let's Encrypt cert"
    else
        warn "Creating self-signed cert (browser will show warning)"
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$CERT_DIR/privkey.pem" \
            -out "$CERT_DIR/fullchain.pem" \
            -subj "/CN=$DOMAIN" 2>/dev/null
    fi
fi

# =============================================================================
# DOCKER COMPOSE
# =============================================================================

log "Creating Docker Compose..."
cat > "$DIR/docker-compose.yml" << EOF
services:
  postgres:
    image: postgres:16-alpine
    container_name: kovin-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: kovin
      POSTGRES_PASSWORD: $PG_PASS
      POSTGRES_DB: kovin_meet
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kovin"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: kovin-redis
    restart: unless-stopped
    command: redis-server --requirepass $REDIS_PASS
    volumes:
      - ./data/redis:/data
    ports:
      - "127.0.0.1:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "$REDIS_PASS", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    container_name: kovin-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: $MINIO_USER
      MINIO_ROOT_PASSWORD: $MINIO_PASS
    volumes:
      - ./data/minio:/data
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"

  livekit:
    image: livekit/livekit-server:latest
    container_name: kovin-livekit
    restart: unless-stopped
    network_mode: host
    command: --config /etc/livekit.yaml
    volumes:
      - ./config/livekit.yaml:/etc/livekit.yaml:ro
    depends_on:
      redis:
        condition: service_healthy

  nginx:
    image: nginx:alpine
    container_name: kovin-nginx
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/letsencrypt:ro
    ports:
      - "80:80"
      - "443:443"
EOF

# =============================================================================
# LIVEKIT CONFIG
# =============================================================================

log "Creating LiveKit config..."
cat > "$DIR/config/livekit.yaml" << EOF
port: 7880
rtc:
  port_range_start: 50000
  port_range_end: 50100
  tcp_port: 7881
  use_external_ip: true
redis:
  address: 127.0.0.1:6379
  password: $REDIS_PASS
keys:
  $LK_KEY: $LK_SECRET
turn:
  enabled: true
  domain: $DOMAIN
  tls_port: 5349
  udp_port: 3478
EOF

# =============================================================================
# NGINX CONFIG
# =============================================================================

log "Creating Nginx config..."
cat > "$DIR/config/nginx.conf" << EOF
events { worker_connections 4096; }

http {
    include /etc/nginx/mime.types;
    
    server {
        listen 80;
        server_name $DOMAIN;
        return 301 https://\$host\$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name $DOMAIN;

        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        
        client_max_body_size 100M;

        location / {
            proxy_pass http://host.docker.internal:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_read_timeout 86400;
        }

        location /rtc {
            proxy_pass http://host.docker.internal:7880;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_read_timeout 86400;
        }

        location /storage/ {
            proxy_pass http://host.docker.internal:9000/;
            proxy_set_header Host \$host;
        }
    }
}
EOF

# =============================================================================
# APP ENV FILE
# =============================================================================

log "Creating environment file..."
cat > "$DIR/app/.env" << EOF
DATABASE_URL=postgresql://kovin:$PG_PASS@localhost:5432/kovin_meet
REDIS_URL=redis://:$REDIS_PASS@localhost:6379
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$AUTH_SECRET
LIVEKIT_URL=wss://$DOMAIN
LIVEKIT_API_KEY=$LK_KEY
LIVEKIT_API_SECRET=$LK_SECRET
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=$MINIO_USER
MINIO_SECRET_KEY=$MINIO_PASS
EOF

# =============================================================================
# FIREWALL
# =============================================================================

log "Configuring firewall..."
ufw --force reset >/dev/null 2>&1
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3478/udp
ufw allow 5349/tcp
ufw allow 7880/tcp
ufw allow 7881/tcp
ufw allow 50000:50100/udp
ufw --force enable >/dev/null 2>&1
ok "Firewall configured"

# =============================================================================
# START INFRASTRUCTURE
# =============================================================================

log "Starting infrastructure..."
cd "$DIR"
docker compose up -d

log "Waiting for PostgreSQL..."
until docker exec kovin-postgres pg_isready -U kovin >/dev/null 2>&1; do sleep 2; done
ok "PostgreSQL ready"

# =============================================================================
# BUILD AND START APP
# =============================================================================

log "Installing dependencies (this takes a minute)..."
cd "$DIR/app"
npm install --legacy-peer-deps 2>&1 | tail -3

log "Setting up database..."
npx prisma generate 2>&1 | tail -2
npx prisma db push --accept-data-loss 2>&1 | tail -3
ok "Database ready"

log "Creating superadmin..."
cat > /tmp/seed.js << 'SEED'
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const pass = process.env.ADMIN_PASS;
  const hash = await bcrypt.hash(pass, 12);
  
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash, isSuperAdmin: true, isActive: true },
    create: {
      email,
      passwordHash: hash,
      firstName: "Super",
      lastName: "Admin", 
      isSuperAdmin: true,
      isActive: true
    }
  });
  console.log("Superadmin ready:", email);
}
main().finally(() => prisma.$disconnect());
SEED

ADMIN_EMAIL="$ADMIN_EMAIL" ADMIN_PASS="$ADMIN_PASS" node /tmp/seed.js
rm /tmp/seed.js

log "Building app (this takes 2-3 minutes)..."
npm run build 2>&1 | tail -5
ok "Build complete"

log "Starting app with PM2..."
pm2 delete kovin-app 2>/dev/null || true
pm2 start npm --name "kovin-app" -- start
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
ok "App started"

# =============================================================================
# MANAGEMENT SCRIPTS
# =============================================================================

cat > "$DIR/start.sh" << 'EOF'
#!/bin/bash
cd /opt/kovin-meet && docker compose up -d && pm2 start kovin-app
EOF

cat > "$DIR/stop.sh" << 'EOF'
#!/bin/bash
pm2 stop kovin-app && cd /opt/kovin-meet && docker compose down
EOF

cat > "$DIR/restart.sh" << 'EOF'
#!/bin/bash
pm2 restart kovin-app && cd /opt/kovin-meet && docker compose restart
EOF

cat > "$DIR/logs.sh" << 'EOF'
#!/bin/bash
pm2 logs kovin-app --lines 100
EOF

cat > "$DIR/status.sh" << 'EOF'
#!/bin/bash
echo "=== Containers ===" && docker ps --format "table {{.Names}}\t{{.Status}}"
echo "" && echo "=== App ===" && pm2 status
EOF

chmod +x "$DIR"/*.sh

# =============================================================================
# SYSTEMD SERVICE
# =============================================================================

cat > /etc/systemd/system/kovin-meet.service << EOF
[Unit]
Description=KOVIN Meet
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=$DIR/start.sh
ExecStop=$DIR/stop.sh

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable kovin-meet

# =============================================================================
# SAVE CREDENTIALS
# =============================================================================

cat > "$DIR/CREDENTIALS.txt" << EOF
========================================
  KOVIN Meet Credentials
========================================

URL: https://$DOMAIN

SUPERADMIN LOGIN:
  URL:      https://$DOMAIN/superadmin/login
  Email:    $ADMIN_EMAIL
  Password: $ADMIN_PASS

DATABASE:
  Host:     localhost:5432
  User:     kovin
  Password: $PG_PASS
  Database: kovin_meet

REDIS:
  Host:     localhost:6379
  Password: $REDIS_PASS

MINIO:
  Console:  http://localhost:9001
  User:     $MINIO_USER
  Password: $MINIO_PASS

LIVEKIT:
  API Key:    $LK_KEY
  API Secret: $LK_SECRET

COMMANDS:
  Status:  $DIR/status.sh
  Logs:    $DIR/logs.sh
  Restart: $DIR/restart.sh

========================================
  DELETE THIS FILE AFTER SAVING!
========================================
EOF

chmod 600 "$DIR/CREDENTIALS.txt"

# =============================================================================
# DONE
# =============================================================================

echo ""
echo "========================================"
echo "     Installation Complete!"
echo "========================================"
echo ""
echo "URL: https://$DOMAIN"
echo ""
echo "Superadmin Login:"
echo "  https://$DOMAIN/superadmin/login"
echo "  Email:    $ADMIN_EMAIL"
echo "  Password: $ADMIN_PASS"
echo ""
echo "Credentials saved to: $DIR/CREDENTIALS.txt"
echo ""
echo "Commands:"
echo "  $DIR/status.sh  - Check status"
echo "  $DIR/logs.sh    - View logs"
echo "  $DIR/restart.sh - Restart"
echo ""
ok "Done! Open https://$DOMAIN"
