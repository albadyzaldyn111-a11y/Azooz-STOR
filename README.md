# AZOOZ STORE

<p align="center">
  <img src="https://via.placeholder.com/120x120/3b82f6/ffffff?text=A" alt="AZOOZ STORE Logo" width="120" />
</p>

<p align="center">
  <strong>A Production-Grade Digital Application Store</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#security">Security</a> •
  <a href="#getting-started">Getting Started</a>
</p>

---

## Overview

AZOOZ STORE is a modern, secure, and scalable web platform for discovering, downloading, and managing digital applications. Built with enterprise-grade architecture and cutting-edge security practices.

## Features

### Core Features
- **App Discovery**: Browse and search applications with smart filtering
- **App Details**: Rich detail pages with screenshots, changelogs, and reviews
- **Download System**: Secure download tracking and analytics
- **Favorites**: Save apps to your personal collection
- **Reviews & Ratings**: User-driven review system with moderation
- **Categories & Tags**: Organized content discovery
- **Search Engine**: Full-text search with relevance ranking

### User Features
- **Authentication**: OAuth 2.0 with JWT sessions
- **User Dashboard**: Personal stats and quick actions
- **Download History**: Track all your downloads
- **Notifications**: In-app notification system

### Admin Features
- **Admin Dashboard**: Statistics and overview
- **User Management**: Role-based access control
- **App Management**: CRUD operations for applications
- **Review Moderation**: Approve/reject user reviews
- **Audit Logs**: Complete admin action logging

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations (ready)
- **React Router v7** - Client-side routing

### Backend
- **Hono** - Web framework
- **tRPC 11.x** - End-to-end type-safe APIs
- **Drizzle ORM** - Type-safe SQL
- **MySQL** - Relational database
- **Zod** - Schema validation

### Security
- OAuth 2.0 Authentication
- JWT Sessions with HttpOnly Cookies
- Rate Limiting (100 req/min per IP)
- CSRF Protection via SameSite Cookies
- XSS Protection (CSP + Sanitization)
- SQL Injection Prevention (ORM parameterized queries)
- Secure Headers (Helmet-like)
- Input Sanitization
- RBAC (Role-Based Access Control)

## Architecture

```
AZOOZ STORE
├── Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── providers/      # Context providers
│   │   └── App.tsx         # Root component
│   └── index.html
│
├── Backend (Hono + tRPC)
│   ├── api/
│   │   ├── app-router.ts   # App CRUD + search
│   │   ├── content-router.ts # Categories, tags, reviews
│   │   ├── user-router.ts  # Favorites, notifications, admin
│   │   ├── auth-router.ts  # Authentication
│   │   ├── middleware.ts   # tRPC procedures
│   │   ├── boot.ts         # Server entry + security
│   │   └── context.ts      # Request context
│   └── db/
│       ├── schema.ts       # Database schema
│       └── seed.ts         # Seed data
│
└── Contracts
    └── types.ts            # Shared types
```

## Database Schema

### Tables
- **users** - User accounts with OAuth
- **apps** - Application listings
- **categories** - App categories
- **tags** - App tags
- **app_tags** - Many-to-many junction
- **downloads** - Download tracking
- **reviews** - User reviews
- **favorites** - User favorites
- **notifications** - In-app notifications
- **admin_logs** - Audit trail

### Features
- Proper indexes for performance
- Foreign key constraints
- Cascade deletes where appropriate
- Enum types for status/role fields

## Security

### Implemented Measures
1. **SQL Injection Prevention**: Drizzle ORM with parameterized queries
2. **XSS Protection**:
   - Content Security Policy (CSP)
   - Input sanitization on all user inputs
   - X-XSS-Protection header
3. **CSRF Protection**:
   - SameSite cookies
   - OAuth 2.0 secure flow
4. **Rate Limiting**: 100 requests/minute per IP
5. **Brute Force Protection**: Built into OAuth flow
6. **Authentication Security**:
   - HttpOnly cookies
   - JWT session management
   - Role-based access control
7. **API Security**:
   - Zod validation on all inputs
   - tRPC type safety
   - Admin middleware protection
8. **Secure Headers**:
   - X-Content-Type-Options
   - X-Frame-Options
   - Strict-Transport-Security
   - Referrer-Policy

## Getting Started

### Prerequisites
- Node.js 20+
- MySQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd azooz-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   The `.env` file is pre-configured with:
   - Database connection
   - OAuth credentials
   - Session secrets

4. **Database Setup**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npx tsx db/seed.ts
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## API Structure

### tRPC Routers
| Router | Description | Auth Required |
|--------|-------------|---------------|
| `auth` | Authentication | - |
| `app` | Apps CRUD + search | Admin for mutations |
| `category` | Categories | Admin for create |
| `tag` | Tags | Admin for create |
| `review` | Reviews | Yes for create |
| `favorite` | Favorites | Yes |
| `notification` | Notifications | Yes |
| `admin` | Admin operations | Admin only |

## Project Structure

```
.
├── api/                    # Backend API
│   ├── app-router.ts
│   ├── auth-router.ts
│   ├── content-router.ts
│   ├── user-router.ts
│   ├── boot.ts            # Server + security middleware
│   ├── context.ts
│   ├── middleware.ts       # tRPC procedures
│   └── queries/
├── db/
│   ├── schema.ts           # Database schema
│   ├── relations.ts        # Drizzle relations
│   └── seed.ts            # Seed data
├── src/
│   ├── components/         # UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── AppCard.tsx
│   ├── pages/              # Route pages
│   │   ├── Home.tsx
│   │   ├── Apps.tsx
│   │   ├── AppDetails.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Favorites.tsx
│   │   ├── Admin.tsx
│   │   └── Login.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── providers/
│   │   └── trpc.tsx
│   └── App.tsx
├── contracts/              # Shared types
├── public/                 # Static assets
└── README.md
```

## Performance Optimizations

- Lazy loading ready (React.lazy)
- Image optimization with lazy loading
- Code splitting with Vite
- Database indexes on frequently queried columns
- Pagination on all list endpoints
- Skeleton loading states

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run check` | Type-check TypeScript |
| `npm run db:push` | Sync DB schema |
| `npm run db:generate` | Generate migration |
| `npm run db:migrate` | Apply migrations |

## License

MIT License - Built with passion by AZOOZ Team.
