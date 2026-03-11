# AI Learning Map

Objetivo: acelerar entendimento de agentes de IA sobre o projeto com um caminho unico e direto.

## Ordem de leitura recomendada

1. `AGENTS.md` (regras canônicas)
2. `docs/ai-context.json` (contexto estruturado para IA)
3. `docs/architecture/MULTI_TENANCY_GUIDE.md`
4. `docs/database/NEON_WORKFLOW.md`
5. `docs/deployment/DOCKER_SWARM_DEPLOY.md`

## Regras criticas para qualquer implementacao

- Validar autenticacao e permissao em API routes e Server Actions.
- Respeitar `company_id` em todas as operacoes multi-tenant.
- Aplicar migracoes reais no Neon via MCP e validar no `information_schema`.
- Para upload, usar somente S3 compativel (Backblaze B2), sem storage local.
- Toda nova feature deve avaliar notificacoes para usuarios impactados.

## Convencoes tecnicas essenciais

- Next.js App Router + TypeScript estrito.
- Tailwind + Shadcn/UI.
- Formularios com react-hook-form + zod.
- Toaster com Sonner.
- Graficos com Recharts.

## Deploy canonico

- Swarm + Portainer com arquivo unico: `docker-stack.yaml`.
- Redes padrao: `internal`, `databases`, `tunnel`, `public`.

## Regra de governanca

Se qualquer parte do projeto mudar (arquitetura, regra de negocio, deploy, seguranca, permissao, integracao ou stack), a documentacao e instrucoes devem ser atualizadas na mesma entrega.
