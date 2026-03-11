# SYSTEM_DESIGN

## 1. Objetivo

Documentar o desenho do sistema do **Chatwoot_Manager**, incluindo camadas, integrações e fluxos críticos.

## 2. Contexto Técnico

- Framework: Nuxt 4 (Vue 3 + TypeScript)
- UI: PrimeVue + Tailwind CSS
- Backend no mesmo projeto: rotas em `server/`
- Persistência: PostgreSQL (Neon) via Prisma
- Observabilidade: Sentry
- Segurança: `nuxt-security`, validação com Zod

## 3. Arquitetura de Alto Nível

1. **Apresentação**
   - Páginas e componentes Nuxt (dashboards, listagens e formulários)
2. **Aplicação**
   - Composables e handlers server-side para regras de negócio
3. **Dados**
   - Prisma Client como camada de acesso ao banco
4. **Integração externa**
   - Chatwoot Application API por tenant (base URL/token configuráveis)

## 4. Fluxos Críticos

### 4.1 Gestão por tenant

1. Usuário autenticado seleciona contexto/conta
2. Sistema resolve credenciais do tenant
3. Requisições para Chatwoot são executadas com token correto
4. Resultado é normalizado para UI e/ou persistido localmente

### 4.2 Sincronização de contatos e conversas

1. UI chama endpoint interno Nuxt
2. Endpoint valida payload (Zod)
3. Endpoint consulta Chatwoot (`contacts`, `conversations`, `inboxes`)
4. Retorno é exibido na interface e usado em ações administrativas

## 5. Diretrizes de Segurança

- Tokens nunca expostos no client em texto aberto
- Validação server-side para toda entrada externa
- Queries sempre via Prisma (sem SQL concatenado)
- Headers e hardening via `nuxt-security`

## 6. Operação e Deploy

- Desenvolvimento: `pnpm dev`
- Build: `pnpm build`
- Pós-instalação: `prisma generate` + `nuxt prepare`
- Deploy orientado por `vercel.json`

## 7. Riscos Técnicos

- Dependência direta de disponibilidade e latência da API Chatwoot
- Risco de acoplamento entre regras de UI e integração externa
- Crescimento de custo de consulta sem cache seletivo

## 8. Próximas Evoluções

- Criar camada de serviço dedicada para integração Chatwoot
- Definir contratos de erro padronizados por endpoint
- Formalizar SLIs (latência, taxa de erro e disponibilidade)
