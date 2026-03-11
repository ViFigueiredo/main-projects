# Memórias e Conhecimento Acumulado do Agente

Este arquivo contém o histórico de aprendizado, regras implícitas e decisões técnicas importantes acumuladas pelo agente durante o desenvolvimento do projeto. Ele serve como base de conhecimento transferível entre ambientes.

## 1. Conhecimento do Projeto (Project Scope)

- **Authentication Architecture**: Authentication implemented using JWT (cookie-based), 'useAuth' composable for state, and 'auth.global.ts' middleware for route protection. 'getUserFromEvent' utility verifies tokens on server.
- **Settings Module Features**: Settings module includes management for Users, Operation Types, Invoice Statuses (with Portuguese colors and 'requiresAttachment' flag), and Custom Fields. All features support full CRUD and Audit Logs. Custom Fields allow defining type (Text, Number, Date, Boolean, Select), entity (Customer, Order, Invoice), and 'allowImport' flag for import compatibility.
- **Módulo de Pedidos Enhancements**: Módulo de Pedidos features 9-month default filter, 'Safra' filter, invoice ordering, and Hierarchy/Audit actions. Tabulation modal supports ID formatting, status color dots, conditional file upload, and 'Remove Tabulation' (resets invoice statuses). Base Due Date is auto-calculated if invoices share billing account and due day. API endpoints ensure robust error handling.
- **Role-Based Access Control (RBAC) Rules**: Role Hierarchy: SuperAdmin > Administrator > Manager > Member.
  Permissions:
  - Import/Export: Restricted to SuperAdmin and Administrator.
  - Dashboard: Scoped data (Member: Self; Manager: Self + Members; Admin: Global).
  - Sidebar: Reports/Import/Settings/Activities restricted by role.
  - Customers: Import/Export restricted to SuperAdmin and Administrator.
- **Prisma Migration Protocol on Windows**: Always stop the running development server before executing database migrations or `prisma generate` on Windows to avoid EPERM/file locking errors.
- **Project Stack and Prototypes**: Project AvanttiCob uses Nuxt 4, PrimeVue v4 (Aura theme), Tailwind CSS v4. Stack includes Prisma v6 (Postgres), Sentry for monitoring, and Zod for validation. Detailed HTML prototypes are available in the `stitch` directory.
- **Prisma Neon Adapter Dependencies**: When using Prisma with Neon (serverless Postgres) and driverAdapters in this project, ensure `pg` and `@prisma/adapter-pg` are installed as dependencies, as they are required for both the application runtime and seeding scripts.
- **S3 Signed URLs Dependency**: Project uses @aws-sdk/s3-request-presigner for generating signed URLs for S3 attachments.
- **Critical Environment Variables**: Required environment variables include: NUXT_S3_* (Endpoint, Region, Bucket, Keys), SENTRY_* (DSN, Auth Token, Org, Project), SUPER_ADMIN_* (Email, Password), and CHATWOOT_WAF_TOKEN. NUXT_ENABLE_DEV_LOGIN_BYPASS allows skipping auth in dev.
- **Testing Strategy and Status**: Testing infrastructure (Vitest) is configured but currently has minimal/no coverage. Priority is to implement unit tests for API endpoints (server/api) and critical utilities. New features/bug fixes should introduce tests.
- **Backend Implementation Details**: Project now includes 'server/api' for backend logic using H3 and Prisma. User management implemented with JWT auth (bcryptjs) and full CRUD. API routes located in 'server/api/users' and 'server/api/auth'.
- **Session Policy**: Production cookies use httpOnly + sameSite=strict + secure. Expiration: 7d with “Lembrar de mim”, 2h sem “Lembrar de mim”. Dev bypass só atua em localhost quando `NUXT_ENABLE_DEV_LOGIN_BYPASS=true`.
- **Sidebar Stability**: Sidebar mantém altura constante no cabeçalho de logo para evitar saltos visuais; estado de colapso persiste em cookie `sidebar:collapsed` (1 ano).

## 2. Preferências do Usuário (User Scope)

- **Git Large File Removal**: When removing large files (>100MB) that block git push, use `git commit --amend` or interactive rebase to remove the file from the specific commit in history, rather than just deleting it in a new commit. Squashing or cherry-picking ensures a clean history without the large blob.
- **Docker Swarm Deployment**: Projeto possui artefatos de deploy com Swarm (Dockerfile, docker-stack.yml, entrypoint com RUN_MIGRATIONS) e guia em docs/deploy/docker-swarm.md. O fluxo exige build/push da imagem em registry antes de docker stack deploy.
- **GHCR Deploy Script**: Existe script `scripts/deploy-ghcr.ps1` que carrega variaveis do `.env`, faz login no GHCR, executa build/push da imagem e realiza `docker stack deploy` com `AVANTTICOB_IMAGE` temporario.
