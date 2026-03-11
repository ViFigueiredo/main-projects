# SCALING

## Objetivo

Definir como o sistema evolui com aumento de tráfego, volume de contatos e uso das operações administrativas.

## Estado atual

- Front-end estático (boa base para escalar com CDN).
- Backend serverless via Supabase Edge Functions.
- Persistência e autenticação centralizadas no Supabase.

## Estratégia de escala por camada

## 1) Front-end

- Publicar em CDN com cache agressivo para assets versionados.
- Manter bundles enxutos (code splitting por rota quando necessário).
- Otimizar imagens e conteúdo estático.

## 2) Edge Functions

- Tornar funções idempotentes para evitar efeitos duplicados em retries.
- Reduzir latência com validação rápida e early return.
- Separar responsabilidades (uma função por domínio/ação).
- Implementar rate limiting para endpoints públicos (principalmente contato).

## 3) Banco e dados

- Criar índices para consultas frequentes (`profiles.id`, `clients.asaas_customer_id`).
- Aplicar paginação em listagens administrativas (`get-users`).
- Revisar políticas RLS para manter segurança sem degradar performance.

## 4) Integrações externas (SMTP)

- Definir retry com backoff para erros transitórios.
- Adicionar fila assíncrona para picos de envio.
- Medir taxa de entrega, bounce e latência média.

## Plano de evolução recomendado

### Curto prazo

- Limitar CORS por domínio conhecido.
- Adicionar validação de schema (Zod) nas funções.
- Instrumentar logs estruturados (nível, função, requestId).

### Médio prazo

- Introduzir fila para e-mails (job assíncrono).
- Cache de consultas administrativas de leitura intensiva.
- Dashboard de métricas operacionais.

### Longo prazo

- Particionar responsabilidades por domínio (contato, usuários, billing).
- Considerar multirregião para reduzir latência geográfica.
- Definir SLO/SLA para fluxos críticos.

## Métricas-chave

- P95 de latência por Edge Function.
- Taxa de erro por endpoint.
- Throughput de requisições por minuto.
- Tempo de build/deploy e taxa de rollback.
- Taxa de sucesso de envio de e-mail.