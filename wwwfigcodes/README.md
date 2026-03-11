# Figcodes Website

Aplicação web institucional da Figcodes, construída com React + Vite + TypeScript, com UI baseada em Tailwind/shadcn e integrações com Supabase (cliente e Edge Functions).

## Stack principal

- React 18 + TypeScript
- Vite 6
- Tailwind CSS + shadcn/ui (Radix UI)
- React Router DOM
- Supabase JS (`@supabase/supabase-js`)
- Supabase Edge Functions (Deno)

## Estrutura do projeto

```txt
src/
	components/           # seções e componentes compartilhados
	pages/                # páginas roteadas
	integrations/supabase # cliente Supabase no front-end
supabase/functions/     # funções serverless (create-user, get-users, etc.)
docs/                   # documentação técnica
```

## Pré-requisitos

- Node.js 18+
- pnpm 10+
- Projeto Supabase configurado

## Instalação

```bash
pnpm install
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Para Edge Functions, configure também no ambiente do Supabase:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`

## Scripts

- `pnpm dev` — inicia ambiente de desenvolvimento
- `pnpm build` — build de produção
- `pnpm build:dev` — build em modo development
- `pnpm preview` — pré-visualiza build local
- `pnpm lint` — executa ESLint

## Rotas principais

- `/` — home
- `/whatsupleads` — página de produto/serviço
- `/termos-de-uso` — termos de uso
- `/politica-de-privacidade` — política de privacidade

## Documentação técnica

- `docs/SYSTEM_DESIGN.md` — visão de arquitetura e componentes
- `docs/SCALING.md` — estratégia de escalabilidade
- `docs/TRADEOFFS.md` — decisões técnicas e trade-offs

## Deploy (resumo)

1. Configurar variáveis de ambiente do front-end.
2. Configurar segredos das Edge Functions no Supabase.
3. Publicar front-end (Vercel/Netlify/outro host estático).
4. Fazer deploy das funções no Supabase.

---

Se quiser, posso na sequência adicionar um diagrama de arquitetura (C4 simplificado) em Mermaid dentro de `docs/SYSTEM_DESIGN.md`.
