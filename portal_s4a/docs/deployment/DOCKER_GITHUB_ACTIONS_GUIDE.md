# Guia: GitHub Actions + Docker Build Automático

## 🎯 Visão Geral

O Portal S4A agora possui build automático de imagens Docker via GitHub Actions, publicando no GitHub Container Registry (GHCR).

## 🔄 Fluxo Automático

```
Push para branch → GitHub Actions → Build Docker → Push para GHCR
```

### Triggers Automáticos

- **Push para `main`**: Cria tags `latest`, `main`, `sha-xxxxx`
- **Push para `develop`**: Cria tags `develop`, `sha-xxxxx`  
- **Push para outras branches**: Cria tag `branch-name`, `sha-xxxxx`
- **Tags `v*`**: Cria tags semânticas (`1.0.0`, `1.0`, `1`)
- **Pull Requests**: Build de teste (não publica)

## 📦 Imagens Geradas

### Localização
```
https://github.com/ViFigueiredo/intranet_basic/pkgs/container/intranet_basic
```

### Tags Automáticas

| Evento | Tags Criadas |
|--------|-------------|
| Push `main` | `latest`, `main`, `sha-abc123` |
| Push `develop` | `develop`, `sha-abc123` |
| Push `feature-x` | `feature-x`, `sha-abc123` |
| Tag `v1.2.3` | `1.2.3`, `1.2`, `1`, `sha-abc123` |

## 🚀 Como Usar

### 1. Deploy Automático (Recomendado)

Simplesmente faça push para a branch desejada:

```bash
# Para desenvolvimento
git push origin develop

# Para produção  
git push origin main

# Para feature
git push origin feature-nova-funcionalidade
```

### 2. Deploy Manual (Opcional)

Use os scripts locais se necessário:

```bash
# Build local
pnpm build:docker

# Build + push para GHCR
pnpm build:ghcr

# Build + push com tag latest
pnpm build:ghcr:latest
```

## 🐳 Usando as Imagens

### Docker Run

```bash
# Última versão estável
docker run -p 3000:3000 --env-file .env.local \
  ghcr.io/vifigueiredo/intranet_basic:latest

# Versão de desenvolvimento
docker run -p 3000:3000 --env-file .env.local \
  ghcr.io/vifigueiredo/intranet_basic:develop

# Versão específica
docker run -p 3000:3000 --env-file .env.local \
  ghcr.io/vifigueiredo/intranet_basic:v1.0.0
```

### Docker Compose

```yaml
version: '3.8'
services:
  portal:
    image: ghcr.io/vifigueiredo/intranet_basic:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      # ... outras variáveis
```

### Portainer Stack

```yaml
version: '3.8'
services:
  portal:
    image: ghcr.io/vifigueiredo/intranet_basic:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DOCKER=1
      - DATABASE_URL=postgresql://...
      - ADMIN_EMAIL=admin@empresa.com
      - ADMIN_PASSWORD=senha-segura
      # Storage (Backblaze B2)
      - STORAGE_BUCKET_NAME=portal-s4a
      - STORAGE_ACCESS_KEY_ID=0051...
      - STORAGE_SECRET_ACCESS_KEY=K005...
      - STORAGE_ENDPOINT=https://s3.us-east-005.backblazeb2.com
      - STORAGE_FORCE_PATH_STYLE=true
    deploy:
      mode: replicated
      replicas: 1
      restart_policy:
        condition: on-failure
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente Obrigatórias

```bash
# Aplicação
NODE_ENV=production
DOCKER=1

# Database (Neon)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Admin
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=senha-segura

# Storage (Backblaze B2)
STORAGE_BUCKET_NAME=seu-bucket
STORAGE_ACCESS_KEY_ID=0051...
STORAGE_SECRET_ACCESS_KEY=K005...
STORAGE_REGION=us-east-005
STORAGE_ENDPOINT=https://s3.us-east-005.backblazeb2.com
STORAGE_FORCE_PATH_STYLE=true

# WebSocket (Pusher)
PUSHER_APP_ID=xxx
PUSHER_KEY=xxx
PUSHER_SECRET=xxx
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=xxx
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# Email (SMTP)
SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=email@exemplo.com
SMTP_PASS=senha
SMTP_FROM="Portal S4A" <noreply@exemplo.com>

# Timezone
TIMEZONE=America/Sao_Paulo
NEXT_PUBLIC_TIMEZONE=America/Sao_Paulo
```

## 📊 Monitoramento

### GitHub Actions

1. Acesse: https://github.com/ViFigueiredo/intranet_basic/actions
2. Veja o status dos builds
3. Verifique logs em caso de erro

### Container Registry

1. Acesse: https://github.com/ViFigueiredo/intranet_basic/pkgs/container/intranet_basic
2. Veja todas as imagens publicadas
3. Gerencie tags e versões

### Health Check

A imagem inclui health check automático:

```bash
# Verificar saúde do container
docker inspect --format='{{.State.Health.Status}}' container-name

# Ver logs do health check
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' container-name
```

## 🛠️ Troubleshooting

### Build Falha

1. **Erro de TypeScript**
   ```bash
   # Verificar localmente
   npx tsc --noEmit
   ```

2. **Erro de dependências**
   ```bash
   # Limpar cache e reinstalar
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **Erro de build Next.js**
   ```bash
   # Testar build local
   pnpm build
   ```

### Container não inicia

1. **Verificar logs**
   ```bash
   docker logs container-name
   ```

2. **Verificar variáveis de ambiente**
   ```bash
   docker exec container-name env
   ```

3. **Testar health check**
   ```bash
   docker exec container-name node -e "fetch('http://localhost:3000/api/health').then(r => console.log(r.status))"
   ```

### Imagem não encontrada

1. **Verificar se é pública**
   - Acesse o GHCR
   - Verifique se o package é público

2. **Fazer login no GHCR**
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin
   ```

## 🔄 Workflow de Deploy

### Desenvolvimento

```bash
# 1. Desenvolver feature
git checkout -b feature-nova-funcionalidade

# 2. Fazer commits
git add .
git commit -m "feat: nova funcionalidade"

# 3. Push (dispara build automático)
git push origin feature-nova-funcionalidade

# 4. Testar imagem gerada
docker run -p 3000:3000 --env-file .env.local \
  ghcr.io/vifigueiredo/intranet_basic:feature-nova-funcionalidade
```

### Produção

```bash
# 1. Merge para develop
git checkout develop
git merge feature-nova-funcionalidade
git push origin develop

# 2. Testar em ambiente de staging
docker run -p 3000:3000 --env-file .env.staging \
  ghcr.io/vifigueiredo/intranet_basic:develop

# 3. Merge para main (produção)
git checkout main
git merge develop
git push origin main

# 4. Deploy automático da imagem latest
# Portainer/Docker Swarm puxa automaticamente
```

## 📈 Otimizações

### Cache de Build

- ✅ GitHub Actions Cache habilitado
- ✅ Multi-stage build otimizado
- ✅ Layers Docker reutilizáveis

### Segurança

- ✅ Usuário não-root no container
- ✅ Health check integrado
- ✅ Imagens assinadas (attestation)
- ✅ Multi-platform (amd64/arm64)

### Performance

- ✅ Standalone output do Next.js
- ✅ Dependências otimizadas
- ✅ Build cache inteligente

## 🎉 Resultado Final

Agora você tem:

- ✅ **Build automático** em cada push
- ✅ **Imagens otimizadas** para produção
- ✅ **Tags semânticas** automáticas
- ✅ **Health checks** integrados
- ✅ **Multi-platform** (Intel/ARM)
- ✅ **Cache inteligente** para builds rápidos
- ✅ **Segurança** com usuário não-root
- ✅ **Monitoramento** via GitHub Actions

**Deploy simplificado**: Apenas faça `git push` e sua aplicação será automaticamente construída e publicada! 🚀

---

**Criado por:** Kiro AI  
**Data:** 18/01/2026  
**Versão:** 1.0