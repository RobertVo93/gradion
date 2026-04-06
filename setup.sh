#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Building and starting services..."
docker compose up -d --build db api web

echo "[2/4] Waiting for API to be healthy..."
for i in {1..60}; do
  if curl -fsS "http://localhost:8000/health" >/dev/null; then
    echo "API is ready."
    break
  fi

  if [[ "$i" -eq 60 ]]; then
    echo "API did not become ready in time."
    exit 1
  fi

  sleep 2
done

echo "[3/4] Seeding default users..."
docker compose exec -T api python -m app.scripts.seed_users

echo "[4/4] Done."
echo "Default users:"
echo "- admin@example.com / Admin123!"
echo "- user@example.com / User123!"
