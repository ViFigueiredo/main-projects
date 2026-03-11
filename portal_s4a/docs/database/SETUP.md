# Database Setup - Neon Database

## Informações do Banco de Dados

**Projeto**: ITSM (ID: `restless-morning-33051903`)  
**Branch**: production (ID: `br-shiny-dust-adlbe5bh`)  
**Database**: intranet  
**PostgreSQL Version**: 17

## Processo para Criar Novas Tabelas

Sempre que criar uma nova tabela, seguir estes passos:

### 1. Adicionar SQL no código

Editar `src/lib/db.ts` na função `initializeDatabase()` e adicionar o CREATE TABLE com seus índices.

### 2. Executar no Neon Database via MCP

```typescript
// Parâmetros corretos para usar com MCP Neon:
{
  "projectId": "restless-morning-33051903",
  "branchId": "br-shiny-dust-adlbe5bh",
  "databaseName": "intranet"
}
```

### 3. Verificar se a tabela foi criada

Usar `mcp_neondatabase__describe_table_schema` ou `mcp_neondatabase__get_database_tables` para confirmar.

## Tabelas Existentes

- app_categories
- app_links
- client_portfolio
- employees
- job_positions
- occurrences
- powerbi_report_assignments
- powerbi_reports
- role_permissions
- roles
- system_settings
- themes
- users

## Connection String

```
postgresql://neondb_owner:npg_8UYDu9EoflOb@ep-plain-cloud-adsyllso-pooler.c-2.us-east-1.aws.neon.tech/intranet?sslmode=require&channel_binding=require
```

## Alterações Aplicadas no Banco

### Tabela `employees`

#### 2025-11-12 - Remoção de constraints NOT NULL

Removidos constraints NOT NULL de campos legados:

```sql
ALTER TABLE employees ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN status DROP NOT NULL;
```

**Motivo**: Campos legados. O sistema agora usa `registration_date` e `employee_status`.

#### 2025-11-12 - Adição de campos opcionais

Adicionados campos de dados pessoais opcionais:

```sql
ALTER TABLE employees
  ADD COLUMN gender TEXT NULL,
  ADD COLUMN education_level TEXT NULL;
```

**Motivo**: Campos necessários para cadastro completo de funcionários. Ambos são opcionais e aceitam valores da enumeração definida no schema Zod.

## Comandos Úteis

### Listar todas as tabelas

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Verificar schema de uma tabela

Usar MCP: `mcp_neondatabase__describe_table_schema`

### Executar SQL

Usar MCP: `mcp_neondatabase__run_sql` ou `mcp_neondatabase__run_sql_transaction`
