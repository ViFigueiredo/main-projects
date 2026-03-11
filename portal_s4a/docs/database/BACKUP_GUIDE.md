# 📦 Guia de Backup - Portal S4A

## 🎯 Scripts Disponíveis

### 1. Backup apenas da PRODUCTION
```bash
# Via npm script (recomendado)
pnpm backup:production

# Ou diretamente
node scripts/backup-production-only.js
```

### 2. Backup de todas as branches (production + develop)
```bash
# Via npm script
pnpm backup:all

# Ou diretamente
node scripts/backup-neon-nodejs.js
```

## 📁 Estrutura dos Backups

```
backups/
├── YYYY-MM-DD/                    # Pasta por data
│   ├── neon-production-timestamp-schema.sql    # Schema apenas
│   ├── neon-production-timestamp-data.sql      # Dados apenas
│   ├── neon-production-timestamp-full.sql      # Schema + Dados
│   └── backup-production-timestamp.json        # Índice do backup
└── README.md
```

## 🔍 Informações do Backup

### Arquivo de Índice (JSON)
Cada backup gera um arquivo JSON com:
- **Timestamp** do backup
- **Número de tabelas** processadas
- **Tamanhos** dos arquivos gerados
- **Informações de conexão** (sem credenciais)
- **Lista de arquivos** criados

### Tipos de Arquivo SQL

1. **`*-schema.sql`** - Apenas estrutura das tabelas
   - CREATE TABLE statements
   - Constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE)
   - Índices
   - Sem dados

2. **`*-data.sql`** - Apenas dados
   - TRUNCATE statements
   - INSERT statements
   - Sem estrutura

3. **`*-full.sql`** - Completo
   - Schema + Dados
   - Pronto para restauração completa

## 🔄 Como Restaurar

### Restauração Completa
```bash
# Restaurar tudo (schema + dados)
psql "postgresql://user:pass@host/db" < neon-production-timestamp-full.sql
```

### Restauração Apenas Schema
```bash
# Apenas estrutura das tabelas
psql "postgresql://user:pass@host/db" < neon-production-timestamp-schema.sql
```

### Restauração Apenas Dados
```bash
# Apenas dados (tabelas devem existir)
psql "postgresql://user:pass@host/db" < neon-production-timestamp-data.sql
```

## ⚙️ Configuração

### Pré-requisitos
- Node.js instalado
- Arquivo `.env.local` com `DATABASE_URL` configurado
- Dependência `postgres` instalada (`pnpm install`)

### Variável de Ambiente
```bash
# .env.local
DATABASE_URL=postgresql://neondb_owner:password@endpoint/intranet?sslmode=require&channel_binding=require
```

## 📊 Exemplo de Saída

```
🔄 Iniciando backup da branch PRODUCTION do Neon...
📅 Timestamp: 2025-01-18T15-30-45-123Z
📁 Diretório: D:\Win_Projetos\portal_s4a\backups\2025-01-18
🔗 URL: postgresql://neondb_owner:***@ep-super-cake-ad2s6vvq.c-2.us-east-1.aws.neon.tech/intranet

📦 Fazendo backup da branch PRODUCTION
  🔍 Verificando conexão...
  📊 Database: intranet
  👤 User: neondb_owner
  📋 Obtendo lista de tabelas...
  📊 Encontradas 42 tabelas
    • [1/42] Processando: users
    • [2/42] Processando: companies
    • [3/42] Processando: plans
    ...
  💾 Salvando arquivos...
  ✅ Schema salvo: neon-production-2025-01-18T15-30-45-123Z-schema.sql
  ✅ Dados salvos: neon-production-2025-01-18T15-30-45-123Z-data.sql
  ✅ Backup completo salvo: neon-production-2025-01-18T15-30-45-123Z-full.sql
  📏 Tamanhos:
     Schema: 25.3 KB
     Dados: 156.7 KB
     Completo: 182.0 KB

📋 Índice de backup criado: backup-production-2025-01-18T15-30-45-123Z.json

🎉 Backup da PRODUCTION concluído com sucesso!
📁 Localização: D:\Win_Projetos\portal_s4a\backups\2025-01-18
📊 Resumo:
   • 1 branch (production)
   • 42 tabelas
   • 3 arquivos SQL + 1 índice
   • 0.18 MB total
```

## 🚨 Troubleshooting

### Erro: "DATABASE_URL não encontrada"
```bash
# Verificar se .env.local existe
ls -la .env.local

# Verificar conteúdo (sem mostrar senha)
grep DATABASE_URL .env.local
```

### Erro de Conexão
```bash
# Testar conexão manualmente
psql "$DATABASE_URL" -c "SELECT current_database();"
```

### Erro de Permissões
```bash
# Verificar se pasta backups é gravável
mkdir -p backups/test
rmdir backups/test
```

## 📅 Automação

### Backup Diário (Cron)
```bash
# Adicionar ao crontab (Linux/Mac)
0 2 * * * cd /path/to/portal_s4a && node scripts/backup-production-only.js

# Task Scheduler (Windows)
# Criar tarefa para executar diariamente às 02:00
# Comando: node
# Argumentos: scripts/backup-production-only.js
# Diretório: C:\path\to\portal_s4a
```

### Backup Antes de Deploy
```bash
# Adicionar ao script de deploy
pnpm backup:production
pnpm deploy:production
```

## 🔐 Segurança

### Boas Práticas
- ✅ Backups são armazenados localmente
- ✅ Credenciais não são salvas nos arquivos
- ✅ Conexão usa SSL (sslmode=require)
- ✅ Arquivos SQL podem ser versionados (sem credenciais)

### Recomendações
- 🔄 Fazer backup antes de mudanças importantes
- 📅 Manter backups regulares (diário/semanal)
- 🗂️ Organizar por data para fácil localização
- 💾 Considerar backup em nuvem para segurança extra

---

**💡 Dica:** Execute `pnpm backup:production` regularmente para manter seus dados seguros!