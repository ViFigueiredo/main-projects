# Fix: Migração Completa para REST API

## Problema
O sistema estava usando `asyncpg` (SQL direto) para algumas operações de banco de dados, o que causava o erro:
```
invalid DSN: scheme is expected to be "postgresql", got "https"
```

Isso acontecia porque a variável `SUPABASE_URL` é uma URL HTTPS, não uma connection string PostgreSQL.

## Causa Raiz
- Várias funções em `database.py` ainda usavam `supabase_db` (asyncpg)
- Tabelas necessárias não existiam no Supabase
- Funções admin em `main.py` usavam SQL direto

## Solução Aplicada

### 1. Tabelas Criadas no Supabase
Criadas via MCP com RLS ativo:
- `crawl_runs` - Execuções de crawling
- `crawled_urls` - URLs descobertas pelo crawler
- `browser_analyses` - Resultados de análise do browser
- `raw_vulnerabilities` - Vulnerabilidades brutas
- `fuzz_runs` - Execuções de fuzzing
- `fuzz_attempts` - Tentativas de fuzzing

### 2. Funções Convertidas para REST API

#### Em `backend/db/database.py`:
- ✅ `save_raw_vulnerabilities()` - Salvar vulnerabilidades brutas
- ✅ `get_raw_vulnerabilities()` - Buscar vulnerabilidades brutas
- ✅ `save_analysis_result()` - Salvar resultado de análise
- ✅ `get_analysis_result()` - Buscar resultado de análise
- ✅ `update_analysis_vulnerabilities()` - Atualizar vulnerabilidades
- ✅ `get_crawl_runs_for_session()` - Buscar crawl runs
- ✅ `delete_crawl_run()` - Deletar crawl run
- ✅ `clear_crawl_data()` - Limpar dados de crawl
- ✅ `get_crawled_urls()` - Buscar URLs crawled
- ✅ `get_session_vulnerabilities()` - Buscar vulnerabilidades da sessão
- ✅ `add_crawl_log()` - Adicionar log de crawl
- ✅ `get_crawl_logs()` - Buscar logs de crawl
- ✅ `create_fuzz_run()` - Criar fuzz run
- ✅ `update_fuzz_run()` - Atualizar fuzz run
- ✅ `get_fuzz_runs_for_crawl_run()` - Buscar fuzz runs
- ✅ `save_fuzz_attempt()` - Salvar tentativa de fuzz
- ✅ `get_fuzz_attempts()` - Buscar tentativas de fuzz
- ✅ `clear_history()` - Limpar histórico
- ✅ `get_vulnerabilities_from_requests()` - Buscar vulnerabilidades de requests

#### Em `backend/main.py`:
- ✅ `get_active_sessions()` - Buscar sessões ativas (admin)
- ✅ `get_all_users()` - Listar usuários (admin)
- ✅ `delete_user()` - Deletar usuário (admin)
- ✅ `update_user()` - Atualizar usuário (admin)
- ✅ `end_session()` - Encerrar sessão (admin)

### 3. Arquivos Removidos
- `backend/db/database_rls_updates.py` - Arquivo legado não mais necessário

### 4. Importações Atualizadas
- `main.py`: Removido import de `supabase_db`, adicionado `rest_client`

## Como Testar

1. Iniciar o backend:
```bash
cd backend
python main.py
```

2. Verificar que não há erros de `asyncpg` ou `DSN`

3. Testar funcionalidades:
   - Login/Logout
   - Criar sessão
   - Executar crawling
   - Ver histórico
   - Painel admin

## Arquivos Modificados
- `backend/db/database.py` - Reescrito completamente para REST API
- `backend/main.py` - Funções admin convertidas para REST API
- `backend/db/database_rls_updates.py` - Removido

## Tabelas no Supabase (Todas com RLS)
| Tabela | Descrição | Status |
|--------|-----------|--------|
| sessions | Sessões de análise | ✅ Existia |
| requests | Requisições HTTP | ✅ Existia |
| crawl_logs | Logs de crawling | ✅ Existia |
| false_positive_rules | Regras de falso positivo | ✅ Existia |
| users | Usuários | ✅ Existia |
| crawl_runs | Execuções de crawling | ✅ Criada |
| crawled_urls | URLs descobertas | ✅ Criada |
| browser_analyses | Análises do browser | ✅ Criada |
| raw_vulnerabilities | Vulnerabilidades brutas | ✅ Criada |
| fuzz_runs | Execuções de fuzzing | ✅ Criada |
| fuzz_attempts | Tentativas de fuzzing | ✅ Criada |

## Status
✅ Resolvido

## Data
2025-12-13
