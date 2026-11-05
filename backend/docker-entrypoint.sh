#!/bin/sh
set -e

echo "Starting MOA SMS Notification Backend..."

# Wait for PostgreSQL to be ready and push Drizzle schema
echo "Pushing database schema..."
tries=0
until npx drizzle-kit push; do
  tries=$((tries + 1))
  if [ "$tries" -ge 30 ]; then
    echo "Could not connect to database after 60s" >&2
    exit 1
  fi
  echo "Waiting for database ($tries/30)..."
  sleep 2
done
echo "Database schema up-to-date."

# Seed initial users & settings if needed
echo "Running seed script..."
npx tsx src/seed/seed.ts || true

exec "$@"

