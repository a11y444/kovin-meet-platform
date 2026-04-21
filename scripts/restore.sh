#!/bin/bash

# KOVIN Meet - Database Restore Script
# This script restores a PostgreSQL database from a backup file

set -euo pipefail

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

# Usage
usage() {
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Options:"
    echo "  backup_file.sql.gz  Path to the backup file to restore"
    echo ""
    echo "Environment variables:"
    echo "  DATABASE_URL        PostgreSQL connection URL (required)"
    echo ""
    echo "Examples:"
    echo "  $0 /var/backups/kovin/kovin_backup_20240115_120000.sql.gz"
    echo "  $0 kovin_backup_latest.sql.gz"
    exit 1
}

# Check arguments
if [ $# -lt 1 ]; then
    usage
fi

BACKUP_FILE="$1"

# Load environment variables
if [ -f /opt/kovin/.env ]; then
    source /opt/kovin/.env
fi

# Required environment variables
: "${DATABASE_URL:?DATABASE_URL is required}"

# Parse DATABASE_URL
parse_db_url() {
    local url="$1"
    url="${url#postgresql://}"
    
    local userpass="${url%%@*}"
    DB_USER="${userpass%%:*}"
    DB_PASS="${userpass#*:}"
    
    local hostportdb="${url#*@}"
    local hostport="${hostportdb%%/*}"
    DB_HOST="${hostport%%:*}"
    DB_PORT="${hostport#*:}"
    DB_NAME="${hostportdb#*/}"
}

parse_db_url "$DATABASE_URL"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    # Try to download from MinIO
    if [ -n "${MINIO_ENDPOINT:-}" ]; then
        BACKUP_FILENAME=$(basename "$BACKUP_FILE")
        log_info "Backup file not found locally, attempting to download from MinIO..."
        
        mc alias set kovin "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" --api S3v4 2>/dev/null || true
        mc cp "kovin/kovin-backups/$BACKUP_FILENAME" "/tmp/$BACKUP_FILENAME"
        
        if [ $? -eq 0 ]; then
            BACKUP_FILE="/tmp/$BACKUP_FILENAME"
            log_info "Downloaded backup from MinIO"
        else
            log_error "Backup file not found: $BACKUP_FILE"
            exit 1
        fi
    else
        log_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

log_warn "==================================="
log_warn "WARNING: This will OVERWRITE the database!"
log_warn "Database: $DB_NAME"
log_warn "Host: $DB_HOST"
log_warn "Backup file: $BACKUP_FILE"
log_warn "==================================="
echo ""

read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log_info "Restore cancelled."
    exit 0
fi

log_info "Starting database restore..."

# Stop the application if running
if command -v docker &> /dev/null; then
    log_info "Stopping application containers..."
    docker-compose -f /opt/kovin/docker-compose.yml stop app 2>/dev/null || true
fi

# Restore the database
log_info "Restoring database from backup..."

gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASS" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --quiet

if [ $? -eq 0 ]; then
    log_info "Database restored successfully!"
else
    log_error "Database restore failed!"
    exit 1
fi

# Restart the application
if command -v docker &> /dev/null; then
    log_info "Starting application containers..."
    docker-compose -f /opt/kovin/docker-compose.yml start app 2>/dev/null || true
fi

log_info "Restore process completed!"
