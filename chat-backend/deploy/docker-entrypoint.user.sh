#!/bin/sh
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${YELLOW}🚀 Starting User Service...${NC}"

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
  check_env "JWT_REFRESH_SECRET"
  check_env "USER_DB_URL"
  check_env "DB_SSL"
fi

# Run database migrations if RUN_MIGRATION is true
if [ "$RUN_MIGRATION" = "true" ]; then
  echo "${YELLOW}Running database migrations...${NC}"
  
  # Skip connectivity checks for cloud database (Render PostgreSQL is always available)
  if echo "$USER_DB_URL" | grep -q "render.com"; then
    echo "${GREEN}✓ Using Render PostgreSQL (cloud service - skip connectivity check)${NC}"
  elif [ ! -z "$USER_DB_URL" ]; then
    echo "${YELLOW}Using local PostgreSQL - performing connectivity check...${NC}"
    # Only check local PostgreSQL
    DB_HOST=$(echo "$USER_DB_URL" | grep -oP 'postgresql://[^:]+:[^@]+@\K[^/:]+' || echo "localhost")
    DB_PORT=$(echo "$USER_DB_URL" | grep -oP ':[0-9]+/' | sed 's/[:/]//g' || echo "5432")
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
      if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
        echo "${GREEN}✓ PostgreSQL is ready${NC}"
        break
      fi
      
      attempt=$((attempt + 1))
      echo "Waiting for PostgreSQL ($attempt/$max_attempts)..."
      sleep 1
    done
    
    if [ $attempt -eq $max_attempts ]; then
      echo "${RED}❌ PostgreSQL connection timeout${NC}"
      exit 1
    fi
  fi
  
  # Run migrations
  echo "${YELLOW}Executing migrations...${NC}"
  if npm run typeorm:user-service migration:run; then
    echo "${GREEN}✓ Migrations completed successfully${NC}"
  else
    echo "${RED}❌ Migration failed${NC}"
    exit 1
  fi
fi

# Start the application
echo "${GREEN}✓ All checks passed, starting application...${NC}"
echo "${YELLOW}📚 API Docs available at: http://localhost:3001/api/docs${NC}"
echo "${YELLOW}💻 Health check endpoint: http://localhost:3001/health${NC}"

exec node dist/apps/user-service/main.js
