# KOVIN Meet

Enterprise multi-tenant video conferencing platform with self-hosted WebRTC, events, ticketing, and white-label support.

## Features

- **Multi-Tenant Architecture**: Full tenant isolation with white-label branding
- **Video Conferencing**: Self-hosted WebRTC via LiveKit with screen sharing, recording
- **Role-Based Access Control**: Granular permissions system (Superadmin, Admin, Moderator, Presenter, Attendee)
- **Events & Ticketing**: Event management with QR-code tickets and check-in
- **Calendar Integration**: Built-in calendar with meeting scheduling
- **Email System**: Template-based email campaigns
- **Analytics Dashboard**: Real-time metrics and reporting
- **Audit Logging**: Complete activity tracking

## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Video**: LiveKit (self-hosted)
- **Cache/Queue**: Redis
- **Storage**: MinIO (S3-compatible)
- **TURN Server**: Coturn
- **Reverse Proxy**: Nginx with SSL (Certbot)

## Quick Start (Self-Hosted Debian/Ubuntu)

### Prerequisites

- Fresh Debian 11/12 or Ubuntu 22.04+ server
- Domain name pointed to your server
- Root or sudo access
- Ports 80, 443, 7880, 7881, 3478, 5349 open

### One-Command Installation

```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/kovin-meet/main/install.sh | sudo bash
```

Or clone and run manually:

```bash
git clone https://github.com/your-repo/kovin-meet.git
cd kovin-meet
chmod +x install.sh
sudo ./install.sh
```

The installer will:
1. Install Docker and Docker Compose
2. Set up PostgreSQL with your database
3. Configure Redis for caching
4. Deploy MinIO for file storage
5. Install and configure LiveKit server
6. Set up Coturn TURN server for NAT traversal
7. Configure Nginx reverse proxy with SSL
8. Generate all required API keys and secrets
9. Start all services

### Post-Installation

After installation completes:

1. Access your platform at `https://your-domain.com`
2. Login with the superadmin credentials shown at the end of installation
3. Create your first tenant organization
4. Invite users and start hosting meetings

## Manual Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/kovin-meet.git
cd kovin-meet
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Run Migrations

```bash
docker-compose exec app pnpm db:push
docker-compose exec app pnpm db:seed
```

## Development

### Local Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Start development server
pnpm dev
```

### Database Management

```bash
# Push schema changes
pnpm db:push

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Open Prisma Studio
pnpm db:studio
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `NEXTAUTH_SECRET` | NextAuth.js secret | - |
| `NEXTAUTH_URL` | Application URL | - |
| `LIVEKIT_URL` | LiveKit server URL | - |
| `LIVEKIT_API_KEY` | LiveKit API key | - |
| `LIVEKIT_API_SECRET` | LiveKit API secret | - |
| `MINIO_ENDPOINT` | MinIO endpoint | - |
| `MINIO_ACCESS_KEY` | MinIO access key | - |
| `MINIO_SECRET_KEY` | MinIO secret key | - |
| `REDIS_URL` | Redis connection string | - |

### LiveKit Configuration

The LiveKit server is configured in `config/livekit.yaml`. Key settings:

- `port`: WebSocket port (default: 7880)
- `rtc.port_range_start/end`: UDP port range for media
- `turn.enabled`: Enable built-in TURN support

### Nginx Configuration

SSL certificates are managed by Certbot. The Nginx config is generated during installation.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (443/80)                       │
│                   SSL Termination                       │
└───────────────┬───────────────────┬─────────────────────┘
                │                   │
    ┌───────────▼───────┐   ┌───────▼───────┐
    │   Next.js App     │   │   LiveKit     │
    │   (Port 3000)     │   │  (Port 7880)  │
    └───────┬───────────┘   └───────────────┘
            │
    ┌───────▼───────────┐
    │    PostgreSQL     │
    │   (Port 5432)     │
    └───────────────────┘
            │
    ┌───────▼───────────┐   ┌───────────────┐
    │      Redis        │   │     MinIO     │
    │   (Port 6379)     │   │  (Port 9000)  │
    └───────────────────┘   └───────────────┘
            │
    ┌───────▼───────────┐
    │      Coturn       │
    │  (3478/5349 TCP)  │
    │  (UDP range)      │
    └───────────────────┘
```

## Backup & Restore

### Create Backup

```bash
./scripts/backup.sh
```

### Restore from Backup

```bash
./scripts/restore.sh /path/to/backup.tar.gz
```

## CI/CD

GitHub Actions workflow is included for automated deployments:

1. Push to `main` branch triggers deployment
2. Pre-deploy backup is created automatically
3. Docker images are built and pushed
4. Services are updated with zero-downtime

See `.github/workflows/deploy.yml` for configuration.

## Security

- All passwords are hashed with bcrypt
- Sessions use secure HTTP-only cookies
- CSRF protection enabled
- Rate limiting on authentication endpoints
- Row-level security for tenant isolation
- Audit logging for all sensitive operations

## License

Proprietary - All rights reserved

## Support

For support, contact: support@kovin.app
