# Regras e Diretrizes do Projeto: AvanttiCob (Gestão de Cobrança)

Este documento define as principais regras, tecnologias e padrões a serem seguidos no desenvolvimento deste projeto.

## 1. Stack Tecnológica

- **Framework Core**: [Nuxt 4](https://nuxt.com) (Vue 3 + Vite)
- **Linguagem**: TypeScript
- **Gerenciador de Pacotes**: **pnpm** (Obrigatório)
- **UI & Estilização**: 
  - [PrimeVue](https://primevue.org/) (v4+)
    - Tema: Aura (`@primeuix/themes/aura`)
  - [Tailwind CSS](https://tailwindcss.com/) (v4+)
  - Ícones: `@nuxt/icon`
- **Banco de Dados**: [Neon](https://neon.tech) (PostgreSQL Serverless)
  - **ORM**: [Prisma](https://www.prisma.io/) (v6+)
- **Storage**: [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html) (S3 Compatible)
  - **SDK**: `@aws-sdk/client-s3`
- **Monitoramento**: [Sentry](https://sentry.io/) (`@sentry/nuxt`)
- **Segurança**: `nuxt-security`, `zod`
- **Testes**: Vitest (`@nuxt/test-utils`) - **Obrigatório criar testes automatizados para novas features e correções.**
- **Linting**: `@nuxt/eslint`
- Ferramentas: Prisma CLI, MCP Neon Database.

## 2. Padrões de Código

### Vue / Nuxt
- **Script Setup**: Utilize sempre `<script setup lang="ts">`.
- **API de Composição**: Prefira Composition API sobre Options API.
- **Auto-imports**: Aproveite os auto-imports do Nuxt (`ref`, `computed`, `useFetch`, etc.).
- **Nomes de Componentes**: PascalCase para nomes de arquivos e componentes (ex: `CustomerList.vue`).

### TypeScript
- **Tipagem**: Use interfaces ou types explícitos para Props, Emits e dados.
- **Strict Mode**: O projeto segue as regras estritas do `tsconfig.json`.

## 3. UI/UX (PrimeVue + Tailwind)

- **Tema**: Utilize o tema Aura do PrimeVue.
- **Estilização**: Utilize classes utilitárias do Tailwind CSS para layout e espaçamentos.
- **Componentes**: Priorize componentes nativos do PrimeVue.

### 3.1. Padrões de Interface (UI/UX Guidelines)

#### Sidebar (Navegação)
- **Persistência**: O estado (expandido/colapsado) deve ser persistido via cookie (`sidebar:collapsed`) com validade longa (1 ano).
- **Responsividade**: Deve se adaptar suavemente sem quebrar o layout.
- **Estabilidade Visual**: A área do logo na sidebar deve manter altura fixa para evitar saltos visuais ao carregar/alternar estado. Padrão atual: cabeçalho de logo com altura constante.

#### Relatórios
- **Nomenclatura**: A seção principal de relatórios deve ser denominada "Relatórios Gerais" (Sidebar e Título da Página).
- **Gráficos**: Gráficos de Safra devem exibir porcentagem de adimplência e contagem de pendências no título.
- **Filtros (Relatórios Gerais)**: Deve oferecer filtros com multi seleção para `Responsáveis`, `Filiais` e `Operações` usando componentes PrimeVue `MultiSelect`, aplicando os filtros tanto nos gráficos quanto na listagem detalhada.

#### Auditoria (Audit Logs)
- **Layout Padrão**:
  - Modal com largura fixa de `40rem` (ajustável em mobile).
  - Componente `Timeline` do PrimeVue.
  - Alinhamento: Data/Hora à esquerda (slot `opposite`), Detalhes à direita (slot `content`).
  - Detalhes dentro de um card com fundo sutil (`bg-slate-50 dark:bg-slate-800`).
- **Linguagem**:
  - **Ações**: DEVEM ser traduzidas (ex: `CREATE` -> "Criação", `UPDATE` -> "Atualização").
  - **Detalhes**: Nomes de campos técnicos (ex: `dueDate`, `amount`, `status`) DEVEM ser substituídos por labels amigáveis (ex: "Data de Vencimento", "Valor", "Status").
- **Registro de Usuário**:
  - O backend deve sempre identificar o usuário logado (`getUserFromEvent`) para associar corretamente ao log. Evitar fallback para usuário "Sistema" (ID 1) quando o contexto de autenticação estiver disponível.

## 4. Estrutura de Pastas (Convenção Nuxt)

*Nota: Diretórios devem ser criados conforme a necessidade.*

- `/components`: Componentes Vue reutilizáveis.
- `/pages`: Rotas da aplicação.
- `/layouts`: Estruturas de página.
- `/composables`: Lógica de negócio reutilizável.
- `/assets`: Recursos estáticos (CSS, Imagens).
- `/server`: Lógica do Backend (H3).
  - `/api`: Endpoints da API organizados por domínio (ex: `customers`, `invoices`, `auth`).
  - `/utils`: Utilitários compartilhados (ex: `s3.ts`, `session.ts`).

## 5. Configuração e Integrações

### Variáveis de Ambiente Gerais
- `NUXT_ENABLE_DEV_LOGIN_BYPASS`: `true` para desenvolvimento local rápido.
- `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`: Credenciais do super admin.
  
### Autenticação e Sessão
- **Cookie da Sessão (`auth_token`)**:
  - Em produção: `httpOnly`, `sameSite=strict`, `secure`.
  - Expiração baseada em “Lembrar de mim”:
    - Com “Lembrar de mim”: expira em 7 dias.
    - Sem “Lembrar de mim”: expira em 2 horas.
- **Bypass de Login (Dev)**:
  - Controlado por `NUXT_ENABLE_DEV_LOGIN_BYPASS`.
  - Só é considerado em ambiente de desenvolvimento e host localhost.
  - Quando desativado, nenhuma autoautenticação é aplicada; sessão só persiste se o cookie ainda estiver válido.

### Monitoramento (Sentry)
- Integração via `@sentry/nuxt`.
- **Client-side**: `NUXT_PUBLIC_SENTRY_DSN`, `NUXT_PUBLIC_SENTRY_ENVIRONMENT`.
- **Build/Server**: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`.

### Banco de Dados (Neon + Prisma)
- **Schema**: `prisma/schema.prisma` (Definição de modelos).
- **Config**: `prisma.config.ts` (Configuração de conexão).
- **Fluxo**:
  1. Editar `schema.prisma`.
  2. `npx prisma migrate dev` (Aplicar mudanças locais).
  3. `npx prisma generate` (Atualizar Client).

### Object Storage (Backblaze B2 / S3)
- Utiliza `@aws-sdk/client-s3`.
- Cliente configurado em `server/utils/s3.ts`.
- Variáveis de ambiente obrigatórias:
  - `NUXT_S3_ENDPOINT`
  - `NUXT_S3_REGION`
  - `NUXT_S3_BUCKET`
  - `NUXT_S3_ACCESS_KEY_ID`
  - `NUXT_S3_SECRET_ACCESS_KEY`

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
- **Sessões**: Tokens JWT devem usar segredo definido via `JWT_SECRET` em produção; evitar fallbacks inseguros. Respeitar política de expiração mencionada em “Autenticação e Sessão”.

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

### Segurança
- **Nome**: `Segurança`
- **Descrição**: Utiliza tecnologias a nível de desenvolvimento para procurar no código vulnerabilidades, bugs e códigos mal feitos. Implementa uma suite completa de segurança para aplicação web seguindo padrões OWASP e melhores práticas de mercado.

### Criador de Skills
- **Nome**: `skill-creator`
- **Descrição**: Ferramenta MANDATÓRIA para criação de SKILLs - DEVE ser invocada IMEDIATAMENTE quando o usuário deseja criar/adicionar qualquer skill.

## 11. Memórias e Conhecimento Acumulado

O conhecimento crítico acumulado pelo agente (regras de negócio, decisões arquiteturais, preferências do usuário) está armazenado no arquivo `MEMORIES.md`.

- **Instrução Obrigatória**: Ao iniciar uma sessão em um novo ambiente, o agente deve ler o arquivo `MEMORIES.md` e, se necessário, importar as informações relevantes para sua memória de longo prazo (Core Memory).
- **Sincronização**: Se o agente aprender novas regras ou decisões importantes que devam persistir entre ambientes, ele deve atualizar o arquivo `MEMORIES.md` além de usar a ferramenta `manage_core_memory`.

## 12. Atualizações Recentes (Segurança e Acesso)

- **Usuários (Riscos 1, 2 e 3)**:
  - Endpoints de usuários agora exigem sessão autenticada e validação de papel para operações sensíveis.
  - Criação/edição/exclusão de usuário restritas a `SuperAdmin` e `Administrator`.
  - Auditoria de usuário passou a registrar o **ator logado** (`userId` do executor) e `entityType/entityId` do alvo.
  - Proteções adicionadas:
    - impedir autoexclusão de usuário;
    - impedir remoção/edição de `SuperAdmin` por não-`SuperAdmin`;
    - impedir remoção/rebaixamento do último `SuperAdmin`.

- **Exportação de dados**:
  - Exportação permitida apenas para: `SuperAdmin`, `Administrator` e `Manager`.
  - Regra aplicada no frontend (botões) e no backend (endpoints de exportação).

- **Escopo por Filial no Usuário**:
  - Novo campo no usuário: `allowedBranchIds` (lista de filiais permitidas).
  - Cadastro/edição de usuário permite definir múltiplas filiais de acesso.
  - Se `allowedBranchIds` estiver vazio, comportamento padrão permanece sem restrição de filial.
  - Quando preenchido, o backend restringe dados por filial em módulos-chave (Pedidos, Faturas, Relatórios, Dashboard e consultas relacionadas), impedindo acesso fora do escopo.

- **Deploy com Docker Swarm**:
  - Adicionados artefatos de containerização: `Dockerfile`, `.dockerignore`, `docker/docker-entrypoint.sh` e `docker-stack.yml`.
  - Deploy em Swarm documentado em `docs/deploy/docker-swarm.md`.
  - O startup do container suporta migração automática do Prisma via `RUN_MIGRATIONS` (`true` por padrão).
  - Variáveis de ambiente de referência para Swarm em `.env.swarm.example`.
  - Script de automação GHCR disponível em `scripts/deploy-ghcr.ps1`, usando `GITHUB_USER`, `GITHUB_TOKEN`, `GITHUB_REPOSITORY` e `IMAGE_TAG` para build/push/deploy.
  - Rate limiter do `nuxt-security` passou a ser configurável por env para produção em proxy/Swarm:
    - `NUXT_SECURITY_RATE_LIMITER_ENABLED`
    - `NUXT_SECURITY_RATE_LIMIT_TOKENS_PER_INTERVAL`
    - `NUXT_SECURITY_RATE_LIMIT_INTERVAL_MS`
  - CSP ajustada para permitir Web Workers via `blob:` adicionando `worker-src` (evita bloqueio no console para workers criados em runtime).
