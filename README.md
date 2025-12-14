# 💬 Chat Realtime - Microservices Application

Ứng dụng chat thời gian thực với kiến trúc microservices, xây dựng bằng **NestJS**, **React**, **WebSocket (Socket.IO)**, **MongoDB**, **PostgreSQL**, và **RabbitMQ**.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black)](https://socket.io/)

---

## 📋 Mục lục

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

**Chat Realtime** là hệ thống chat real-time đầy đủ với kiến trúc microservices, hỗ trợ:

- ✅ **Real-time Messaging** - Chat 1-1 và group chat với WebSocket
- ✅ **Microservices Architecture** - 4 services độc lập, dễ scale
- ✅ **Hybrid API** - REST API + WebSocket cho hiệu suất tối ưu
- ✅ **JWT Authentication** - Bảo mật với access token + refresh token rotation
- ✅ **Event-Driven** - RabbitMQ cho async communication giữa services
- ✅ **Multi-Database** - PostgreSQL cho users, MongoDB cho messages/notifications
- ✅ **Production Ready** - Deploy lên AWS với ECS Fargate + CloudFront

---

## ✨ Features

### 💬 Chat Features
- [x] Direct messaging (1-1 chat)
- [x] Group chat với admin controls
- [x] Message requests (pending conversations)
- [x] Real-time message delivery
- [x] Read receipts (seen_by tracking)
- [x] Typing indicators
- [x] Message edit & delete
- [x] Conversation search & filtering

### 🔔 Notification Features
- [x] Real-time notifications qua WebSocket
- [x] Unread count badge
- [x] Notification history
- [x] Mark as read/unread
- [x] RabbitMQ event-driven notifications

### 👤 User Features
- [x] User registration & login
- [x] JWT authentication với refresh token
- [x] User profile management
- [x] User search & discovery
- [x] Role-based access control (RBAC)
- [x] Online/offline status

### 🔒 Security
- [x] JWT access token (15 phút)
- [x] Refresh token rotation (7 ngày)
- [x] HttpOnly cookies
- [x] CORS protection
- [x] Rate limiting
- [x] Password hashing (bcrypt)

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│         CLIENT (Browser/Mobile)                         │
│         Frontend: React + Socket.IO                     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/WSS
                     ↓
┌─────────────────────────────────────────────────────────┐
│              AWS CloudFront (CDN)                        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ↓                         ↓
┌──────────────┐          ┌──────────────────────┐
│   S3 Bucket  │          │  API Gateway :3000   │
│  (Frontend)  │          │  (AWS ECS Fargate)   │
└──────────────┘          │  ├─ JWT Guard        │
                          │  ├─ Rate Limiter     │
                          │  ├─ Reverse Proxy    │
                          │  └─ WebSocket Proxy  │
                          └────┬─────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ↓                   ↓                   ↓
    ┌──────────┐        ┌──────────┐       ┌──────────┐
    │   User   │        │   Chat   │       │  Notif   │
    │ Service  │        │ Service  │       │ Service  │
    │  :3001   │        │  :3002   │       │  :3003   │
    │(Fargate) │        │(Fargate) │       │(Fargate) │
    └────┬─────┘        └────┬─────┘       └────┬─────┘
         │                   │                   │
         ↓                   ↓                   ↓
    ┌─────────┐         ┌─────────┐        ┌─────────┐
    │   RDS   │         │ MongoDB │        │ MongoDB │
    │Postgres │         │  Atlas  │        │  Atlas  │
    │(users)  │         │ (chat)  │        │ (notif) │
    └─────────┘         └─────────┘        └─────────┘
                             │
                             └─────┬──────────────┐
                                   ↓              │
                             ┌──────────┐         │
                             │ RabbitMQ │◄────────┘
                             │CloudAMQP │
                             └──────────┘
```

### Services

| Service | Port | Purpose | Database | Tech |
|---------|------|---------|----------|------|
| **API Gateway** | 3000 | Entry point, auth, routing | - | NestJS + JWT |
| **User Service** | 3001 | Authentication, user management | PostgreSQL | NestJS + TypeORM |
| **Chat Service** | 3002 | Messaging, conversations | MongoDB | NestJS + Mongoose + Socket.IO |
| **Notification Service** | 3003 | Notifications, RabbitMQ consumer | MongoDB | NestJS + RabbitMQ |

### Data Flow

**1. User sends message:**
```
Frontend → WebSocket → Chat Service → Save to MongoDB
                                   ↓
                              Publish to RabbitMQ
                                   ↓
                        Notification Service subscribes
                                   ↓
                        Create notification in MongoDB
                                   ↓
                        Broadcast via WebSocket
```

**2. User login:**
```
Frontend → REST POST /auth/login → User Service
                                 ↓
                        Validate credentials (bcrypt)
                                 ↓
                        Generate JWT tokens
                                 ↓
                        Set HttpOnly cookies
                                 ↓
                        Return user data
```

---

## 🔧 Tech Stack

### Frontend
- **Framework**: React 19.2 + TypeScript 5.7
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **State Management**: Zustand 5.0
- **HTTP Client**: Axios 1.13
- **WebSocket**: Socket.IO Client 4.8
- **Routing**: React Router 7.9
- **Icons**: Lucide React 0.554

### Backend
- **Framework**: NestJS 11.0
- **Language**: TypeScript 5.7
- **WebSocket**: Socket.IO 4.8
- **Authentication**: JWT + Passport
- **Databases**: 
  - PostgreSQL (via TypeORM 0.3)
  - MongoDB (via Mongoose 8.8)
- **Message Broker**: RabbitMQ (amqplib)
- **API Docs**: Swagger (OpenAPI 3.0)
- **Validation**: class-validator + class-transformer
- **Security**: bcrypt 6.0, cookie-parser

### Infrastructure
- **Container**: Docker + AWS ECS Fargate
- **CDN**: AWS CloudFront
- **Storage**: AWS S3
- **Databases**: 
  - AWS RDS PostgreSQL
  - MongoDB Atlas
- **Message Broker**: CloudAMQP (RabbitMQ)
- **CI/CD**: GitHub Actions (planned)

---

## 📁 Project Structure

```
chat-realtime-microservices/
├── chat-backend/              # Backend monorepo (NestJS)
│   ├── apps/
│   │   ├── api-gateway/       # Port 3000 - Entry point
│   │   │   ├── src/
│   │   │   │   ├── main.ts
│   │   │   │   ├── jwt.guard.ts
│   │   │   │   ├── reverse-proxy.middleware.ts
│   │   │   │   └── websocket-adapter.ts
│   │   │   └── tsconfig.app.json
│   │   ├── user-service/      # Port 3001 - Auth & Users
│   │   │   ├── src/
│   │   │   │   ├── auth/
│   │   │   │   ├── user/
│   │   │   │   ├── role/
│   │   │   │   └── token/
│   │   │   └── migrations/
│   │   ├── chat-service/      # Port 3002 - Messages
│   │   │   ├── src/
│   │   │   │   ├── chat/
│   │   │   │   │   ├── chat.gateway.ts    # WebSocket
│   │   │   │   │   ├── chat.service.ts
│   │   │   │   │   └── chat.controller.ts # REST
│   │   │   │   └── schemas/
│   │   │   └── tsconfig.app.json
│   │   └── notification-service/  # Port 3003 - Notifications
│   │       ├── src/
│   │       │   ├── notification/
│   │       │   │   ├── notification.gateway.ts
│   │       │   │   └── notification.service.ts
│   │       │   └── schemas/
│   │       └── tsconfig.app.json
│   ├── libs/
│   │   ├── common/            # Shared code
│   │   │   ├── filters/       # Exception filters
│   │   │   ├── interceptors/  # Logging, metrics
│   │   │   ├── guards/        # JWT, roles
│   │   │   └── services/
│   │   └── contracts/         # DTOs & interfaces
│   │       ├── auth/
│   │       ├── user/
│   │       └── chat/
│   ├── deploy/
│   │   ├── Dockerfile.api-gateway
│   │   ├── Dockerfile.user-service
│   │   ├── Dockerfile.chat-service
│   │   ├── Dockerfile.notification-service
│   │   └── docker-compose.yml
│   ├── package.json
│   ├── nest-cli.json
│   └── .env
├── frontend/                  # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── chat/          # ChatBox, Messages
│   │   │   ├── layout/        # Header, Sidebar
│   │   │   └── ui/            # shadcn components
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── UsersPage.tsx
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── chatService.ts
│   │   │   └── notificationService.ts
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── chatStore.ts
│   │   │   └── notificationStore.ts
│   │   ├── lib/
│   │   │   ├── axios.ts       # HTTP client config
│   │   │   └── socket.ts      # Socket.IO setup
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── PROJECT_PLAN.md            # Sprint planning
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.x
- **npm** or **yarn**
- **Docker** (optional, for local databases)
- **Git**

### Installation

```bash
# Clone repository
git clone https://github.com/vntam/-chat-realtime-microservices.git
cd -chat-realtime-microservices

# Install backend dependencies
cd chat-backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

#### Backend (.env)

```bash
cd chat-backend
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
# Node
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET=your-super-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# PostgreSQL (User Service)
USER_DB_URL=postgresql://user:password@localhost:5432/user_db

# MongoDB (Chat & Notification Services)
CHAT_DB_URL=mongodb://localhost:27017/chat_db
NOTIFICATION_DB_URL=mongodb://localhost:27017/notification_db

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Service URLs (internal)
USER_SERVICE_URL=http://localhost:3001
CHAT_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003
```

#### Frontend (.env)

```bash
cd frontend
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
# API Gateway URL (all requests go through here)
VITE_API_GATEWAY_URL=http://localhost:3000

# Service URLs (for direct connection if needed)
VITE_USER_SERVICE_URL=http://localhost:3001
VITE_CHAT_SERVICE_URL=http://localhost:3002
VITE_NOTIFICATION_SERVICE_URL=http://localhost:3003
```

### Start Databases (Docker)

```bash
# Start PostgreSQL + MongoDB + RabbitMQ
cd chat-backend/deploy
docker-compose up -d

# Verify
docker ps
```

### Run Backend Services

```bash
cd chat-backend

# Terminal 1 - API Gateway
npm run start:dev api-gateway

# Terminal 2 - User Service
npm run start:dev user-service

# Terminal 3 - Chat Service
npm run start:dev chat-service

# Terminal 4 - Notification Service
npm run start:dev notification-service
```

### Run Frontend

```bash
cd frontend
npm run dev
```

### Verify Setup

```bash
# Check health endpoints
curl http://localhost:3000/health     # API Gateway
curl http://localhost:3001/health     # User Service
curl http://localhost:3002/health     # Chat Service
curl http://localhost:3003/health     # Notification Service

# View API documentation
open http://localhost:3001/api/docs   # User Service Swagger
open http://localhost:3002/ws-docs    # Chat WebSocket docs

# Access frontend
open http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Service | Description | Example |
|----------|---------|-------------|---------|
| `NODE_ENV` | All | Environment mode | `development` / `production` |
| `JWT_ACCESS_SECRET` | All | Access token secret | `your-secret-key` |
| `JWT_REFRESH_SECRET` | User | Refresh token secret | `your-refresh-secret` |
| `USER_DB_URL` | User | PostgreSQL connection | `postgresql://...` |
| `CHAT_DB_URL` | Chat | MongoDB connection | `mongodb://...` |
| `NOTIFICATION_DB_URL` | Notification | MongoDB connection | `mongodb://...` |
| `RABBITMQ_URL` | Chat, Notification | RabbitMQ connection | `amqp://...` |
| `ALLOWED_ORIGINS` | API Gateway | CORS origins | `http://localhost:5173` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_GATEWAY_URL` | API Gateway endpoint | `http://localhost:3000` |
| `VITE_USER_SERVICE_URL` | User service (fallback) | `http://localhost:3001` |
| `VITE_CHAT_SERVICE_URL` | Chat service (WebSocket) | `http://localhost:3002` |
| `VITE_NOTIFICATION_SERVICE_URL` | Notification service | `http://localhost:3003` |

---

## 📡 API Documentation

### REST API Endpoints

#### Authentication (`/auth`)
```http
POST   /auth/register          # Register new user
POST   /auth/login             # Login
POST   /auth/refresh           # Refresh access token
POST   /auth/logout            # Logout
```

#### Users (`/user`)
```http
GET    /user                   # Get all users (admin)
GET    /user/:id               # Get user by ID
PUT    /user/:id               # Update user
DELETE /user/:id               # Delete user
GET    /user/search?q=...      # Search users
```

#### Conversations (`/chat/conversations`)
```http
GET    /chat/conversations              # Get user's conversations
GET    /chat/conversations/:id          # Get conversation detail
POST   /chat/conversations              # Create conversation
DELETE /chat/conversations/:id          # Delete conversation
GET    /chat/conversations/:id/messages # Get messages
POST   /chat/conversations/:id/members  # Add member
DELETE /chat/conversations/:id/members/:userId # Remove member
```

#### Notifications (`/notifications`)
```http
GET    /notifications                # Get all notifications
GET    /notifications/:id            # Get notification detail
POST   /notifications/:id/read       # Mark as read
DELETE /notifications/:id            # Delete notification
GET    /notifications/unread/count   # Get unread count
```

### WebSocket Events

#### Chat Service (`/chat` namespace)

**Client → Server:**
```typescript
// Join conversation room
socket.emit('conversation:join', { conversationId: string })

// Send message
socket.emit('message:send', {
  conversationId: string,
  content: string,
  attachments?: string[]
})

// Edit message
socket.emit('message:edit', {
  messageId: string,
  content: string
})

// Delete message
socket.emit('message:delete', { messageId: string })

// Mark as read
socket.emit('message:read', { messageId: string })

// Typing indicator
socket.emit('typing', {
  conversationId: string,
  isTyping: boolean
})
```

**Server → Client:**
```typescript
// New message
socket.on('message:created', (message: Message) => { ... })

// Message updated
socket.on('message:updated', (message: Message) => { ... })

// Message deleted
socket.on('message:deleted', ({ messageId: string }) => { ... })

// User typing
socket.on('typing', ({
  conversationId: string,
  userId: number,
  isTyping: boolean
}) => { ... })
```

#### Notification Service (`/notifications` namespace)

**Server → Client:**
```typescript
// New notification
socket.on('notification:created', (notification: Notification) => { ... })

// Unread count update
socket.on('notification:count', ({ count: number }) => { ... })
```

---

## 🚢 Deployment

### AWS ECS Fargate (Backend)

**Architecture:**
- API Gateway, User Service, Chat Service, Notification Service mỗi service là 1 ECS Task
- Auto-scaling dựa trên CPU/Memory
- Load Balancer (ALB) phân phối traffic
- Private subnets cho services, public subnets cho ALB

**Deployment Steps:**

```bash
# 1. Build Docker images
cd chat-backend/deploy
docker build -f Dockerfile.api-gateway -t chat-api-gateway:latest ..
docker build -f Dockerfile.user-service -t chat-user-service:latest ..
docker build -f Dockerfile.chat-service -t chat-chat-service:latest ..
docker build -f Dockerfile.notification-service -t chat-notification-service:latest ..

# 2. Tag và push lên ECR
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com

docker tag chat-api-gateway:latest <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/chat-api-gateway:latest
docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/chat-api-gateway:latest

# (Repeat cho các services khác)

# 3. Deploy via ECS CLI hoặc Console
# - Tạo ECS Cluster
# - Tạo Task Definitions
# - Tạo Services với desired count
# - Configure ALB target groups
```

**Environment Variables trên ECS:**
- Set qua Task Definition hoặc AWS Systems Manager Parameter Store
- Sử dụng Secrets Manager cho sensitive data (JWT secrets, DB passwords)

### AWS S3 + CloudFront (Frontend)

```bash
cd frontend

# 1. Build production
npm run build

# 2. Deploy to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

**CloudFront Configuration:**
- Origin: S3 bucket
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Compress Objects: Yes
- Cache Policy: CachingOptimized
- Custom error responses: 404 → /index.html (for SPA routing)

---

## 🛠️ Development

### Available Scripts

#### Backend

```bash
# Development (watch mode)
npm run start:dev <service-name>

# Build
npm run build

# Production
npm run start:prod

# Linting
npm run lint

# Testing
npm run test                # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov           # Coverage
```

#### Frontend

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

### Database Migrations

```bash
# User Service (TypeORM)
cd chat-backend

# Generate migration
npm run typeorm:user-service migration:generate -- -n MigrationName

# Run migrations
npm run typeorm:user-service migration:run

# Revert migration
npm run typeorm:user-service migration:revert
```

### Testing WebSocket Locally

```bash
# Install Socket.IO client CLI
npm install -g socket.io-client-cli

# Connect to Chat Service
socket-io-client http://localhost:3002/chat --auth '{"token":"YOUR_JWT_TOKEN"}'

# Send event
> emit message:send {"conversationId":"123","content":"Hello"}
```

---

## 🐛 Troubleshooting

### Backend Issues

**1. Service không start được:**
```bash
# Check port conflicts
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :3003

# Kill process if needed
kill -9 <PID>
```

**2. Database connection failed:**
```bash
# Verify database is running
docker ps | grep postgres
docker ps | grep mongo

# Check connection string trong .env
# Test connection
psql postgresql://user:password@localhost:5432/user_db
mongosh mongodb://localhost:27017/chat_db
```

**3. RabbitMQ connection error:**
```bash
# Check RabbitMQ container
docker ps | grep rabbitmq

# Access management UI
open http://localhost:15672
# Default credentials: guest / guest
```

**4. JWT token invalid:**
- Kiểm tra `JWT_ACCESS_SECRET` giống nhau ở tất cả services
- Token expired? Dùng refresh token endpoint
- Cookie not sent? Check `withCredentials: true` trong axios

### Frontend Issues

**1. CORS error:**
- Kiểm tra `ALLOWED_ORIGINS` trong backend `.env`
- Verify API Gateway CORS configuration
- Đảm bảo `withCredentials: true` trong axios config

**2. WebSocket không kết nối:**
```bash
# Check service running
curl http://localhost:3002/health

# Verify Socket.IO namespace
curl http://localhost:3002/socket.io/

# Check browser console for connection errors
```

**3. 401 Unauthorized:**
- Login lại để lấy token mới
- Check token trong sessionStorage/cookies
- Verify API endpoint đúng

**4. Cannot read properties of undefined:**
- Check API response structure
- Verify data transformation trong services
- Add null checks trong components

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `EADDRINUSE` | Port already in use | Kill process or change port |
| `ECONNREFUSED` | Service not running | Start the service |
| `401 Unauthorized` | Invalid/expired token | Login again |
| `CORS policy` | CORS not configured | Check ALLOWED_ORIGINS |
| `WebSocket failed` | Wrong URL or auth | Verify connection URL + token |

---

## 📚 Additional Resources

- **Project Planning**: [PROJECT_PLAN.md](./PROJECT_PLAN.md)
- **Backend Documentation**: [chat-backend/README.md](./chat-backend/README.md)
- **API Specifications**:
  - [OpenAPI/Swagger](http://localhost:3001/api/docs)
  - [WebSocket Docs](http://localhost:3002/ws-docs)
  - [AsyncAPI Spec](./chat-backend/asyncapi.yml)

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ by the team**
