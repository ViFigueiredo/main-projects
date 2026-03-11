# 🗄️ Opções de Migração para Docker Swarm

## 📋 Opções Disponíveis

### 1. **Migração Integrada no App** (Mais Simples)
O serviço app executa migração antes de iniciar.

```yaml
# docker-stack-simple.yml
app:
  command: ["node", "scripts/migrate-and-start.js"]
  # ou
  command: ["sh", "scripts/migrate-and-start.sh"]
  # ou inline
  command: ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && npm start"]
```

**Vantagens:**
- ✅ Simples de configurar
- ✅ Um único serviço
- ✅ Migração sempre executada

**Desvantagens:**
- ⚠️ App demora mais para iniciar
- ⚠️ Se migração falhar, app não inicia

### 2. **Serviço de Migração Separado** (Mais Robusto)
Serviço dedicado executa migração, depois app inicia.

```yaml
# docker-stack-with-migration.yml
migration:
  command: ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && sleep 30"]
  
app:
  depends_on:
    - migration
```

**Vantagens:**
- ✅ Separação de responsabilidades
- ✅ App inicia mais rápido
- ✅ Migração pode ser monitorada separadamente

**Desvantagens:**
- ⚠️ Mais complexo
- ⚠️ Dependência entre serviços

### 3. **Migração Manual** (Mais Controle)
Executar migração manualmente antes do deploy.

```bash
# Antes do deploy
docker run --rm \
  -e DATABASE_URL="postgresql://..." \
  ghcr.io/vifigueiredo/whatsupleads:develop \
  sh -c "npx prisma migrate deploy && npx prisma generate"

# Depois deploy normal
docker stack deploy -c docker-stack.yml whatsup
```

**Vantagens:**
- ✅ Controle total
- ✅ App inicia imediatamente
- ✅ Pode testar migração separadamente

**Desvantagens:**
- ⚠️ Passo manual extra
- ⚠️ Pode esquecer de executar

## 🚀 Scripts Criados

### `scripts/migrate-and-start.js`
Script Node.js robusto que:
- ✅ Verifica ambiente
- ✅ Executa `prisma migrate deploy`
- ✅ Executa `prisma generate`
- ✅ Opcionalmente executa debug USD
- ✅ Inicia aplicação Next.js
- ✅ Logs detalhados
- ✅ Error handling

### `scripts/migrate-and-start.sh`
Script shell simples que:
- ✅ Executa migrações
- ✅ Gera cliente Prisma
- ✅ Inicia aplicação
- ✅ Mais leve que Node.js

## 📊 Comparação de Opções

| Opção | Simplicidade | Robustez | Velocidade | Controle |
|-------|-------------|----------|------------|----------|
| **Integrada** | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐ |
| **Separada** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Manual** | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 Recomendações

### Para Desenvolvimento/Teste
```yaml
# Usar migração integrada (mais simples)
app:
  command: ["node", "scripts/migrate-and-start.js"]
  environment:
    - RUN_USD_DEBUG=true  # Debug USD na inicialização
```

### Para Produção
```yaml
# Usar serviço separado (mais robusto)
migration:
  command: ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && node scripts/debug-usd-production.js && sleep 30"]

app:
  depends_on:
    - migration
```

### Para Deploy Crítico
```bash
# Migração manual + deploy
docker run --rm -e DATABASE_URL="..." ghcr.io/vifigueiredo/whatsupleads:develop npx prisma migrate deploy
docker stack deploy -c docker-stack.yml whatsup
```

## 🔍 Como Usar Cada Opção

### Opção 1: Migração Integrada
```bash
# Usar docker-stack-simple.yml (já configurado)
docker stack deploy -c docker-stack-simple.yml whatsup

# Verificar logs
docker service logs whatsup_app --follow
```

### Opção 2: Migração Separada
```bash
# Usar docker-stack-with-migration.yml
docker stack deploy -c docker-stack-with-migration.yml whatsup

# Verificar migração
docker service logs whatsup_migration --follow

# Verificar app
docker service logs whatsup_app --follow
```

### Opção 3: Migração Manual
```bash
# 1. Executar migração
docker run --rm \
  -e DATABASE_URL="postgresql://neondb_owner:npg_SRIN5TrWfw0P@ep-rapid-star-acyyhym7-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  ghcr.io/vifigueiredo/whatsupleads:develop \
  sh -c "npx prisma migrate deploy && npx prisma generate"

# 2. Deploy sem migração
docker stack deploy -c docker-stack-no-migration.yml whatsup
```

## 🚨 Troubleshooting

### Migração Falha
```bash
# Ver logs detalhados
docker service logs whatsup_migration --follow

# Executar migração manual para debug
docker run --rm -it \
  -e DATABASE_URL="..." \
  ghcr.io/vifigueiredo/whatsupleads:develop \
  sh
```

### App Não Inicia Após Migração
```bash
# Verificar se migração completou
docker service ps whatsup_migration

# Verificar logs do app
docker service logs whatsup_app --follow

# Verificar conectividade com banco
docker exec -it <container> sh
nc -zv <database_host> 5432
```

### Prisma Generate Falha
```bash
# Executar generate manual
docker exec -it <container> npx prisma generate

# Verificar schema
docker exec -it <container> cat prisma/schema.prisma
```

---

**Recomendação Final**: Use `docker-stack-simple.yml` com migração integrada para começar. É mais simples e resolve 90% dos casos.