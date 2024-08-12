#!/bin/bash
# set -eu

echo "Installing dependencies..."
poetry install --no-root
apk add --no-cache redis
cp .env.example .env
# Start Redis server
redis-server --daemonize yes
# Start FastAPI server
poetry run fastapi dev main.py --port 8080