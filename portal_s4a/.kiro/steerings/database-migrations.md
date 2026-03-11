# Sistema de Migrações de Banco de Dados

## Visão Geral

O Portal S4A usa um sistema de migrações leve e automático que funciona com:
- **Neon Database** (serverless PostgreSQL)
- **PostgreSQL direto**
- **PostgreSQL com PgBouncer** (transaction mode)

As migrações são executadas automaticamente no startup da aplicação (deploy).

## Arquitetura

```
src/lib/migrations/
├── runner.ts                    # Motor de migrações
├── 000_schema_migrations_table.sql  # Migração inicial
├── 2025-*.sql                   # Migrações por data
├── 2026-*.sql                   # Migrações futuras
└── README.md                    # Documentação
```

## Comandos CLI

```bash
# Ver status das migrações
pnpm db:status

# Executar migrações pendentes
pnpm db:migrate

# Simular execução (dry-run)
pnpm db:migrate:dry

# Criar nova migração
pnpm db:create nome_da_migracao

# Marcar todas como executadas (baseline)
pnpm db:baseline
```

## Fluxo Automático

### No Deploy (Vercel/Docker)

1. `instrumentation.ts` é executado no startup
2. `runMigrations()` verifica migrações pendentes
3. Executa cada migração em ordem alfabética
4. Registra na tabela `schema_migrations`
5. `initializeDb()` cria tabelas base (idempotente)

### Controle de Execução

```bash
# Desabilitar migrações automáticas
RUN_MIGRATIONS=false

# Forçar execução em qualquer ambiente
# (padrão: executa em todos os ambientes)
```

## Criando Novas Migrações

### 1. Criar arquivo

```bash
pnpm db:create add_user_avatar
# Cria: src/lib/migrations/2026-01-12_add_user_avatar.sql
```

### 2. Editar SQL

```sql
-- Migration: add_user_avatar
-- Created: 2026-01-12
-- Description: Adiciona coluna avatar aos usuários

-- Use IF NOT EXISTS para segurança
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Índices também com IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_users_avatar ON users(avatar_url) WHERE avatar_url IS NOT NULL;
```

### 3. Testar localmente

```bash
# Ver status
pnpm db:status

# Executar
pnpm db:migrate
```

### 4. Commit e deploy

```bash
git add src/lib/migrations/
git commit -m "feat: add user avatar column"
git push
```

## Boas Práticas

### Nomenclatura

```
YYYY-MM-DD_descricao_curta.sql
```

Exemplos:
- `2026-01-12_add_user_avatar.sql`
- `2026-01-15_create_notifications_table.sql`
- `2026-02-01_add_index_orders_status.sql`

### SQL Seguro

```sql
-- ✅ BOM: Idempotente
CREATE TABLE IF NOT EXISTS example (...);
ALTER TABLE users ADD COLUMN IF NOT EXISTS new_col TEXT;
CREATE INDEX IF NOT EXISTS idx_name ON table(col);

-- ❌ RUIM: Pode falhar se executar duas vezes
CREATE TABLE example (...);
ALTER TABLE users ADD COLUMN new_col TEXT;
```

### Ordem de Execução

Migrações são executadas em **ordem alfabética**. Use prefixos de data para garantir ordem correta:

```
000_schema_migrations_table.sql  # Primeiro (setup)
002_crm_expansion.sql            # Segundo
2025-01-02_hybrid_inventory.sql  # Por data
2025-12-19_audit_system.sql      # Mais recente
```

## Tabela de Controle

```sql
CREATE TABLE schema_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  checksum VARCHAR(32) NOT NULL,
  execution_time_ms INTEGER
);
```

## Troubleshooting

### Migração falhou

```bash
# Ver logs detalhados
pnpm db:migrate

# Verificar status
pnpm db:status

# Corrigir SQL e tentar novamente
# (migrações falhadas não são registradas)
```

### Banco já tem tabelas (setup inicial)

```bash
# Marcar todas como executadas sem rodar
pnpm db:baseline
```

### Migração modificada após execução

O sistema detecta mudanças via checksum. Se uma migração foi modificada:

1. Crie uma nova migração com as alterações
2. Não modifique migrações já executadas em produção

### PgBouncer: prepared statements

O sistema desabilita automaticamente prepared statements quando detecta PgBouncer:

```typescript
// database-config.ts
if (provider === 'pgbouncer') {
  options.prepare = false;
}
```

## Ambientes

### Desenvolvimento (local)

```bash
# Usa branch develop do Neon
DATABASE_URL=postgresql://...@ep-wandering-sound-adjhvpu2-pooler.../intranet
```

### Produção (Vercel)

```bash
# Usa branch production do Neon
DATABASE_URL=postgresql://...@ep-super-cake-ad2s6vvq-pooler.../intranet
```

### Docker

```bash
# Requer DATABASE_URL explícita
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_PROVIDER=postgres  # ou pgbouncer
DATABASE_SSL=false          # para conexões locais
```

## Integração com initializeDb()

O `initializeDb()` em `src/lib/db.ts` continua funcionando:

1. Migrações SQL são executadas primeiro
2. `initializeDb()` cria tabelas base (idempotente)
3. Ambos usam `IF NOT EXISTS` para segurança

Isso permite:
- Migrações para alterações de schema
- `initializeDb()` para setup inicial e dados padrão

## Referências

- `src/lib/migrations/runner.ts` - Motor de migrações
- `src/instrumentation.ts` - Execução automática
- `scripts/migrate.ts` - CLI
- `src/lib/database-config.ts` - Configuração de conexão
