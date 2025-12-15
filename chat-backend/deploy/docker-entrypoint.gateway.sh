#!/bin/sh
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${YELLOW}🚀 Starting API Gateway...${NC}"

# Check required environment variables
check_env() {
  local var=$1
  local value=$(eval echo \$$var)
  if [ -z "$value" ]; then
    echo "${RED}❌ Error: Required environment variable $var is not set${NC}"
    exit 1
  fi
  echo "${GREEN}✓ $var is set${NC}"
}

# Only check in production
if [ "$NODE_ENV" = "production" ]; then
  echo "${YELLOW}Checking required environment variables for production...${NC}"
  check_env "ALLOWED_ORIGINS"
fi

# Set default service URLs if not provided
export USER_SERVICE_URL=${USER_SERVICE_URL:-http://user-service:3001}
export CHAT_SERVICE_URL=${CHAT_SERVICE_URL:-http://chat-service:3002}
export NOTIFICATION_SERVICE_URL=${NOTIFICATION_SERVICE_URL:-http://notification-service:3003}

echo "${GREEN}✓ Service URLs configured:${NC}"
echo "  - User Service: $USER_SERVICE_URL"
echo "  - Chat Service: $CHAT_SERVICE_URL"
echo "  - Notification Service: $NOTIFICATION_SERVICE_URL"

# Wait for services to be ready (simple TCP check)
wait_for_service() {
  local service=$1
  local host=$2
  local port=$3
  local max_attempts=30
  local attempt=0

  echo "${YELLOW}Waiting for $service ($host:$port)...${NC}"

  while [ $attempt -lt $max_attempts ]; do
    if nc -z "$host" "$port" 2>/dev/null; then
      echo "${GREEN}✓ $service is ready${NC}"
      return 0
    fi

    attempt=$((attempt + 1))
    echo "Waiting for $service ($attempt/$max_attempts)..."
    sleep 1
  done

  echo "${RED}❌ $service connection timeout${NC}"
  return 1
}

# Only wait for services if in docker/k8s (not localhost)
if [ "$NODE_ENV" = "production" ] || [ "$DOCKER_ENV" = "true" ]; then
  echo "${YELLOW}Checking service connectivity...${NC}"
  wait_for_service "User Service" "user-service" "3001" || true
  wait_for_service "Chat Service" "chat-service" "3002" || true
  wait_for_service "Notification Service" "notification-service" "3003" || true
fi

# Start the application
echo "${GREEN}✓ All checks passed, starting application...${NC}"
echo "${YELLOW}🌐 Gateway running on port 3000${NC}"
echo "${YELLOW}📍 Health check endpoint: http://localhost:3000/health${NC}"
echo "${YELLOW}📊 Metrics endpoint: http://localhost:3000/metrics${NC}"

exec node dist/apps/api-gateway/main.js
