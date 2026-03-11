# Guia de Multi-Tenancy e Arquitetura

Este documento descreve como funciona o isolamento de dados (Multi-Tenancy) no Portal Avantti, detalhando a lógica de autenticação, o comportamento para Super Admins e a infraestrutura de banco de dados e versionamento.

---

## 1. Arquitetura Multi-Tenant

O sistema utiliza uma abordagem de **Isolamento Lógico** (Row-Level Security via Aplicação) onde todos os clientes compartilham o mesmo banco de dados e tabelas, mas os dados são segregados pela coluna `company_id`.

### Princípios Básicos
- **Coluna `company_id`**: Presente em todas as tabelas principais (`users`, `employees`, `clients`, `projects`, etc.).
- **Contexto do Usuário**: Cada usuário logado possui um `company_id` associado à sua sessão.
- **Filtragem Automática**: Todas as Server Actions e API Routes utilizam `getCurrentUser()` para obter o ID da empresa e filtrar as queries SQL automaticamente.

---

## 2. Autenticação e Determinação de Contexto

A lógica central reside em `src/lib/auth.ts`.

### Fluxo de Determinação do Tenant (`getCurrentUser`)

1. **Recuperação da Sessão**: O sistema lê o cookie `session_token`.
2. **Verificação de Impersonate**: Verifica se há um cookie `impersonate_user_id` (admin acessando como outro usuário).
3. **Seleção de Empresa (Super Admin)**:
   - Se o usuário é **Super Admin**, o sistema verifica o cookie `selected_company_id`.
   - Se o cookie existir, o contexto muda para a empresa selecionada.
   - Se o cookie **não** existir, o sistema usa o `company_id` nativo do usuário.
4. **Fallback de Segurança (Novo)**:
   - Se um Super Admin não tiver `company_id` definido no banco (NULL) e não tiver selecionado uma empresa:
   - O sistema força automaticamente o **Tenant 2 (Sistema Global)**.
   - **Objetivo**: Impedir que dados do Tenant 1 (ou de clientes) sejam exibidos por acidente.

### Exemplo de Código (`auth.ts`)
```typescript
// Lógica simplificada
const effectiveCompanyId =
  user.is_super_admin && selectedCompId 
    ? selectedCompId 
    : (user.company_id || 2); // 2 = Fallback para Sistema Global
```

---

## 3. Comportamento do Super Admin

O Super Admin possui privilégios especiais para navegar entre tenants.

- **Tenant Padrão**: Definido como **ID 2 (Sistema Global)** no banco de dados.
  - *Correção recente*: O usuário Super Admin teve seu `company_id` atualizado explicitamente para `2` no banco de dados.
- **Seletor de Empresa**: Localizado na Sidebar (menu lateral).
  - Permite alternar a visualização para qualquer empresa ativa.
  - Ao selecionar, define o cookie `selected_company_id` e recarrega a página.
- **Isolamento**: Enquanto visualiza uma empresa específica, o Super Admin vê **apenas** os dados daquela empresa, como se fosse um usuário comum dela.

---

## 4. Infraestrutura e Ambientes

O projeto utiliza uma arquitetura moderna baseada em Git Flow e Database Branching.

### Versionamento (Git)
- **Branch `develop`**:
  - Ambiente de desenvolvimento e testes.
  - Recebe novas features e correções.
  - Conectado ao banco de dados de desenvolvimento.
- **Branch `main` (Production)**:
  - Ambiente de produção estável.
  - Deploy via script `scripts/deploy-production.ps1`.
  - Conectado ao banco de dados de produção.

### Banco de Dados (NeonDB)
O projeto utiliza **NeonDB** (Serverless Postgres), que oferece recursos avançados de branching de banco de dados, alinhados ao Git.

| Ambiente | Branch Git | Branch NeonDB | Descrição |
|----------|------------|---------------|-----------|
| **Dev** | `develop` | `dev` (ou `develop`) | Dados de teste, pode ser resetado ou modificado livremente. |
| **Prod** | `main` | `main` (ou `production`) | Dados reais dos clientes. Backups diários. |

### Fluxo de Deploy
1. Desenvolvimento na branch `develop`.
2. Testes locais conectados ao Neon Dev.
3. Merge para `main`.
4. Deploy para Vercel/Servidor.
5. O ambiente de produção se conecta automaticamente ao Neon Production via variáveis de ambiente (`DATABASE_URL`).

---

## 5. Resumo Técnico para Manutenção

- **Arquivo de Auth**: `src/lib/auth.ts` (Core da lógica).
- **Helper de Tenancy**: `src/lib/tenancy-helper.ts` (Funções auxiliares).
- **Middleware**: `src/middleware.ts` (Proteção de rotas).
- **Banco de Dados**: `src/lib/db.ts` (Conexão Postgres).

### Comandos Úteis
- **Verificar Banco**: `pnpm db:status`
- **Rodar Migrations**: `pnpm db:migrate`
- **Linting**: `pnpm lint`

---

*Documentação gerada em 21/01/2026 após ajustes de padronização de tenancy.*
