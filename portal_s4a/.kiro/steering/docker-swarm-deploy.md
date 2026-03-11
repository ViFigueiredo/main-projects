# Deploy Docker Swarm + Portainer

## Visão Geral

Este guia documenta o processo completo de deploy do Portal S4A usando Docker Swarm com Portainer, incluindo CI/CD via GitHub Actions e hospedagem de imagens no GitHub Container Registry (GHCR).

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   GitHub Repo   │────▶│  GitHub Actions │────▶│      GHCR       │
│   (código)      │     │  (build/push)   │     │  (imagens)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Neon DB       │◀────│  Docker Swarm   │◀────│   Portainer     │
│   (PostgreSQL)  │     │  (containers)   │     │   (deploy)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Arquivos de Configuração

### Dockerfile

Multi-stage build otimizado para Next.js standalone:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

### GitHub Actions (.github/workflows/docker-build.yml)

Build automático em push para `main` ou `develop`:

- Faz login no GHCR
- Builda a imagem Docker
- Publica com tags: `latest`, `develop`, `sha-xxxxx`

### Stack File

- `docker-stack.yaml` - Stack unica para deploy em Swarm + Portainer

## Configuração de Database

O sistema suporta múltiplos providers de banco:

### Neon (Serverless PostgreSQL) - Recomendado

```yaml
environment:
  - DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### PostgreSQL Direto

```yaml
environment:
  - DATABASE_PROVIDER=postgres
  - DATABASE_URL=postgresql://user:pass@host:5432/db
  - DATABASE_SSL=false
```

### PostgreSQL com PgBouncer

```yaml
environment:
  - DATABASE_PROVIDER=pgbouncer
  - DATABASE_URL=postgresql://user:pass@pgbouncer:6432/db
  - DATABASE_SSL=false
```

## Healthcheck

**IMPORTANTE:** A imagem Alpine mínima não tem `wget` nem `curl`. Use Node.js:

```yaml
healthcheck:
  test:
    [
      'CMD',
      'node',
      '-e',
      "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))",
    ]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

## Deploy no Portainer

### 1. Criar Stack

1. Acesse Portainer → Stacks → Add Stack
2. Cole o conteudo do `docker-stack.yaml`
3. Configure as variáveis de ambiente
4. Deploy

### 2. Variáveis Obrigatórias

```yaml
environment:
  # CRÍTICO: deve ser production!
  - NODE_ENV=production
  - DOCKER=1

  # Database
  - DATABASE_URL=postgresql://...

  # Admin
  - ADMIN_EMAIL=admin@example.com
  - ADMIN_PASSWORD=senha-segura

  # Storage (S3)
  - STORAGE_BUCKET_NAME=bucket
  - STORAGE_ACCESS_KEY_ID=key
  - STORAGE_SECRET_ACCESS_KEY=secret
  - STORAGE_ENDPOINT=https://s3.example.com

  # Pusher (WebSocket)
  - PUSHER_APP_ID=xxx
  - PUSHER_KEY=xxx
  - PUSHER_SECRET=xxx
  - PUSHER_CLUSTER=sa1
  - NEXT_PUBLIC_PUSHER_KEY=xxx
  - NEXT_PUBLIC_PUSHER_CLUSTER=sa1
```

### 3. Stack Mínima Funcional

```yaml
version: '3.8'

services:
  portal:
    image: ghcr.io/vifigueiredo/intranet_basic:develop
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DOCKER=1
      - DATABASE_URL=postgresql://...
      - ADMIN_EMAIL=admin@example.com
      - ADMIN_PASSWORD=senha
    deploy:
      mode: replicated
      replicas: 1
      restart_policy:
        condition: on-failure
    healthcheck:
      test:
        [
          'CMD',
          'node',
          '-e',
          "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

## Troubleshooting

### Container com status "Complete"

**Causa:** O processo Node.js termina imediatamente após iniciar.

**Soluções:**

1. Verificar se `NODE_ENV=production` (não development!)
2. Remover healthcheck para testar
3. Verificar logs: `docker service logs <service_name>`

### Healthcheck falhando

**Causa:** `wget` ou `curl` não existem na imagem Alpine mínima.

**Solução:** Usar Node.js com fetch:

```yaml
test: ['CMD', 'node', '-e', "fetch('http://localhost:3000/api/health')..."]
```

### Imagem não encontrada

**Causa:** Docker não consegue fazer pull do GHCR.

**Soluções:**

1. Fazer pull manual: `docker pull ghcr.io/user/repo:tag`
2. Verificar se a imagem é pública no GHCR
3. Fazer login: `docker login ghcr.io`

### Networks não existem

**Causa:** Stack referencia networks externas que não existem.

**Solução:** Remover seção `networks` ou criar as networks antes:

```bash
docker network create --driver overlay traefik-public
```

### Porta já em uso

**Causa:** Outra aplicação usando a porta 3000.

**Soluções:**

1. Usar outra porta: `"3001:3000"`
2. Remover `ports` e usar reverse proxy (Traefik/Nginx)

## CI/CD Flow

```
1. Push para main/develop
   ↓
2. GitHub Actions dispara
   ↓
3. Build da imagem Docker
   ↓
4. Push para GHCR
   ↓
5. Portainer detecta nova imagem (ou manual)
   ↓
6. Rolling update do serviço
```

### Tags Geradas

- `main` → `latest`, `main`, `sha-xxxxx`
- `develop` → `develop`, `sha-xxxxx`
- `v1.0.0` → `1.0.0`, `1.0`, `sha-xxxxx`

## Comandos Úteis

```bash
# Ver serviços
docker stack services <stack_name>

# Ver tasks/replicas
docker service ps <service_name> --no-trunc

# Ver logs
docker service logs <service_name> --tail 100

# Atualizar serviço
docker service update --force <service_name>

# Remover stack
docker stack rm <stack_name>

# Pull manual da imagem
docker pull ghcr.io/vifigueiredo/intranet_basic:develop
```

## Custos Estimados

| Serviço                  | Custo/mês  |
| ------------------------ | ---------- |
| Hetzner CX33 (Next.js)   | ~$7        |
| Neon Database (Free/Pro) | $0-$19     |
| Backblaze B2 (10GB)      | ~$1        |
| **Total**                | **~$8-27** |

## Próximos Passos

1. Configurar domínio e SSL (Traefik/Cloudflare)
2. Configurar backups automáticos
3. Monitoramento (Uptime Kuma, Grafana)
4. Alertas de deploy (Discord/Slack webhook)
