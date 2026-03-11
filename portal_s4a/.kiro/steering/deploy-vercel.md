---
title: "Deploy to Vercel - Portal S4A"
description: "Complete deployment guide for Portal S4A on Vercel"
tags: ["deployment", "vercel", "production", "ci-cd"]
---

# Deploy to Vercel - Portal S4A

## Overview

Portal S4A is deployed on Vercel with automatic deployments from the main branch. This guide covers setup, configuration, and troubleshooting.

## Initial Setup

### 1. Connect Repository

```bash
# Install Vercel CLI
npm install -g vercel

# Login and connect project
vercel login
vercel --prod
```

### 2. Configure Environment Variables

**Required Variables:**
```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=secure-password

# Storage (Backblaze B2)
STORAGE_BUCKET_NAME=your-bucket
STORAGE_ACCESS_KEY_ID=your-key-id
STORAGE_SECRET_ACCESS_KEY=your-secret
STORAGE_REGION=us-east-1
STORAGE_ENDPOINT=https://s3.us-east-005.backblazeb2.com
STORAGE_FORCE_PATH_STYLE=true

# Pusher (WebSocket)
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=your-public-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# SMTP (Email)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM="Portal S4A" <noreply@example.com>

# API Keys
GITHUB_TOKEN=ghp_your-github-token
CONSULTA_CNPJ_API=https://api.invertexto.com/v1/cnpj/
CONSULTA_CNPJ_TOKEN=your-cnpj-token

# Timezone
TIMEZONE=America/Sao_Paulo
NEXT_PUBLIC_TIMEZONE=America/Sao_Paulo
```

### 3. Vercel Configuration

Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "TIMEZONE": "America/Sao_Paulo",
    "NEXT_PUBLIC_TIMEZONE": "America/Sao_Paulo"
  }
}
```

## Deployment Process

### Automatic Deployment

```bash
# Push to main branch triggers deployment
git push origin main

# Monitor deployment
vercel --logs
```

### Manual Deployment

```bash
# Deploy current branch
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
vercel --prod --branch feature-branch
```

## Environment Management

### Production Environment
- **Branch:** `main`
- **Database:** Production Neon branch
- **Domain:** Custom domain or vercel.app
- **Monitoring:** Full logging enabled

### Preview Environments
- **Branches:** All non-main branches
- **Database:** Development Neon branch
- **Domain:** Auto-generated preview URLs
- **Monitoring:** Basic logging

### Environment Variables Setup

1. Go to Vercel Dashboard
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add each variable with appropriate environments:
   - **Production:** Main branch only
   - **Preview:** All branches
   - **Development:** Local development

## Database Configuration

### Production Database
```bash
# Use production branch connection string
DATABASE_URL="postgresql://prod-user:pass@prod-host/db?sslmode=require"
```

### Preview Database
```bash
# Use development branch connection string
DATABASE_URL="postgresql://dev-user:pass@dev-host/db?sslmode=require"
```

## Build Configuration

### Next.js Configuration

`next.config.ts`:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  images: {
    domains: ['s3.grupoavantti.com.br'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.grupoavantti.com.br',
        port: '',
        pathname: '/**',
      }
    ]
  }
};

export default nextConfig;
```

### Build Optimization

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "build:analyze": "ANALYZE=true next build"
  }
}
```

## Monitoring & Debugging

### Vercel Logs

```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow

# View specific deployment
vercel logs [deployment-url]
```

### Performance Monitoring

- **Core Web Vitals:** Monitored automatically
- **Function Duration:** Check for timeouts
- **Build Time:** Optimize for faster deployments
- **Bundle Size:** Monitor and optimize

### Error Tracking

```typescript
// Add error boundaries in React components
export function ErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong</div>}
      onError={(error) => console.error('Error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
vercel logs --follow

# Common causes:
- TypeScript errors
- Missing environment variables
- Dependency issues
- Memory limits exceeded
```

#### Database Connection Issues
```bash
# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Neon dashboard for connection limits
```

#### Function Timeouts
```bash
# Increase timeout in vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

#### Environment Variable Issues
```bash
# Verify variables are set
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME

# Pull environment variables locally
vercel env pull .env.local
```

### Performance Issues

#### Slow Build Times
- Optimize dependencies
- Use build cache effectively
- Reduce bundle size
- Enable incremental builds

#### Slow Function Execution
- Optimize database queries
- Use connection pooling
- Implement caching
- Reduce payload sizes

#### Memory Issues
- Optimize image processing
- Reduce memory usage in functions
- Use streaming for large responses
- Implement pagination

## Security

### Environment Variables
- Never commit sensitive data
- Use Vercel's encrypted storage
- Rotate credentials regularly
- Use least privilege principle

### Domain Security
```bash
# Configure custom domain
vercel domains add yourdomain.com

# Enable SSL (automatic)
# Configure redirects if needed
```

### Headers Configuration
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  }
};
```

## Maintenance

### Regular Tasks
- Monitor deployment success rates
- Check function performance metrics
- Update dependencies regularly
- Review and rotate credentials
- Monitor database performance
- Check error rates and logs

### Backup Strategy
- Database: Neon automatic backups
- Code: Git repository
- Environment: Document all variables
- Deployment: Keep deployment history

### Scaling Considerations
- Monitor function concurrency
- Database connection limits
- File storage usage
- Bandwidth usage
- Build minutes consumption

## Next Steps

After successful deployment:
1. Configure custom domain
2. Set up monitoring alerts
3. Implement error tracking
4. Configure backup procedures
5. Document deployment process
6. Train team on deployment workflow