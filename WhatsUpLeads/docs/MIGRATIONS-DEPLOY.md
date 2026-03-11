# Migrações no Deploy

Este documento explica como as migrações do banco de dados são executadas automaticamente durante o deploy.

## Abordagens Disponíveis

### 1. Deploy com Migração Automática (Recomendado)
Usa o script `deploy-with-migration.sh` que executa migrações antes do deploy da aplicação.

```bash
# Deploy com migração automática
./scripts/deploy-with-migration.sh whatsup
```

### 2. Deploy com Serviço de Migração Integrado
Usa o `docker-stack.yml` original com serviço de migração integrado.

```bash
# Deploy com serviço migrate integrado
docker stack deploy -c docker-stack.yml whatsup
```

## Como Funciona (Abordagem Recomendada)

### Etapa 1: Migração
1. Cria um serviço temporário `{stack}_migrate_temp`
2. Executa `npx prisma migrate deploy`
3. Gera o cliente Prisma
4. Aguarda completar (máximo 5 minutos)
5. Remove o serviço temporário

### Etapa 2: Deploy da Aplicação
1. Faz deploy da stack completa usando `docker-stack-no-migrate.yml`
2. App e Worker iniciam com banco já migrado
3. Sem dependências complexas entre serviços

## Scripts Disponíveis

### Script Principal
```bash
# Deploy completo com migração
./scripts/deploy-with-migration.sh [stack_name]

# Exemplo
./scripts/deploy-with-migration.sh whatsup
```

### Script de Migração Standalone
```bash
# Apenas migração (para troubleshooting)
docker run --rm -e DATABASE_URL="$DATABASE_URL" \
  ghcr.io/vifigueiredo/whatsupleads:latest \
  node scripts/migrate-prod.js
```

## Variáveis Obrigatórias
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=seu-jwt-secret
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=senha-admin
```

## Monitoramento

### Ver status dos serviços
```bash
docker stack services whatsup
```

### Ver logs durante migração
```bash
# Durante a migração
docker service logs whatsup_migrate_temp -f

# Após deploy
docker service logs whatsup_app -f
docker service logs whatsup_worker -f
```

## Troubleshooting

### Migração falhou
1. Verifique os logs: `docker service logs whatsup_migrate_temp`
2. Verifique a `DATABASE_URL`
3. Verifique conectividade com o banco
4. Execute migração manual se necessário

### Timeout na migração
- Migração tem timeout de 5 minutos
- Para migrações longas, aumente o timeout no script
- Ou execute migração manual antes do deploy

### App não inicia após migração
1. Verifique se a migração completou: logs do serviço temporário
2. Verifique logs da app: `docker service logs whatsup_app`
3. Verifique variáveis de ambiente

## Rollback

### Rollback da aplicação
```bash
# Volta para versão anterior
docker service update --rollback whatsup_app
docker service update --rollback whatsup_worker
```

### Rollback de migração
⚠️ **Cuidado**: Rollback de migrações pode causar perda de dados!

```bash
# Execute manualmente se necessário
npx prisma migrate reset --force
```

## Arquivos Relacionados

- `scripts/deploy-with-migration.sh` - Script principal de deploy
- `scripts/migrate-prod.js` - Script de migração
- `docker-stack.yml` - Stack com migração integrada
- `docker-stack-no-migrate.yml` - Stack sem migração (usado pelo script)

## CI/CD Integration

### GitHub Actions
O workflow já está configurado para build e push da imagem.

### Deploy Automático
Para deploy automático via webhook:

```bash
# No servidor de produção
./scripts/deploy-with-migration.sh whatsup
```

### Portainer Webhook
Configure o webhook do Portainer para executar:
```bash
#!/bin/bash
cd /path/to/project
git pull
./scripts/deploy-with-migration.sh whatsup
```