#!/bin/sh
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${YELLOW}🚀 Starting Notification Service...${NC}"

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
  check_env "JWT_ACCESS_SECRET"
  check_env "NOTIFICATION_DB_URL"
  check_env "RABBITMQ_URL"
  check_env "USER_SERVICE_HOST"
fi

# Set default User Service if not provided
export USER_SERVICE_HOST=${USER_SERVICE_HOST:-user-service}
export USER_SERVICE_PORT=${USER_SERVICE_PORT:-3001}

echo "${GREEN}✓ User Service configured: http://$USER_SERVICE_HOST:$USER_SERVICE_PORT${NC}"

# Skip connectivity checks for cloud services (MongoDB Atlas is always available)
if echo "$NOTIFICATION_DB_URL" | grep -q "mongodb+srv://"; then
  echo "${GREEN}✓ Using MongoDB Atlas (cloud service - skip connectivity check)${NC}"
elif [ ! -z "$NOTIFICATION_DB_URL" ]; then
  echo "${YELLOW}Using local MongoDB - performing connectivity check...${NC}"
  # Only check local MongoDB
  DB_HOST=$(echo "$NOTIFICATION_DB_URL" | grep -oP 'mongodb://[^/]*@\K[^/:]+|mongodb://\K[^/:]+' | head -1)
  DB_PORT=$(echo "$NOTIFICATION_DB_URL" | grep -oP ':[0-9]+(?=/)' | sed 's/://' || echo "27017")
  
  if [ -z "$DB_HOST" ]; then
    DB_HOST="localhost"
  fi
  
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if mongosh --host "$DB_HOST:$DB_PORT" --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
      echo "${GREEN}✓ MongoDB is ready${NC}"
      break
    fi
    
    attempt=$((attempt + 1))
    echo "Waiting for MongoDB ($attempt/$max_attempts)..."
    sleep 1
  done
  
  if [ $attempt -eq $max_attempts ]; then
    echo "${RED}❌ MongoDB connection timeout${NC}"
    exit 1
  fi
fi

# Skip connectivity checks for cloud services (CloudAMQP is always available)
if echo "$RABBITMQ_URL" | grep -q "amqps://"; then
  echo "${GREEN}✓ Using CloudAMQP (cloud service - skip connectivity check)${NC}"
elif [ ! -z "$RABBITMQ_URL" ]; then
  echo "${YELLOW}Using local RabbitMQ - performing connectivity check...${NC}"
  # Only check local RabbitMQ
  RMQ_HOST=$(echo "$RABBITMQ_URL" | grep -oP 'amqp://[^@]*@\K[^/:]+|amqp://\K[^/:]+')
  RMQ_PORT=$(echo "$RABBITMQ_URL" | grep -oP ':[0-9]+(?=(/|$))' | sed 's/://' || echo "5672")
  
  if [ -z "$RMQ_HOST" ]; then
    RMQ_HOST="localhost"
  fi
  
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if nc -z "$RMQ_HOST" "$RMQ_PORT" 2>/dev/null; then
      echo "${GREEN}✓ RabbitMQ is ready${NC}"
      break
    fi
    
    attempt=$((attempt + 1))
    echo "Waiting for RabbitMQ ($attempt/$max_attempts)..."
    sleep 1
  done
  
  if [ $attempt -eq $max_attempts ]; then
    echo "${RED}❌ RabbitMQ connection timeout${NC}"
    exit 1
  fi
fi
if [ ! -z "$USER_SERVICE_HOST" ]; then
  echo "${YELLOW}Waiting for User Service to be ready...${NC}"
  
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if nc -z "$USER_SERVICE_HOST" "$USER_SERVICE_PORT" 2>/dev/null; then
      echo "${GREEN}✓ User Service is ready${NC}"
      break
    fi
    
    attempt=$((attempt + 1))
    echo "Waiting for User Service ($attempt/$max_attempts)..."
    sleep 1
  done
  
  if [ $attempt -eq $max_attempts ]; then
    echo "${RED}⚠️  User Service not responding (may retry later)${NC}"
  fi
fi

# Start the application
echo "${GREEN}✓ All checks passed, starting application...${NC}"
echo "${YELLOW}📚 API Docs available at: http://localhost:3003/api/docs${NC}"
echo "${YELLOW}🔔 WebSocket namespace: ws://localhost:3003/notifications${NC}"
echo "${YELLOW}📨 RabbitMQ listener active on queue: notification_queue${NC}"

exec node dist/apps/notification-service/main.js
