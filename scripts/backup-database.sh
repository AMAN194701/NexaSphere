#!/bin/bash
# scripts/backup-database.sh
# Dumps, compresses, and encrypts a PostgreSQL database.

set -e

# Ensure required environment variables are set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set." >&2
  exit 1
fi

if [ -z "$ENCRYPTION_KEY" ]; then
  echo "Error: ENCRYPTION_KEY is not set." >&2
  exit 1
fi

# Ensure required tools are installed
command -v pg_dump >/dev/null 2>&1 || { echo "Error: pg_dump is required but not installed." >&2; exit 1; }
command -v gzip >/dev/null 2>&1 || { echo "Error: gzip is required but not installed." >&2; exit 1; }
command -v openssl >/dev/null 2>&1 || { echo "Error: openssl is required but not installed." >&2; exit 1; }

# Generate timestamp
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
BACKUP_DIR="/tmp/nexasphere-backups"
mkdir -p "$BACKUP_DIR"

RAW_BACKUP="$BACKUP_DIR/backup-$TIMESTAMP.sql"
GZ_BACKUP="${RAW_BACKUP}.gz"
ENC_BACKUP="${GZ_BACKUP}.enc"

echo "Starting database backup..." >&2

# Run pg_dump
# We use --clean to add DROP commands, ensuring an clean restore.
pg_dump --clean --no-owner --no-privileges -d "$DATABASE_URL" -f "$RAW_BACKUP"
if [ $? -ne 0 ]; then
  echo "Error: pg_dump failed." >&2
  exit 1
fi

echo "Compressing backup..." >&2
gzip -f "$RAW_BACKUP"

echo "Encrypting backup..." >&2
# Encrypt using AES-256-CBC and pbkdf2
openssl enc -aes-256-cbc -salt -pbkdf2 -in "$GZ_BACKUP" -out "$ENC_BACKUP" -k "$ENCRYPTION_KEY"
if [ $? -ne 0 ]; then
  echo "Error: Encryption failed." >&2
  exit 1
fi

# Clean up unencrypted compressed file
rm "$GZ_BACKUP"

echo "Backup completed successfully." >&2
# Output the final file path to stdout for the calling Node.js script to capture
echo "$ENC_BACKUP"
