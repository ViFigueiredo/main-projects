# Regras e Diretrizes do Projeto: Router API DB (Gateway de Conexão de APIs e Bancos de Dados)

Este documento define as principais regras, tecnologias e padrões a serem seguidos no desenvolvimento deste projeto.

## 1. Stack Tecnológica

- **Frontend**: Nuxt 4, Vue 3, PrimeVue, Tailwind CSS.
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy.
- **Bancos de Dados**:
  - **SQLite**: Armazenamento local de metadados e configurações de tenants.
  - **SQL Server**: Gateway de conexão para bancos de dados externos via `pymssql`.
- **Utilitários**: Pydantic, Uvicorn, Concurrently.

## 2. Padrões de Código

## 3. UI/UX

### 3.1. Padrões de Interface (UI/UX Guidelines)

## 4. Estrutura de Pastas

- `backend/app/`: Backend em Python (FastAPI).
  - `models.py`: Modelos SQLAlchemy para SQLite.
  - `schemas.py`: Esquemas Pydantic para validação.
  - `database.py`: Gerenciamento de SQLite e SQL Server.
  - `auth.py`: Autenticação via API Key.
  - `logger.py`: Configuração de logging do backend.
  - `routes/`: Endpoints de Projetos e Queries.
- `logs/`: Diretório de logs (backend e frontend).
- `app/`: Frontend Nuxt 4 (Vue 3) com **PrimeVue** e **Tailwind CSS**.
- `server/plugins/`: Plugins Nitro (incluindo logger do servidor).
- `app/plugins/`: Plugins Nuxt (incluindo handler de erro do cliente).

## 5. Configuração e Integrações

### 5.1 Variáveis de Ambiente Gerais
- `API_URL`: URL base do backend Python (ex: `http://localhost:8000`).
- `SQLITE_DB_PATH`: Caminho do banco de dados SQLite principal.
- `SQL_SERVER_HOST`: Host global do SQL Server.
- `SQL_SERVER_PORT`: Porta global do SQL Server.
- `SQL_SERVER_USER`: Usuário master do SQL Server.
- `SQL_SERVER_PASSWORD`: Senha master do SQL Server.
- `API_KEY_HEADER`: Nome do header de autenticação (padrão: `x-api-key`).

### 5.2 Autenticação e Sessão
- Autenticação baseada em API Key por projeto, validada pelo backend Python. Cada projeto cadastrado possui uma `api_key` única.

### 5.3Monitoramento (Sentry)

### 5.4 Banco de Dados (Prisma)

## 6. Git & Versionamento

## 7. Segurança e Qualidade de Código (OWASP & Clean Code)

### 7.1. Segurança (OWASP)
- **Validação de Entrada**: Obrigatório uso de **Zod** para validar e sanitizar todos os dados de entrada (formulários, APIs) antes do processamento. Evitar injeção de dados.
- **Headers de Segurança**: Configurados via `nuxt-security` (CSP, CORS, HSTS). Não desabilitar sem justificativa crítica.
- **Dependências**: Manter dependências auditadas (`pnpm audit`). Uso de `eslint-plugin-security` para análise estática.
- **Dados Sensíveis**: Nunca expor tokens ou chaves privadas no client-side. Usar `runtimeConfig` e variáveis de ambiente.
- **Sessões**: Tokens JWT devem usar segredo definido via `JWT_SECRET` em produção; evitar fallbacks inseguros. Respeitar política de expiração mencionada em “Autenticação e Sessão”.

### 7.2. Design Patterns & SOLID
- **Single Responsibility Principle (SRP)**: Cada componente, composable ou função deve ter uma única responsabilidade.
  - Ex: `useChatwootClient` cuida apenas da comunicação HTTP; Schemas Zod cuidam apenas da validação.
- **Dependency Inversion**: Componentes de UI não devem depender diretamente de `fetch` ou bibliotecas externas, mas sim de abstrações/composables (ex: `useChatwootClient`).
- **Clean Code**:
  - Nomes de variáveis descritivos (evite `data`, `item`, use `contact`, `message`).
  - Funções pequenas e focadas.
  - Fail Fast: Valide pré-condições no início das funções e lance erros explícitos.

## 8. Fluxo de Trabalho e Documentação

- **Documentação Viva**: O arquivo `AGENTS.md` deve ser atualizado **sempre** que houver novas implementações, correções importantes ou mudanças de regras. Mantenha-o como a fonte da verdade.
- **Testes Automatizados (Vitest)**:
  - **Estado Atual**: Infraestrutura configurada, mas cobertura pendente.
  - **Prioridade**: Implementar testes unitários para endpoints da API (`server/api`) e utilitários críticos.
  - **Regra**: Novas features complexas devem incluir testes. Correções de bugs críticos devem incluir testes de regressão sempre que possível.
- **Banco de Dados (Neon + Prisma)**:
  - **ORM**: O projeto utiliza Prisma ORM para interação com o banco de dados.
  - **Schema**: Definido em `prisma/schema.prisma`.
  - **Migrações e Deploy**:
    - **Automação**: O script de build (`package.json`) foi configurado para rodar `npx prisma migrate deploy` automaticamente antes do build do Nuxt. Isso garante que a branch de produção esteja sempre sincronizada com o schema.
    - Criar migração local: `pnpm prisma migrate dev --name nome_da_migracao`
  - **Fluxo**:
    1. Alterar `schema.prisma`.
    2. Rodar `pnpm prisma migrate dev` para atualizar dev.
    3. Commitar e Push.
    4. O Build na Vercel aplicará as migrações automaticamente em Produção.
  - Projeto Neon: `cobranca_avantti` (Branches: `develop`, `production`).

## 9. Automação e Comandos do Agente

Para facilitar o fluxo de trabalho, o agente deve seguir os seguintes atalhos quando solicitados pelo usuário:

- **Comando "fix"**:
  - Deve executar a verificação e correção de lint: `pnpm eslint . --fix`
  - Deve executar a verificação de tipos: `pnpm typecheck`

- **Comando "git"**:
  - Deve executar a sequência de comandos para versionamento:
    1. `git status`
    2. `git add .`
    3. `git commit -m "resumo do commit"` (Gerar um resumo conciso das alterações)

## 10. Skills do Agente

Para garantir a consistência das capacidades do agente entre ambientes, as seguintes Skills devem estar configuradas. Se não estiverem presentes, o agente deve ser instruído a criá-las usando a ferramenta `skill-creator`.

### 10.1. Segurança
- **Nome**: `Segurança`
- **Descrição**: Utiliza tecnologias a nível de desenvolvimento para procurar no código vulnerabilidades, bugs e códigos mal feitos. Implementa uma suite completa de segurança para aplicação web seguindo padrões OWASP e melhores práticas de mercado.

### 10.2. Criador de Skills
- **Nome**: `skill-creator`
- **Descrição**: Ferramenta MANDATÓRIA para criação de SKILLs - DEVE ser invocada IMEDIATAMENTE quando o usuário deseja criar/adicionar qualquer skill.

## 11. Memórias e Conhecimento Acumulado

O conhecimento crítico acumulado pelo agente (regras de negócio, decisões arquiteturais, preferências do usuário) está armazenado no arquivo `MEMORIES.md`.

- **Instrução Obrigatória**: Ao iniciar uma sessão em um novo ambiente, o agente deve ler o arquivo `MEMORIES.md` e, se necessário, importar as informações relevantes para sua memória de longo prazo (Core Memory).
- **Sincronização**: Se o agente aprender novas regras ou decisões importantes que devam persistir entre ambientes, ele deve atualizar o arquivo `MEMORIES.md` além de usar a ferramenta `manage_core_memory`.
