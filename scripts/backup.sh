#!/bin/bash

# KOVIN Meet - Database Backup Script
# This script creates a full backup of the PostgreSQL database and uploads to MinIO

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/kovin}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="kovin_backup_${TIMESTAMP}.sql.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Load environment variables
if [ -f /opt/kovin/.env ]; then
    source /opt/kovin/.env
fi

# Required environment variables
: "${DATABASE_URL:?DATABASE_URL is required}"

# Parse DATABASE_URL
# Format: postgresql://user:password@host:port/database
parse_db_url() {
    local url="$1"
    # Remove postgresql:// prefix
    url="${url#postgresql://}"
    
    # Extract user:password
    local userpass="${url%%@*}"
    DB_USER="${userpass%%:*}"
    DB_PASS="${userpass#*:}"
    
    # Extract host:port/database
    local hostportdb="${url#*@}"
    local hostport="${hostportdb%%/*}"
    DB_HOST="${hostport%%:*}"
    DB_PORT="${hostport#*:}"
    DB_NAME="${hostportdb#*/}"
}

parse_db_url "$DATABASE_URL"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log_info "Starting database backup..."
log_info "Database: $DB_NAME"
log_info "Host: $DB_HOST"
log_info "Backup file: $BACKUP_FILE"

# Create backup
PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    | gzip > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log_info "Backup completed successfully!"
    log_info "Backup size: $BACKUP_SIZE"
else
    log_error "Backup failed!"
    exit 1
fi

# Upload to MinIO if configured
if [ -n "${MINIO_ENDPOINT:-}" ] && [ -n "${MINIO_ACCESS_KEY:-}" ] && [ -n "${MINIO_SECRET_KEY:-}" ]; then
    log_info "Uploading backup to MinIO..."
    
    # Configure MinIO client
    mc alias set kovin "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" --api S3v4 2>/dev/null || true
    
    # Create bucket if it doesn't exist
    mc mb --ignore-existing kovin/kovin-backups 2>/dev/null || true
    
    # Upload backup
    mc cp "$BACKUP_DIR/$BACKUP_FILE" "kovin/kovin-backups/$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        log_info "Backup uploaded to MinIO successfully!"
    else
        log_warn "Failed to upload backup to MinIO"
    fi
fi

# Clean up old backups
log_info "Cleaning up backups older than $RETENTION_DAYS days..."

# Local cleanup
find "$BACKUP_DIR" -name "kovin_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# MinIO cleanup
if [ -n "${MINIO_ENDPOINT:-}" ]; then
    mc rm --force --older-than "${RETENTION_DAYS}d" "kovin/kovin-backups/" 2>/dev/null || true
fi

log_info "Backup process completed!"

# Output backup info for logging/monitoring
echo "BACKUP_STATUS=success"
echo "BACKUP_FILE=$BACKUP_FILE"
echo "BACKUP_SIZE=$BACKUP_SIZE"
echo "BACKUP_TIMESTAMP=$TIMESTAMP"
