# 🐳 Docker Swarm - Troubleshooting Guide

## 🚨 Problemas Identificados e Soluções

### 1. Script de Migração Causando Erro

**Problema**: O script `scripts/migrate-prod.js` estava sendo executado como comando principal, causando falha nos containers.

**Causa**: 
- Script de migração deve rodar uma vez e parar
- Não deve ser o comando principal do container da aplicação

**Soluções**:

#### Opção A: Serviço de Migração Separado (Recomendado)
```yaml
# docker-stack-fixed.yml
migration:
  image: ghcr.io/vifigueiredo/whatsupleads:develop
  command: ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && echo 'Migration completed' && sleep 10"]
  deploy:
    replicas: 1
    restart_policy:
      condition: on-failure
      max_attempts: 3
```

#### Opção B: Init Container Pattern
```yaml
# Comentar a linha de migração no serviço principal
#command: ["node", "scripts/migrate-prod.js"]
```

#### Opção C: Migração Manual
```bash
# Executar antes do deploy
docker run --rm \
  -e DATABASE_URL="postgresql://..." \
  ghcr.io/vifigueiredo/whatsupleads:develop \
  sh -c "npx prisma migrate deploy && npx prisma generate"
```

### 2. Worker Container Finalizando

**Problema**: O container do worker BullMQ estava finalizando inesperadamente.

**Causas Identificadas**:
- Erro ao carregar módulos TypeScript em produção
- Falta de runtime TypeScript (tsx/ts-node)
- Caminhos de módulos incorretos
- Falta de tratamento de erros adequado

**Soluções**:

#### Opção A: Script de Worker Robusto
```yaml
# Usar o novo script otimizado
worker:
  command: ["node", "scripts/start-worker-production.js"]
```

#### Opção B: Comando Inline Simples
```yaml
worker:
  command: ["node", "-r", "tsx/cjs", "scripts/start-worker.js"]
```

#### Opção C: Usar Queue Memory (Mais Simples)
```yaml
# No serviço principal
environment:
  - QUEUE_PROVIDER=memory  # Em vez de bullmq
```

### 3. Problemas de Dependências

**Problema**: Módulos TypeScript não carregando corretamente em produção.

**Soluções**:
- ✅ Script `start-worker-production.js` com melhor tratamento de erros
- ✅ Fallback para diferentes caminhos de módulos
- ✅ Logs detalhados para debug
- ✅ Verificação de arquivos necessários

## 📋 Arquivos de Deploy Disponíveis

### 1. `docker-stack-simple.yml` (Recomendado para início)
- ✅ Usa `QUEUE_PROVIDER=memory` (mais simples)
- ✅ Um único serviço principal
- ✅ Worker BullMQ opcional (replicas: 0)
- ✅ Recursos otimizados

### 2. `docker-stack-fixed.yml` (Para produção com Redis)
- ✅ Serviço de migração separado
- ✅ Worker BullMQ robusto
- ✅ Healthchecks configurados
- ✅ Dependências corretas

### 3. `docker-stack.yml` (Original com problemas)
- ❌ Script de migração como comando principal
- ❌ Worker instável
- ❌ Falta de tratamento de erros

## 🚀 Como Fazer Deploy

### Opção 1: Deploy Simples (Recomendado)
```bash
# 1. Fazer deploy sem worker Redis
docker stack deploy -c docker-stack-simple.yml whatsup

# 2. Verificar se está funcionando
docker service ls
docker service logs whatsup_app

# 3. Se precisar de Redis, ativar worker
# Editar docker-stack-simple.yml: replicas: 0 -> replicas: 1
docker stack deploy -c docker-stack-simple.yml whatsup
```

### Opção 2: Deploy Completo com Redis
```bash
# 1. Fazer migração manual primeiro (opcional)
docker run --rm \
  -e DATABASE_URL="postgresql://neondb_owner:npg_SRIN5TrWfw0P@ep-rapid-star-acyyhym7-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  ghcr.io/vifigueiredo/whatsupleads:develop \
  sh -c "npx prisma migrate deploy && npx prisma generate"

# 2. Deploy com todos os serviços
docker stack deploy -c docker-stack-fixed.yml whatsup
```

## 🔍 Debug e Monitoramento

### Verificar Status dos Serviços
```bash
# Listar serviços
docker service ls

# Ver logs de um serviço
docker service logs whatsup_app
docker service logs whatsup_worker

# Ver detalhes de um serviço
docker service inspect whatsup_app
```

### Verificar Containers
```bash
# Listar containers
docker ps

# Entrar em um container
docker exec -it <container_id> sh

# Ver logs de um container
docker logs <container_id>
```

### Testar Conectividade
```bash
# Testar aplicação
curl http://localhost:3000/api/health

# Testar Redis (se usando BullMQ)
docker exec -it <worker_container> sh
redis-cli -u redis://:Fb0Mfr7WhZ5nINC03yRtuLIAUlRQktNJ@redis:6379/4 ping
```

## ⚠️ Problemas Comuns e Soluções

### Worker Continua Finalizando
```bash
# 1. Verificar logs
docker service logs whatsup_worker

# 2. Verificar se Redis está acessível
docker exec -it <container> sh
ping redis

# 3. Usar queue memory temporariamente
# Editar docker-stack: QUEUE_PROVIDER=memory
```

### Erro de Migração
```bash
# 1. Executar migração manual
docker run --rm \
  -e DATABASE_URL="..." \
  ghcr.io/vifigueiredo/whatsupleads:develop \
  npx prisma migrate deploy

# 2. Ou comentar comando de migração no stack
```

### Aplicação Não Inicia
```bash
# 1. Verificar variáveis de ambiente
docker service inspect whatsup_app

# 2. Verificar se banco está acessível
docker exec -it <container> sh
nc -zv ep-rapid-star-acyyhym7-pooler.sa-east-1.aws.neon.tech 5432

# 3. Verificar logs detalhados
docker service logs --follow whatsup_app
```

## 📊 Monitoramento de Produção

### Healthchecks
- ✅ Aplicação: `http://localhost:3000/api/health`
- ✅ Worker: Verificação de processo ativo

### Métricas Importantes
- CPU e memória dos containers
- Status das filas (se usando BullMQ)
- Logs de erro
- Tempo de resposta da aplicação

### Alertas Recomendados
- Container reiniciando frequentemente
- Alto uso de CPU/memória
- Falhas no healthcheck
- Erros nos logs

---

**Resumo**: Use `docker-stack-simple.yml` para começar, depois migre para `docker-stack-fixed.yml` se precisar de Redis/BullMQ.