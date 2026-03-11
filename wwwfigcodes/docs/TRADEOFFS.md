# TRADEOFFS

## 1) Supabase (BaaS) vs Backend próprio

**Escolha atual:** Supabase para Auth, banco e funções serverless.

**Vantagens**
- Time-to-market rápido.
- Menos esforço operacional inicial.
- Boa integração com front-end TypeScript.

**Desvantagens**
- Dependência maior de fornecedor.
- Limitações de customização em fluxos muito específicos.
- Custo pode crescer com uso intenso sem otimização.

## 2) Edge Functions vs serviço backend dedicado

**Escolha atual:** lógica de negócio em Edge Functions.

**Vantagens**
- Deploy simples e granular.
- Escala elástica por demanda.
- Menor overhead de infraestrutura.

**Desvantagens**
- Observabilidade e tracing exigem esforço extra.
- Tempo de inicialização e limites de runtime.
- Orquestrações complexas ficam mais difíceis sem fila/event bus.

## 3) SPA React vs SSR/SSG híbrido

**Escolha atual:** SPA com Vite.

**Vantagens**
- DX excelente e build rápido.
- Simplicidade de deploy em host estático.
- Componentização e manutenção facilitadas.

**Desvantagens**
- SEO pode exigir cuidados adicionais.
- Carregamento inicial depende de bundle JS.
- Menor flexibilidade para renderização server-side sem migração.

## 4) CORS aberto (`*`) vs CORS restrito

**Escolha atual:** permissivo nas funções.

**Vantagens**
- Facilidade de integração e testes.
- Menos bloqueios durante desenvolvimento.

**Desvantagens**
- Superfície de ataque maior em produção.
- Maior risco de uso indevido dos endpoints.

## 5) SMTP direto na função vs fila assíncrona

**Escolha atual:** envio síncrono no `send-contact-email`.

**Vantagens**
- Implementação simples.
- Feedback imediato para o front-end.

**Desvantagens**
- Dependência de disponibilidade imediata do SMTP.
- Maior latência de resposta.
- Menor resiliência em picos.

## 6) Validação manual de payload vs schema compartilhado

**Escolha atual:** validações pontuais por campo.

**Vantagens**
- Código direto e rápido de implementar.
- Sem camada extra inicial.

**Desvantagens**
- Risco de inconsistência entre endpoints.
- Menor clareza de contrato de API.
- Maior chance de regressão com evolução do payload.

## Decisões sugeridas para próximos ciclos

- Restringir CORS por ambiente/domínio.
- Adotar validação de schema em todas as funções.
- Introduzir fila para tarefas de e-mail.
- Definir critérios de observabilidade e SLO para operações críticas.