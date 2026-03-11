# Docker Migration Troubleshooting Guide

## Problem Solved: Migration Service Failing

### Issue Description
The previous Docker stack configuration had a separate `migration` service that would:
- Run migrations once and exit
- Be marked as "failed" by Docker Swarm even when successful
- Cause dependency issues with the main app service
- Require manual intervention (`npx prisma generate` and `npx prisma db push`)

### Root Cause
Docker Swarm treats services that exit (even successfully) as "failed". The separate migration service approach doesn't work well in production environments.

### Solution Implemented

#### 1. Integrated Migration Approach
- **Before**: Separate migration service + main app service
- **After**: Single app service that runs migrations before starting

#### 2. Robust Migration Script
Created `scripts/migrate-and-start-robust.js` with:
- Retry logic for database operations
- Detailed logging with timestamps
- Error handling and recovery
- Database connectivity testing
- Graceful shutdown handling

#### 3. Improved Docker Configuration
- Longer health check start periods (120s for app, 150s for worker)
- Better resource allocation
- Proper restart policies
- No more `depends_on` issues

## Files Changed

### New Files
- `docker-stack-production-final.yml` - Production-ready stack configuration
- `scripts/migrate-and-start-robust.js` - Robust migration and startup script
- `scripts/deploy-production-final.sh` - Bash deployment script
- `scripts/deploy-production-final.ps1` - PowerShell deployment script

### Updated Files
- `docker-stack-fixed-migration.yml` - Updated with robust script usage

## Deployment Instructions

### Option 1: Use Deployment Script (Recommended)

**Linux/Mac:**
```bash
./scripts/deploy-production-final.sh
```

**Windows:**
```powershell
.\scripts\deploy-production-final.ps1
```

### Option 2: Manual Deployment

1. **Ensure networks exist:**
```bash
docker network create --driver overlay internal
docker network network create --driver overlay tunnel
```

2. **Remove existing stack (if any):**
```bash
docker stack rm whatsup
sleep 30
```

3. **Deploy new stack:**
```bash
docker stack deploy -c docker-stack-production-final.yml whatsup
```

## Monitoring and Troubleshooting

### Check Service Status
```bash
docker stack ps whatsup
```

### View Application Logs
```bash
docker service logs -f whatsup_app
```

### View Worker Logs
```bash
docker service logs -f whatsup_worker
```

### Check Individual Container Logs
```bash
# Get container ID
docker ps | grep whatsup_app

# View logs
docker logs <container_id>
```

## Expected Startup Sequence

1. **App Service Starts** (0-30s)
   - Container starts
   - Migration script begins
   - Database connectivity test

2. **Migrations Run** (30-90s)
   - `npx prisma migrate deploy`
   - `npx prisma generate`
   - USD rate debug script (optional)

3. **App Starts** (90-120s)
   - Next.js application starts
   - Health checks begin passing
   - Service marked as healthy

4. **Worker Starts** (120-150s)
   - Worker waits for app to be ready
   - BullMQ worker starts
   - Background job processing begins

## Common Issues and Solutions

### Issue: "Migration failed after 5 attempts"
**Cause**: Database connectivity issues
**Solution**: 
- Check DATABASE_URL environment variable
- Verify Neon database is accessible
- Check network connectivity

### Issue: "No .next build found"
**Cause**: Docker image wasn't built properly
**Solution**:
- Rebuild Docker image
- Ensure build process completed successfully
- Check Dockerfile configuration

### Issue: Health checks failing
**Cause**: App not responding on port 3000
**Solution**:
- Check if migrations are still running
- Verify no port conflicts
- Check application logs for startup errors

### Issue: Worker not starting
**Cause**: Database or Redis connectivity
**Solution**:
- Verify Redis connection (REDIS_URL)
- Check if app service is healthy
- Review worker logs for specific errors

## Performance Considerations

### Resource Allocation
- **App Service**: 2 CPU, 2GB RAM (can handle migrations + app)
- **Worker Service**: 1 CPU, 1GB RAM (sufficient for background jobs)

### Startup Times
- **Total startup**: ~2-3 minutes
- **Migration phase**: 30-90 seconds
- **App ready**: 90-120 seconds
- **Worker ready**: 120-150 seconds

### Health Check Configuration
- **App**: 120s start period (allows for migrations)
- **Worker**: 150s start period (waits for app + own startup)
- **Intervals**: 30s for app, 60s for worker

## Rollback Procedure

If deployment fails:

1. **Remove failed stack:**
```bash
docker stack rm whatsup
```

2. **Deploy previous version:**
```bash
docker stack deploy -c docker-stack-with-migration.yml whatsup
```

3. **Or use simple version:**
```bash
docker stack deploy -c docker-stack.yml whatsup
```

## Success Indicators

### Healthy Deployment
- All services show "Running" status
- Health checks are passing
- Application responds at https://disparo.grupoavantti.com.br
- No "failed" services in `docker stack ps whatsup`

### Log Messages to Look For
```
[INFO] 🚀 Starting Next.js application...
[INFO] ✅ Migration and startup completed successfully
[INFO] 🎉 Application is now running!
```

## Migration Script Features

The robust migration script provides:
- **Retry Logic**: Up to 5 attempts for critical operations
- **Detailed Logging**: Timestamped logs for debugging
- **Error Recovery**: Continues on non-critical failures
- **Health Monitoring**: Verifies database connectivity
- **Graceful Shutdown**: Handles SIGTERM/SIGINT properly
- **Debug Information**: Environment and file system checks

This approach eliminates the "failed migration container" issue and provides a more reliable deployment process.