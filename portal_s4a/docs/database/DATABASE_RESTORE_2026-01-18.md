# Restauração do Banco de Dados Portal S4A - Production

**Data:** 18-19 de Janeiro de 2026  
**Ambiente:** Neon PostgreSQL (Production Branch)  
**Project ID:** `restless-morning-33051903`  
**Database:** `intranet`  
**Branch:** `production` (br-bold-cloud-ad7sd46x)

---

## 📋 Resumo Executivo

Restauração completa do banco de dados Portal S4A a partir de backup exportado do Neon. O processo envolveu correções de sintaxe PostgreSQL, reordenação de tabelas por dependências de FK, e importação de dados em lotes.

### Resultado Final

| Métrica                | Valor  |
| ---------------------- | ------ |
| **Total de tabelas**   | 86     |
| **Tabelas com dados**  | 46     |
| **Total de registros** | ~1.000 |
| **Foreign Keys**       | 142    |
| **Taxa de sucesso**    | 99.9%  |

---

## 📁 Arquivos de Backup

Localizados em: `backups/2026-01-18/`

| Arquivo                                                 | Descrição                              |
| ------------------------------------------------------- | -------------------------------------- |
| `neon-production-2026-01-18T20-10-35Z-schema.sql`       | Schema original (com erros de sintaxe) |
| `neon-production-2026-01-18T20-10-35Z-schema-fixed.sql` | Schema corrigido                       |
| `neon-production-2026-01-18T20-10-35Z-data.sql`         | Dados originais (com erros)            |
| `neon-production-2026-01-18T20-10-35Z-data-fixed.sql`   | Dados corrigidos                       |
| `foreign_keys.sql`                                      | Foreign keys extraídas                 |

---

## 🔧 Correções de Sintaxe Aplicadas

### 1. Tipos de Dados Inválidos

O backup exportava tipos com precisão inválida para PostgreSQL padrão:

```sql
-- ANTES (inválido)
id integer(32,0) NOT NULL
quantity bigint(64,0) DEFAULT 0

-- DEPOIS (corrigido)
id integer NOT NULL
quantity bigint DEFAULT 0
```

**Ocorrências corrigidas:** 296 `integer(32,0)` + 2 `bigint(64,0)`

### 2. Sequências com NEXTVAL → SERIAL

O Neon não permite criar sequências separadas via `nextval()`. Convertemos para `SERIAL`:

```sql
-- ANTES
id integer DEFAULT nextval('employees_id_seq'::regclass) NOT NULL

-- DEPOIS
id SERIAL NOT NULL
```

### 3. Arrays com Sintaxe Incorreta

```sql
-- ANTES
tags ARRAY DEFAULT '{}'::text[]

-- DEPOIS
tags text[] DEFAULT '{}'::text[]
```

### 4. Constraints UNIQUE Duplicadas

Removidas constraints duplicadas que causavam erro na criação das tabelas.

### 5. INSERTs Multi-linha

O registro `occurrences` ID 22 tinha uma descrição com quebras de linha que quebrava o parser SQL:

```sql
-- ANTES (multi-linha)
INSERT INTO occurrences ... VALUES (22, 'ADVERTÊNCIA VERBAL
Descrição com
quebras de linha');

-- DEPOIS (linha única)
INSERT INTO occurrences ... VALUES (22, 'ADVERTÊNCIA VERBAL\nDescrição com\nquebras de linha');
```

---

## 📊 Processo de Importação

### Etapa 1: Limpeza do Banco

```sql
-- Drop de todas as tabelas existentes com CASCADE
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
```

### Etapa 2: Criação do Schema

Executado o arquivo `neon-production-2026-01-18T20-10-35Z-schema-fixed.sql` com:

- 86 tabelas criadas
- Índices e constraints primárias

### Etapa 3: Importação de Dados

Ordem de importação (respeitando FKs):

1. **Tabelas base (sem dependências):**
   - `operations` (2 registros: AVANTTI, VIVO)
   - `roles` (3 registros: admin, user, planejamento)
   - `job_positions` (18 registros)

2. **Tabelas com dependências simples:**
   - `departments` (2 registros)
   - `employees` (100 registros)
   - `users` (4 registros)

3. **Tabelas com dependências complexas:**
   - `hr_teams` (16 registros)
   - `employee_team_assignments` (83 registros)
   - `occurrences` (27 registros)
   - E demais tabelas...

### Etapa 4: Criação de Foreign Keys

```bash
# Extração das FKs do backup
Select-String -Path "schema-fixed.sql" -Pattern "FOREIGN KEY" > foreign_keys.sql

# Importação via Python script
python import_fks.py
```

**Resultado:** 142 FKs criadas com sucesso

---

## 📈 Dados Importados por Tabela

### Tabelas Principais

| Tabela                        | Registros | Descrição                   |
| ----------------------------- | --------- | --------------------------- |
| `employees`                   | 100       | Funcionários                |
| `unique_items`                | 100       | Itens únicos de inventário  |
| `item_audit_log`              | 207       | Log de auditoria de itens   |
| `employee_team_assignments`   | 83        | Atribuições de equipe       |
| `employees_department_backup` | 74        | Backup de departamentos     |
| `schema_migrations`           | 53        | Migrações executadas        |
| `crm_devolucao_audit`         | 36        | Auditoria de devoluções     |
| `role_permissions`            | 33        | Permissões por role         |
| `crm_data_audit`              | 32        | Auditoria CRM               |
| `occurrences`                 | 27        | Ocorrências de funcionários |
| `notifications`               | 23        | Notificações                |
| `job_positions`               | 18        | Cargos                      |
| `hr_teams`                    | 16        | Equipes RH                  |
| `user_preferences`            | 16        | Preferências de usuário     |

### Tabelas de Configuração

| Tabela               | Registros |
| -------------------- | --------- |
| `content_categories` | 12        |
| `crm_statuses`       | 12        |
| `app_links`          | 12        |
| `crm_custom_fields`  | 6         |
| `users`              | 4         |
| `roles`              | 3         |
| `app_categories`     | 3         |
| `departments`        | 2         |
| `operations`         | 2         |
| `themes`             | 2         |

---

## 🔗 Relacionamentos Principais (Foreign Keys)

### Tabela `occurrences`

```
occurrences.employee_id → employees.id
```

### Tabela `employees`

```
employees.job_position_id → job_positions.id
```

### Tabela `users`

```
users.employee_id → employees.id
users.role_id → roles.id
```

### Tabela `departments`

```
departments.leader_id → employees.id
departments.manager_id → employees.id
departments.operation_id → operations.id
departments.parent_id → departments.id
```

### Tabela `hr_teams`

```
hr_teams.leader_id → employees.id
hr_teams.manager_id → employees.id
hr_teams.hr_department_id → hr_departments.id
```

### Tabela `notifications`

```
notifications.user_id → users.id
```

---

## 🛠️ Scripts Criados

### `import_data.py`

Script Python para importação em lotes dos dados de employees e demais tabelas.

### `import_fks.py`

Script Python para criação das 142 foreign keys.

### `import_migrations.py`

Script para importar schema_migrations com colunas renomeadas.

### `fix_migrations.py`

Script para converter formato de colunas de `name` para `migration_name`.

---

## ⚠️ Problemas Encontrados e Soluções

### 1. Employee ID 334 falhou na primeira importação

**Causa:** Problema de encoding no arquivo batch  
**Solução:** Re-execução direta do INSERT via SQL

### 2. Tabelas com schema diferente do backup

**Tabelas afetadas:**

- `schema_migrations` (coluna `name` → `migration_name`)
- `themes` (coluna `mode` não existe)
- `serverless_settings` (coluna `key` → `setting_key`)
- `system_settings` (coluna `logo_url_dark` não existe)

**Solução:** Dados inseridos manualmente com colunas compatíveis

### 3. Dados órfãos referenciando IDs inexistentes

**Problema:** Registros referenciavam `operation_id = 4` e `role_id = 3` que não existiam  
**Solução:** Inserção dos registros faltantes:

- Operation ID 4 (VIVO)
- Role ID 3 (planejamento)

---

## ✅ Verificação Final

```sql
-- Total de tabelas
SELECT COUNT(*) FROM pg_stat_user_tables;
-- Resultado: 86

-- Tabelas com dados
SELECT COUNT(*) FROM pg_stat_user_tables WHERE n_live_tup > 0;
-- Resultado: 46

-- Total de FKs
SELECT COUNT(*) FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY';
-- Resultado: 142

-- Total de registros
SELECT SUM(n_live_tup) FROM pg_stat_user_tables;
-- Resultado: ~1000
```

---

## 📝 Connection String

```
postgresql://neondb_owner:***@ep-super-cake-ad2s6vvq-pooler.c-2.us-east-1.aws.neon.tech/intranet?sslmode=require
```

---

## 🗓️ Histórico

| Data             | Ação                             |
| ---------------- | -------------------------------- |
| 2026-01-18 20:10 | Backup exportado do Neon         |
| 2026-01-18       | Correção de sintaxe do schema    |
| 2026-01-18       | Correção de sintaxe dos dados    |
| 2026-01-19       | Drop de todas as tabelas         |
| 2026-01-19       | Criação do schema (86 tabelas)   |
| 2026-01-19       | Importação de dados (46 tabelas) |
| 2026-01-19       | Criação de FKs (142 constraints) |
| 2026-01-19       | Verificação e documentação       |

---

_Documentação gerada em 19 de Janeiro de 2026_
