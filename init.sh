#!/bin/bash

set -e

# echo "Starting Docker containers..."

# docker-compose up --build -d

echo "Waiting for PostgreSQL..."

until pg_isready -h postgres -p 5432 -U admin; do
  sleep 2
done

echo "PostgreSQL is ready."

echo "Waiting for backend to create tables..."

until psql -h postgres -U admin -d sahc -tAc \
  "SELECT 1 FROM information_schema.tables WHERE table_name='booking'" | grep -q 1; do
  sleep 2
done

echo "Tables detected."

echo "Running init.sql..."

psql -h postgres -U admin -d sahc -f /init2.sql

echo "Init script executed."