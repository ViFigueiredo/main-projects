---
title: "Neon Database Management"
description: "Complete guide for managing Neon PostgreSQL branches and workflows"
tags: ["neon", "database", "branches", "postgresql"]
---

# Neon Database Management

## Overview

Portal S4A uses Neon's serverless PostgreSQL with database branching for development workflows. This guide covers branch management, migrations, and best practices.

## Project Information

- **Project ID:** `restless-morning-33051903`
- **Database:** `intranet`
- **PostgreSQL Version:** 17

## Branch Structure

### Production Environment
- **Branch:** `production` (main)
- **Usage:** Live production data
- **Access:** Restricted to production deployments

### Development Environment  
- **Branch:** `develop`
- **Usage:** Development and testing
- **Access:** Local development environment

### Feature Branches
- **Pattern:** `feature-[name]`
- **Usage:** Individual feature development
- **Lifecycle:** Created → Developed → Merged → Deleted

## Common Operations

### Branch Management

```bash
# List all branches
neonctl branches list --project-id restless-morning-33051903

# Create feature branch from develop
neonctl branches create feature-name --parent develop --project-id restless-morning-33051903

# Get connection string
neonctl connection-string --branch develop --project-id restless-morning-33051903

# Merge feature to develop (restore develop from feature)
neonctl branches restore develop feature-name --project-id restless-morning-33051903

# Merge develop to production
neonctl branches restore production develop --project-id restless-morning-33051903

# Delete feature branch
neonctl branches delete feature-name --project-id restless-morning-33051903
```

### Environment Configuration

```bash
# Development (.env.local)
DATABASE_URL="postgresql://neondb_owner:npg_xxx@ep-xxx.c-2.us-east-1.aws.neon.tech/intranet?sslmode=require&channel_binding=require"

# Update for different branches
# Replace connection string when switching branches
```

## Development Workflow

### 1. Start New Feature

```bash
# Create feature branch
neonctl branches create feature-user-management --parent develop --project-id restless-morning-33051903

# Get connection string and update .env.local
neonctl connection-string --branch feature-user-management --project-id restless-morning-33051903

# Update .env.local
DATABASE_URL="new-branch-connection-string"
```

### 2. Development Process

```bash
# Develop feature with isolated database
npm run dev

# Test migrations on feature branch
# All changes are isolated from other branches
```

### 3. Merge to Development

```bash
# After feature completion, merge to develop
neonctl branches restore develop feature-user-management --project-id restless-morning-33051903

# Update .env.local to develop branch
DATABASE_URL="develop-branch-connection-string"

# Test integration with other features
npm run dev
```

### 4. Production Deployment

```bash
# After thorough testing, merge to production
neonctl branches restore production develop --project-id restless-morning-33051903

# Production deployment happens automatically via Vercel
```

## Database Schema Management

### Automatic Initialization

Tables are created automatically via `src/instrumentation.ts`:

```typescript
// src/instrumentation.ts
export async function register() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.NEXT_PHASE !== 'phase-production-build'
  ) {
    await initializeDb();
  }
}
```

### Manual Migrations

```bash
# Apply specific migration
psql $DATABASE_URL -f src/lib/migrations/migration-file.sql

# Check migration status
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```

### Schema Verification

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'table_name'
);

-- Check column existence
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'table_name' 
AND column_name = 'column_name';

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## Best Practices

### Branch Naming
- **Features:** `feature-descriptive-name`
- **Fixes:** `fix-issue-description`
- **Experiments:** `experiment-name`

### Data Management
- **Never work directly on production**
- **Always test migrations on feature branches**
- **Keep feature branches short-lived**
- **Regular cleanup of old branches**

### Performance
- **Use connection pooling in production**
- **Monitor query performance**
- **Implement proper indexes**
- **Regular VACUUM and ANALYZE**

### Security
- **Use SSL connections (sslmode=require)**
- **Rotate credentials regularly**
- **Limit branch access**
- **Monitor connection usage**

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check project status
neonctl projects show restless-morning-33051903

# Verify branch exists
neonctl branches list --project-id restless-morning-33051903
```

### Branch Issues

```bash
# Branch not found
neonctl branches list --project-id restless-morning-33051903

# Cannot create branch
# Check if parent branch exists
# Verify project limits

# Restore failed
# Check source and target branches exist
# Verify permissions
```

### Performance Issues

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Monitoring

### Key Metrics
- **Connection count**
- **Query performance**
- **Storage usage**
- **Branch count**

### Neon Console
- Monitor via Neon dashboard
- Set up alerts for limits
- Review query performance
- Track storage growth

### Application Monitoring

```typescript
// Add connection monitoring
import db from '@/lib/db';

export async function checkDatabaseHealth() {
  try {
    const result = await db`SELECT 1 as health`;
    return { healthy: true, timestamp: new Date() };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { healthy: false, error: error.message };
  }
}
```

## Backup Strategy

### Automatic Backups
- Neon provides automatic backups
- Point-in-time recovery available
- Cross-region replication

### Manual Backups

```bash
# Export schema
pg_dump $DATABASE_URL --schema-only > schema.sql

# Export data
pg_dump $DATABASE_URL --data-only > data.sql

# Full backup
pg_dump $DATABASE_URL > full_backup.sql
```

### Backup Verification

```bash
# Test restore on feature branch
neonctl branches create backup-test --project-id restless-morning-33051903
psql $BACKUP_TEST_URL < full_backup.sql
```

## Advanced Features

### Connection Pooling

```typescript
// Use connection pooling for production
import postgres from 'postgres';

const db = postgres(process.env.DATABASE_URL!, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});
```

### Read Replicas

```bash
# Create read replica (if available)
neonctl branches create read-replica --type read-only --project-id restless-morning-33051903
```

### Autoscaling Configuration

- Neon automatically scales compute
- Configure min/max compute units
- Set auto-suspend timeout
- Monitor scaling events

## Migration Checklist

### Before Migration
- [ ] Create feature branch
- [ ] Test migration on feature branch
- [ ] Verify data integrity
- [ ] Check performance impact
- [ ] Plan rollback strategy

### During Migration
- [ ] Apply migration to develop
- [ ] Run integration tests
- [ ] Verify application functionality
- [ ] Check for errors in logs

### After Migration
- [ ] Monitor performance
- [ ] Verify data consistency
- [ ] Update documentation
- [ ] Clean up old branches