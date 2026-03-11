# AGENTS.md - Fonte Canônica para Agentes de IA

Este e o arquivo central de instrucoes, padroes e regras de negocio do projeto.
Qualquer agente/modelo de IA deve tratar este documento como referencia principal.

## 1) Hierarquia de Documentacao

1. `AGENTS.md` (raiz): regras centrais para IA, padroes de engenharia e guardrails.
2. `docs/`: detalhes tecnicos e operacionais por tema.
3. `README.md`: resumo para desenvolvedor (onboarding, comandos, links).
4. `.github/copilot-instructions.md`: versao minima, apontando para este arquivo.

Regra obrigatoria de sincronizacao:

- Sempre que arquitetura, regra de negocio, fluxo de deploy, seguranca, permissao, integracao ou stack mudarem, atualize na mesma entrega:
  - `AGENTS.md`
  - documentacao detalhada em `docs/`
  - `README.md` (se impactar onboarding/uso)
  - `.github/copilot-instructions.md` (se houver mudanca na instrucao minima)
  - `ai_instructions.json` (se mudar politica de documentacao ou arquivo canonico)

## 2) Stack e Convencoes Obrigatorias

- Framework: Next.js (App Router) + TypeScript estrito.
- UI: Tailwind CSS + Shadcn/UI (priorizar `src/components/ui/`).
- Formularios: `react-hook-form` + `zod` + `@hookform/resolvers`.
- Estado: hooks React e Context API antes de libs externas.
- Icones: `lucide-react`.
- Toasts: Sonner (`src/components/ui/sonner.tsx`).
- Graficos: Recharts.
- Estilo: apenas Tailwind utilitario (sem CSS-in-JS).

## 3) Banco de Dados e Persistencia

- Banco: Neon PostgreSQL (`databaseName: intranet`, `projectId: restless-morning-33051903`).
- Migrations persistentes devem ser aplicadas no banco real via MCP Neon:
  - `mcp_neondatabase__run_sql`
  - `mcp_neondatabase__run_sql_transaction`
- Atualizar apenas codigo (`src/lib/db.ts` ou similares) nao e suficiente.
- Sempre validar mudancas com consulta em `information_schema`.
- Use queries parametrizadas; nunca concatenar SQL com input de usuario.

## 4) Seguranca, Permissoes e Multi-tenant

- Toda rota de API/Server Action deve validar autenticacao e permissao.
- Toda leitura/escrita com escopo organizacional deve respeitar `company_id`.
- Validar input com Zod no servidor.
- Nao logar credenciais/tokens/sigilos.
- Aplicar principios de menor privilegio em cargos e permissoes.

## 5) Notificacoes (Regra Critica)

Toda nova feature deve avaliar necessidade de notificar usuarios impactados.
Padrao:

- Endpoint: `POST /api/notifications`
- Payload: `{ user_id, title, message, link?, type }`
- Tipos: `info | success | warning | error`

## 6) Upload de Arquivos (Padrao Unico)

- Usar S3 compativel (Backblaze B2), nunca armazenamento local.
- Utilitarios: `src/lib/s3.ts`
- Upload API: `POST /api/upload`
- Delete API: `DELETE /api/upload?url=<fileUrl>`
- Para buckets privados, usar signed URL para exibir arquivos.

## 7) Tema Global (Regra Critica)

O tema global usa regras de alta especificidade com `!important` em `src/app/globals.css`.
Para sobrescrever botoes/componentes:

1. Criar classe identificadora especifica (ex.: `.neutral-tabs-trigger`).
2. Excluir explicitamente essa classe das regras globais.
3. Se necessario, usar seletor local mais especifico.

Referencia: `docs/SOLUTION_TABS_THEME_FIX.md`.

## 8) Qualidade e Padrao de Codigo

- Evitar `any`; preferir tipos explicitos.
- Tratar erros assíncronos com `try/catch`.
- Componentes grandes devem ser divididos quando necessario.
- Nao refatorar codigo legado sem solicitacao explicita.

## 9) Commits e Fluxo

- Mensagens de commit sempre em pt-BR.
- Formato recomendado: `tipo: descricao`.
- Tipos: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`.
- Se o usuario pedir commit global, executar `git add .` antes do commit.

## 10) Politica de Documentacao

- Toda documentacao detalhada (`.md`/`.txt`) deve ficar em `docs/`.
- Excecoes na raiz: `README.md`, `AGENTS.md`, `todo.md`.
- O `README.md` deve permanecer em pt-BR.

## 11) Deploy Docker (Portainer + Swarm)

- Arquivo unico de deploy: `docker-stack.yaml`.
- Redes padrao do stack:
  - `internal`
  - `databases`
  - `tunnel`
  - `public`

## 12) MCPs Relevantes

- Neon Database MCP.
- Docker MCP.
- Fetch MCP.
- Memory MCP.
- ASAAS MCP.

## 13) Regra Final de Governanca

Se qualquer parte do projeto ficar diferente do que esta documentado, a entrega so e considerada completa apos atualizar as instrucoes e documentacoes correspondentes.