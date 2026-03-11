# 📦 Backups do Banco de Dados Neon - Portal S4A

**Data do Backup:** 23 de dezembro de 2025  
**Método:** Node.js + postgres library  
**Status:** ✅ Concluído com sucesso

## 🎯 Objetivo

Este diretório contém backups completos das branches **production** e **develop** do banco de dados Neon do Portal S4A, criados para garantir a segurança dos dados e possibilitar restaurações quando necessário.

## 📊 Resumo do Backup

- **2 branches** do Neon Database
- **98 tabelas** no total (37 production + 61 develop)
- **6 arquivos SQL** gerados
- **540 KB** de dados totais
- **Método:** Extração via Node.js (sem dependência do pg_dump)

## 🛠️ Como Foi Feito o Procedimento

### 1. Problema Inicial
O comando `pg_dump` não estava disponível no Windows, então foi criada uma solução alternativa usando Node.js.

### 2. Script Desenvolvido
**Arquivo:** `scripts/backup-neon-nodejs.js`

**Processo:**
1. **Conexão:** Conecta em cada branch usando a biblioteca `postgres`
2. **Descoberta:** Lista todas as tabelas via `information_schema.tables`
3. **Schema:** Extrai estrutura das tabelas (CREATE TABLE, índices, constraints)
4. **Dados:** Extrai todos os dados via SELECT e converte para INSERT statements
5. **Arquivos:** Gera 3 tipos de arquivo por branch (schema, data, full)
6. **Índice:** Cria arquivo JSON com metadados do backup

### 3. Branches Processadas

#### Production Branch
- **URL:** `ep-super-cake-ad2s6vvq.c-2.us-east-1.aws.neon.tech`
- **Branch ID:** `br-bold-cloud-ad7sd46x`
- **Tabelas:** 37 (sistema base em produção)

#### Develop Branch  
- **URL:** `ep-wandering-sound-adjhvpu2-pooler.c-2.us-east-1.aws.neon.tech`
- **Branch ID:** `br-icy-rice-adtsevxz`
- **Tabelas:** 61 (sistema completo com funcionalidades em desenvolvimento)

## 🗂️ Estrutura dos Arquivos Gerados

### Nomenclatura
```
neon-{branch}-{timestamp}-{tipo}.sql
```

**Exemplo:**
- `neon-production-2025-12-23T11-37-04-156Z-full.sql`

### Tipos de Arquivo

#### 1. Schema (`*-schema.sql`)
**Conteúdo:**
- CREATE TABLE statements
- Índices (CREATE INDEX)
- Constraints e chaves estrangeiras
- Estrutura completa do banco

**Tamanho:**
- Production: 19.0 KB
- Develop: 46.9 KB

**Uso:** Recriar estrutura do banco em ambiente limpo

#### 2. Data (`*-data.sql`)
**Conteúdo:**
- INSERT statements para todas as tabelas
- Todos os dados preservados
- Valores NULL, strings, números, JSON, datas

**Tamanho:**
- Production: 228.1 KB  
- Develop: 246.7 KB

**Uso:** Restaurar dados em estrutura existente

#### 3. Full (`*-full.sql`)
**Conteúdo:**
- Schema + Data combinados
- Backup completo e autossuficiente

**Tamanho:**
- Production: 247.1 KB
- Develop: 293.6 KB

**Uso:** Restauração completa (recomendado)

## 🔄 Como Restaurar os Backups

### Pré-requisitos
- PostgreSQL client (`psql`) instalado
- Acesso ao banco de destino
- Permissões de CREATE/INSERT no banco

### 1. Restauração Completa (Recomendado)

```bash
# Restaurar production completa
psql "postgresql://user:pass@host/database" < neon-production-2025-12-23T11-37-04-156Z-full.sql

# Restaurar develop completa  
psql "postgresql://user:pass@host/database" < neon-develop-2025-12-23T11-37-04-156Z-full.sql
```

### 2. Restauração Apenas Schema

```bash
# Criar apenas a estrutura das tabelas
psql "postgresql://user:pass@host/database" < neon-production-2025-12-23T11-37-04-156Z-schema.sql
```

**Quando usar:**
- Criar ambiente de desenvolvimento limpo
- Testar migrações
- Configurar banco para testes

### 3. Restauração Apenas Dados

```bash
# Inserir dados em estrutura existente
psql "postgresql://user:pass@host/database" < neon-production-2025-12-23T11-37-04-156Z-data.sql
```

**Quando usar:**
- Atualizar dados em ambiente existente
- Sincronizar dados entre ambientes
- Restaurar após perda de dados (estrutura intacta)

### 4. Restauração Seletiva

Para restaurar apenas algumas tabelas, edite o arquivo SQL:

```bash
# Extrair apenas uma tabela
grep -A 1000 "CREATE TABLE users" neon-production-*-full.sql | grep -B 1000 "CREATE TABLE" > users-only.sql
```

## 🔍 Verificação da Restauração

Após restaurar, verifique se tudo funcionou:

```sql
-- Contar tabelas
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Verificar dados de uma tabela específica
SELECT COUNT(*) FROM users;

-- Listar todas as tabelas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```

## 📊 Diferenças entre Branches

### Production (37 tabelas)
**Sistema base em produção:**
- `users` - Usuários do sistema
- `employees` - Funcionários (RH)
- `departments` - Departamentos
- `client_portfolio` - Clientes (CRM)
- `crm_opportunities` - Oportunidades de venda
- `crm_orders` - Pedidos
- `products` - Produtos
- `notifications` - Notificações
- `system_settings` - Configurações

### Develop (61 tabelas)
**Sistema completo com funcionalidades em desenvolvimento:**

**Todas as tabelas de production +**

**CMS/Learning Center:**
- `content` - Conteúdos educacionais
- `content_categories` - Categorias de conteúdo
- `content_analytics` - Analytics de conteúdo
- `content_permissions` - Permissões de acesso

**Sistema de Auditoria:**
- `admin_action_log` - Log de ações administrativas
- `permission_audit_log` - Log de mudanças de permissão
- `content_audit_log` - Log de ações em conteúdo

**Sistema de Recomendações:**
- `recommendation_analytics` - Analytics de recomendações
- `recommendation_feedback` - Feedback dos usuários
- `recommendation_history` - Histórico de recomendações

**Progresso do Usuário:**
- `user_content_progress` - Progresso em conteúdos
- `user_progress_summary` - Resumo de progresso
- `user_content_activity` - Atividades do usuário

**Funcionalidades Avançadas:**
- `search_alerts` - Alertas de pesquisa
- `custom_filters` - Filtros personalizados
- `user_preferences` - Preferências do usuário

## 🔍 Arquivo de Índice

**Arquivo:** `backup-index-2025-12-23T11-37-04-156Z.json`

**Contém:**
```json
{
  "timestamp": "2025-12-23T11:37:40.145Z",
  "method": "nodejs-postgres",
  "totalTables": 98,
  "totalSize": 553659,
  "branches": {
    "production": {
      "tables": 37,
      "branch_id": "br-bold-cloud-ad7sd46x"
    },
    "develop": {
      "tables": 61, 
      "branch_id": "br-icy-rice-adtsevxz"
    }
  }
}
```

## ⚠️ Considerações Importantes

### Segurança
- ✅ **Senhas:** Armazenadas como hash bcrypt (seguro)
- ✅ **Tokens:** Não incluídos nos backups
- ✅ **Chaves API:** Armazenadas em variáveis de ambiente (não no banco)
- ⚠️ **Dados sensíveis:** CPFs, emails, nomes estão nos backups

### Compatibilidade
- ✅ **PostgreSQL:** Versão 12+ (Neon usa PostgreSQL 17)
- ✅ **Encoding:** UTF-8
- ✅ **Timezone:** UTC
- ✅ **Constraints:** Preservadas

### Limitações
- ❌ **Sequences:** Valores atuais não preservados (serão resetados)
- ❌ **Triggers:** Não incluídos (sistema não usa)
- ❌ **Views:** Não incluídas (sistema não usa)
- ❌ **Functions:** Não incluídas (sistema não usa)

## 🚀 Cenários de Uso

### 1. Disaster Recovery
```bash
# Restaurar production após falha
psql "postgresql://backup-server/database" < neon-production-*-full.sql
```

### 2. Ambiente de Desenvolvimento
```bash
# Criar ambiente local com dados de produção
psql "postgresql://localhost/intranet_dev" < neon-production-*-full.sql
```

### 3. Testes
```bash
# Ambiente de teste com dados reais
psql "postgresql://test-server/test_db" < neon-develop-*-full.sql
```

### 4. Migração
```bash
# Migrar para novo provedor
psql "postgresql://new-provider/database" < neon-production-*-full.sql
```

## 🔄 Automatização Futura

Para automatizar backups regulares:

```bash
# Adicionar ao cron (Linux/Mac)
0 2 * * * cd /path/to/project && node scripts/backup-neon-nodejs.js

# Ou Task Scheduler (Windows)
# Executar diariamente às 02:00
```

## 📞 Suporte

Em caso de problemas na restauração:

1. **Verificar logs:** Erros do psql indicam problemas específicos
2. **Testar conexão:** `psql "connection_string" -c "SELECT 1"`
3. **Verificar permissões:** Usuário deve ter CREATE/INSERT
4. **Limpar banco:** DROP todas as tabelas antes de restaurar schema

## 📅 Histórico de Backups

| Data | Branches | Tabelas | Tamanho | Status |
|------|----------|---------|---------|--------|
| 2025-12-23 | production, develop | 98 | 540 KB | ✅ Sucesso |

## 🔧 Comandos Úteis

```bash
# Listar arquivos de backup
ls -la backups/*.sql

# Ver tamanho dos arquivos
du -h backups/*.sql

# Contar linhas em um backup
wc -l backups/neon-production-*-full.sql

# Verificar se arquivo está correto
head -20 backups/neon-production-*-full.sql
tail -20 backups/neon-production-*-full.sql
```

---

**Backup criado por:** Kiro AI  
**Script utilizado:** `scripts/backup-neon-nodejs.js`  
**Data de criação:** 23/12/2025 11:37 UTC  
**Próxima revisão:** Conforme necessidade do projeto