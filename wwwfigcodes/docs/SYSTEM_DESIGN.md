# SYSTEM DESIGN

## Objetivo do sistema

Site institucional com páginas públicas, formulário de contato e fluxo administrativo suportado por Supabase (Auth, tabelas e Edge Functions).

## Visão de alto nível

- **Front-end SPA** em React/Vite, renderizado no cliente.
- **Roteamento** com React Router para páginas públicas.
- **UI** composta por componentes reutilizáveis em `src/components` e base shadcn/ui.
- **Backend BaaS** no Supabase para autenticação, persistência e funções serverless.

## Diagrama de arquitetura (alto nível)

```mermaid
flowchart LR
  U[Usuário] --> FE[Front-end SPA\nReact + Vite]
  FE --> RT[React Router\nPáginas públicas]
  FE --> SB[(Supabase)]

  SB --> AU[Auth]
  SB --> DB[(Postgres\nprofiles, clients)]
  SB --> EF[Edge Functions]

  FE -->|invoke| EF
  EF --> CU[create-user]
  EF --> GU[get-users]
  EF --> UU[update-user]
  EF --> SE[send-contact-email]

  SE --> SMTP[SMTP Provider]
  SMTP --> ADM[contato@figcodes.tech]
  SMTP --> CLI[Cliente (confirmação)]
```

## Componentes

### 1) Front-end

- Entrada principal: `src/main.tsx` e `src/App.tsx`.
- Seções da home desacopladas por componente (`HeroSection`, `ServicesSection`, etc.).
- Página dedicada para WhatsUpLeads (`src/pages/WhatsUpLeadsPage.tsx`).
- Cliente Supabase centralizado em `src/integrations/supabase/client.ts`.

### 2) Supabase Edge Functions

- `create-user`: cria usuário no Auth, vincula cliente local e atualiza `profiles`.
- `get-users`: consulta usuários para interfaces administrativas.
- `update-user`: atualiza dados de usuários.
- `send-contact-email`: envio de e-mail para admin + confirmação ao cliente via SMTP.

### 3) Dados e identidade

- **Auth**: gerenciamento de credenciais e identidade.
- **Tabela `profiles`**: metadados de usuário, papel e associação de cliente.
- **Tabela `clients`**: dados de cliente e mapeamento para ID externo (`asaas_customer_id`).

## Fluxos principais

### Fluxo de navegação pública

1. Usuário acessa rota pública.
2. SPA renderiza seções/páginas com dados estáticos e interações locais.
3. Formulários disparam integrações quando necessário.

### Fluxo de contato

1. Usuário envia formulário no front-end.
2. Requisição para `send-contact-email`.
3. Função valida payload e usa SMTP.
4. Admin recebe notificação e cliente recebe confirmação.

### Fluxo de cadastro de usuário

1. Painel administrativo chama `create-user`.
2. Função cria usuário no Auth.
3. Faz vinculação/insert em `clients` quando necessário.
4. Atualiza `profiles` com role e relacionamento.

## Segurança e limites

- Chave `service_role` usada apenas no backend (Edge Functions).
- Front-end usa apenas `anon key`.
- CORS atualmente aberto (`*`) nas funções; ideal restringir em produção.
- Validação de payload presente, mas simples (sem schema formal compartilhado).

## Observabilidade

- Logs via `console.log/error` nas Edge Functions.
- Recomendado evoluir para:
  - IDs de correlação por requisição.
  - Monitoramento de taxa de erro por função.
  - Alertas para falha de SMTP e criação de usuário.