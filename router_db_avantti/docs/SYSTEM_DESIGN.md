# SYSTEM_DESIGN

## 1. Objetivo

Documentar o desenho do **router_db_avantti**, um gateway para roteamento seguro de consultas entre APIs e bancos SQL Server, com painel Nuxt.

## 2. Contexto Técnico

- Frontend: Nuxt 4 + Vue 3 + PrimeVue
- Backend: FastAPI (Python)
- Persistência local: SQLite (metadados de projetos/tenants)
- Conectividade externa: SQL Server (`pymssql`/`pyodbc`)
- Execução local integrada: `pnpm dev` com Nuxt + Uvicorn

## 3. Arquitetura de Alto Nível

1. **UI de administração**
   - Cadastro de projetos, chaves e conexões
2. **API Gateway (FastAPI)**
   - Autenticação por API Key
   - Validação de payload e roteamento de queries
3. **Camada de persistência local**
   - SQLite para configuração e controle operacional
4. **Camada de integração SQL Server**
   - Conexões externas e execução de consultas autorizadas

## 4. Fluxos Críticos

### 4.1 Onboarding de projeto

1. Admin cadastra projeto e parâmetros de conexão
2. Sistema gera/associa API Key
3. Configuração é persistida no SQLite

### 4.2 Execução de query roteada

1. Cliente chama API com header de chave
2. Backend valida chave e escopo
3. Query é executada no SQL Server alvo
4. Resultado é normalizado e retornado ao cliente

## 5. Segurança

- API Key obrigatória por projeto
- Validação rigorosa de inputs e parâmetros
- Proibição de concatenação insegura de SQL
- Logs sem exposição de segredos

## 6. Operação

- Backend Python em `backend/app`
- Frontend Nuxt em runtime conjunto
- Logs centralizados para rastreabilidade de chamadas

## 7. Riscos Técnicos

- Conectividade com múltiplos SQL Servers heterogêneos
- Risco de consultas custosas sem limitação/timeout
- Crescimento de metadados locais sem políticas de manutenção
