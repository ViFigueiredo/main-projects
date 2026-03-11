# Guia: Merge de Schema Develop → Production (Neon)

**Data:** 17/12/2025  
**Objetivo:** Atualizar estrutura do banco de produção sem perder dados reais

---

## ⚠️ O Problema

O comando `neonctl branches restore production develop` **substitui completamente** os dados de produção pelos de develop.

**Resultado:** Você perde todos os dados reais (clientes, vendas, funcionários).

---

## ✅ Solução: Merge Apenas de Schema

### Passo 1: Backup de Produção (OBRIGATÓRIO)

```bash
neonctl branches create production-backup-$(Get-Date -Format "yyyyMMdd-HHmm") --parent production --project-id restless-morning-33051903
```

### Passo 2: Comparar Diferenças de Schema

```bash
neonctl branches schema-diff develop production --project-id restless-morning-33051903
```

Isso mostra exatamente o que mudou:
- Novas tabelas
- Novas colunas
- Novos índices
- Alterações de constraints

### Passo 3: Exportar Schemas para Comparação Manual

```bash
# Exportar schema de develop (sem dados)
pg_dump $DATABASE_URL_DEVELOP --schema-only > schema-develop.sql

# Exportar schema de production
pg_dump $DATABASE_URL_PRODUCTION --schema-only > schema-production.sql

# Comparar arquivos
diff schema-develop.sql schema-production.sql
```

### Passo 4: Criar Migration com as Diferenças

Crie um arquivo SQL apenas com as mudanças necessárias:

```sql
-- migration-YYYYMMDD.sql

-- Novas tabelas
CREATE TABLE IF NOT EXISTS nova_tabela (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Novas colunas em tabelas existentes
ALTER TABLE employees ADD COLUMN IF NOT EXISTS novo_campo TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS categoria_id INTEGER;

-- Novos índices
CREATE INDEX IF NOT EXISTS idx_employees_novo_campo ON employees(novo_campo);

-- Novas constraints (cuidado com dados existentes!)
-- ALTER TABLE orders ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id);
```

### Passo 5: Aplicar Migration em Produção

```bash
# Conectar diretamente em produção
psql "postgresql://neondb_owner:xxx@ep-super-cake-ad2s6vvq.c-2.us-east-1.aws.neon.tech/intranet?sslmode=require"

# Ou aplicar arquivo de migration
psql $DATABASE_URL_PRODUCTION -f migration-YYYYMMDD.sql
```

---

## 📋 Checklist de Segurança

Antes de aplicar qualquer mudança em produção:

- [ ] Backup criado com `branches create`
- [ ] Schema diff revisado
- [ ] Migration testada em branch de teste
- [ ] Horário de baixo uso (se possível)
- [ ] Rollback planejado

---

## 🔄 Workflow Completo

```
1. Desenvolver em branch `develop`
         ↓
2. Testar todas as funcionalidades
         ↓
3. Criar backup de production
         ↓
4. Executar schema-diff
         ↓
5. Criar arquivo de migration
         ↓
6. Testar migration em branch temporária
         ↓
7. Aplicar migration em production
         ↓
8. Validar aplicação em produção
         ↓
9. Deletar backup após confirmação (opcional)
```

---

## 📊 Comparação de Métodos

| Método | Dados Preservados | Uso |
|--------|-------------------|-----|
| `restore production develop` | ❌ NÃO | Apenas ambientes de teste |
| `schema-diff` + migrations | ✅ SIM | Produção com dados reais |
| `pg_dump --schema-only` | ✅ SIM | Comparação manual detalhada |

---

## 🛠️ Comandos Úteis

### Connection Strings

```bash
# Production
DATABASE_URL_PRODUCTION="postgresql://neondb_owner:npg_xxx@ep-super-cake-ad2s6vvq.c-2.us-east-1.aws.neon.tech/intranet?sslmode=require"

# Develop
DATABASE_URL_DEVELOP="postgresql://neondb_owner:npg_xxx@ep-wandering-sound-adjhvpu2.c-2.us-east-1.aws.neon.tech/intranet?sslmode=require"
```

### Verificar Tabelas Existentes

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Verificar Colunas de uma Tabela

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'nome_tabela'
ORDER BY ordinal_position;
```

### Verificar se Coluna Existe

```sql
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_name = 'employees' 
  AND column_name = 'novo_campo'
);
```

---

## ⚡ Migrations do Projeto

As migrations ficam em `src/lib/migrations/`. Para aplicar:

```bash
# Aplicar migration específica
psql $DATABASE_URL_PRODUCTION -f src/lib/migrations/003_operations_suboperations.sql
```

---

## 🚨 Rollback

Se algo der errado:

```bash
# Restaurar production do backup
neonctl branches restore production production-backup-YYYYMMDD-HHMM --project-id restless-morning-33051903
```

---

## 📝 Exemplo Prático

### Cenário: Adicionar campo `suboperation_id` em várias tabelas

```sql
-- migration-20251217-suboperations.sql

-- 1. Verificar se tabela operations existe, senão criar
CREATE TABLE IF NOT EXISTS operations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Adicionar coluna em tabelas existentes
ALTER TABLE crm_opportunities ADD COLUMN IF NOT EXISTS suboperation_id INTEGER;
ALTER TABLE crm_orders ADD COLUMN IF NOT EXISTS suboperation_id INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS suboperation_id INTEGER;

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS idx_opportunities_subop ON crm_opportunities(suboperation_id);
CREATE INDEX IF NOT EXISTS idx_orders_subop ON crm_orders(suboperation_id);

-- 4. Foreign keys (opcional, cuidado com dados órfãos)
-- ALTER TABLE crm_opportunities 
--   ADD CONSTRAINT fk_opp_subop 
--   FOREIGN KEY (suboperation_id) REFERENCES suboperations(id);
```

---

**Documento criado por:** Kiro AI  
**Última atualização:** 17/12/2025
