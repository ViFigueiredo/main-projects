# Regras e Diretrizes do Projeto: Chatwoot Manager

Este documento define as principais regras, tecnologias e padrões a serem seguidos no desenvolvimento deste projeto.

## 1. Stack Tecnológica

- **Framework Core**: [Nuxt 3](https://nuxt.com) (Vue 3 + Vite)
- **Linguagem**: TypeScript
- **Gerenciador de Pacotes**: **pnpm** (Obrigatório)
- **UI & Componentes**: 
  - [PrimeVue](https://primevue.org/) (v4+)
  - Tema: Aura (`@primeuix/themes/aura`)
  - Ícones: `@nuxt/icon`
- **Testes**: Vitest (`@nuxt/test-utils`) - **Obrigatório criar testes automatizados para novas features e correções.**
- **Linting**: `@nuxt/eslint`
- **Banco de Dados**: [Neon](https://neon.tech) (PostgreSQL Serverless)
  - **ORM**: [Prisma](https://www.prisma.io/)
  - Ferramentas: Prisma CLI, MCP Neon Database.

## 2. Padrões de Código

### Vue / Nuxt
- **Script Setup**: Utilize sempre `<script setup lang="ts">`.
- **API de Composição**: Prefira Composition API sobre Options API.
- **Auto-imports**: Aproveite os auto-imports do Nuxt (`ref`, `computed`, `useFetch`, etc.) em vez de importá-los manualmente, a menos que necessário para evitar conflitos.
- **Nomes de Componentes**: PascalCase para nomes de arquivos e componentes (ex: `ChatWidget.vue`).

### TypeScript
- **Tipagem**: Use interfaces ou types explícitos para Props, Emits e dados de API.
- **Strict Mode**: O projeto segue as regras estritas do `tsconfig.json` gerado pelo Nuxt.

## 3. Integração com Chatwoot API

O projeto atua como um cliente para as **Application APIs** do Chatwoot.

- **Autenticação**:
  - O Chatwoot possui dois tipos principais de tokens:
    1. **User Access Token**: Para **Application APIs**. Permite que um agente/admin gerencie contatos e conversas de suas contas.
       - Header: `api_access_token`
       - Origem: Configurações de Perfil do Usuário.
    2. **Platform Access Token**: Para **Platform APIs**. Uso restrito a Super Admins para criar contas e usuários via API.
       - Header: `api_access_token` (ou `platform_access_token` em alguns contextos).
       - Origem: Console de Super Admin.
  - O token deve ser gerenciado de forma segura (cookies/storage).
  - Os tokens são configurados por Tenant via interface web (Banco de Dados).
- **Base URL**: Configurável por Tenant via interface web.
- **Domínio de Email**: Configurável por Tenant via interface web (Opcional). Usado para geração automática de emails de novos usuários.
- **Variáveis de Ambiente**:
  - `DATABASE_URL`: URL de conexão com o banco de dados (Neon/Postgres).
  - `NUXT_PUBLIC_SENTRY_DSN`: DSN do Sentry para monitoramento de erros.
- **Endpoints Principais**:
  - `GET /api/v1/accounts/{id}/contacts`
  - `GET /api/v1/accounts/{id}/conversations`
  - `GET /api/v1/accounts/{id}/inboxes`
- **Tratamento de Erros**: Implementar feedback visual (Toast do PrimeVue) para falhas de requisição (401, 403, 500).

## 4. UI/UX (PrimeVue)

- **Tema**: Utilize as variáveis semânticas do tema Aura sempre que possível.
- **Responsividade**: Mobile-first.
- **Componentes**: Priorize o uso de componentes nativos do PrimeVue (DataTable, Dialog, Button) antes de criar soluções customizadas.

## 5. Estrutura de Pastas (Convenção Nuxt)

- `/components`: Componentes Vue reutilizáveis.
- `/pages`: Rotas da aplicação (file-based routing).
- `/composables`: Lógica de negócio reutilizável (ex: `useChatwootClient.ts`).
- `/layouts`: Estruturas de página (Default, Auth).
- `/server`: Rotas de API do lado do servidor (se necessário proxy).

## 6. Git & Versionamento

- **Commits**: Seguir padrão Conventional Commits (feat, fix, chore, docs, style, refactor).
- **Branches**: `master` para produção/estável. Features em branches separadas.
- **Deploy**: Configurado via `vercel.json` para realizar deploy apenas de commits na branch `master` (Ignored Build Step).

## 7. Segurança e Qualidade de Código (OWASP & Clean Code)

### Segurança (OWASP)
- **Validação de Entrada**: Obrigatório uso de **Zod** para validar e sanitizar todos os dados de entrada (formulários, APIs) antes do processamento. Evitar injeção de dados.
- **Headers de Segurança**: Configurados via `nuxt-security` (CSP, CORS, HSTS). Não desabilitar sem justificativa crítica.
- **Dependências**: Manter dependências auditadas (`pnpm audit`). Uso de `eslint-plugin-security` para análise estática.
- **Dados Sensíveis**: Nunca expor tokens ou chaves privadas no client-side. Usar `runtimeConfig` e variáveis de ambiente.

### Design Patterns & SOLID
- **Single Responsibility Principle (SRP)**: Cada componente, composable ou função deve ter uma única responsabilidade.
  - Ex: `useChatwootClient` cuida apenas da comunicação HTTP; Schemas Zod cuidam apenas da validação.
- **Dependency Inversion**: Componentes de UI não devem depender diretamente de `fetch` ou bibliotecas externas, mas sim de abstrações/composables (ex: `useChatwootClient`).
- **Clean Code**:
  - Nomes de variáveis descritivos (evite `data`, `item`, use `contact`, `message`).
  - Funções pequenas e focadas.
  - Fail Fast: Valide pré-condições no início das funções e lance erros explícitos.

## 8. Fluxo de Trabalho e Documentação

- **Documentação Viva**: O arquivo `AGENTS.md` deve ser atualizado **sempre** que houver novas implementações, correções importantes ou mudanças de regras. Mantenha-o como a fonte da verdade.
- **Desenvolvimento Orientado a Testes (ou Testes Contínuos)**:
  - Todo novo componente, composable ou lógica de negócio deve ser acompanhado de seu respectivo teste automatizado (Unitário ou E2E).
  - Regressão: Garanta que correções de bugs incluam testes que reproduzam o cenário de falha.
- **Banco de Dados (Neon + Prisma)**:
  - **ORM**: O projeto utiliza Prisma ORM para interação com o banco de dados.
  - **Schema**: Definido em `prisma/schema.prisma`.
  - **Migrações**:
    - Criar migração: `pnpm prisma migrate dev --name nome_da_migracao` (Desenvolvimento)
    - Aplicar em produção: `pnpm prisma migrate deploy`
  - **Fluxo**:
    1. Alterar `schema.prisma`.
    2. Rodar `pnpm prisma migrate dev` para criar arquivo SQL e atualizar o banco local/dev.
    3. Commitar arquivos de migração (`prisma/migrations`).
  - Projeto Neon: `figchat-manager`.
