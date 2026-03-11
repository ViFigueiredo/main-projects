---
title: "Database Setup - Neon PostgreSQL"
description: "Complete guide for setting up Neon Database for Portal S4A"
tags: ["database", "neon", "postgresql", "setup"]
---

# Database Setup - Neon PostgreSQL

## Overview

Portal S4A uses Neon Database (serverless PostgreSQL) for data persistence. This guide covers complete setup from scratch.

## Prerequisites

- Neon account (free tier available)
- Node.js environment
- Basic PostgreSQL knowledge

## Quick Setup

### 1. Create Neon Project

```bash
# Using Neon CLI (recommended)
npm install -g neonctl
neonctl auth
neonctl projects create portal-s4a
```

### 2. Get Connection String

```bash
# Get connection string for main branch
neonctl connection-string --project-id your-project-id
```

### 3. Configure Environment

```bash
# Add to .env.local
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### 4. Initialize Database

The database tables are automatically created via `src/instrumentation.ts` when the application starts.

## Branch Management

### Development Workflow

```bash
# Create development branch
neonctl branches create develop --project-id your-project-id

# Create feature branch
neonctl branches create feature-name --parent develop --project-id your-project-id

# Merge changes
neonctl branches restore target source --project-id your-project-id
```

### Environment Setup

- **Production**: `main` branch
- **Development**: `develop` branch  
- **Features**: Individual feature branches

## Database Schema

### Core Tables

- `users` - User authentication and roles
- `employees` - HR employee data
- `client_portfolio` - CRM client data
- `crm_statuses` - CRM pipeline statuses
- `crm_opportunities` - Sales opportunities
- `crm_orders` - Customer orders
- `occurrences` - HR occurrences

### Automatic Initialization

Tables are created automatically via `initializeDb()` function in `src/lib/db.ts`.

## Troubleshooting

### Connection Issues

```bash
# Test connection
neonctl connection-string --project-id your-project-id | psql

# Check project status
neonctl projects list
```

### Migration Issues

```bash
# Check table existence
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

# Manual migration
psql $DATABASE_URL -f src/lib/migrations/migration-file.sql
```

## Security

- Always use SSL connections (`sslmode=require`)
- Rotate credentials regularly
- Use environment variables for connection strings
- Never commit credentials to version control

## Performance

- Use connection pooling in production
- Monitor query performance via Neon console
- Set appropriate timeout values
- Use indexes for frequently queried columns

## Next Steps

After database setup:
1. Configure authentication (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
2. Set up file storage (Backblaze B2)
3. Deploy to Vercel
4. Configure domain and SSL