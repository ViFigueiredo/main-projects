# SCALING

## 1. Objetivo

Definir estratégia de escala para o **Chatwoot_Manager** considerando aplicação Nuxt, banco Neon e chamadas à API Chatwoot.

## 2. Escala de Aplicação

- Manter runtime stateless para permitir múltiplas réplicas
- Limitar concorrência em rotas de sincronização pesada
- Mover operações demoradas para processamento assíncrono (quando aplicável)

## 3. Escala de Integração Chatwoot

- Implementar retry com backoff para erros transitórios
- Aplicar rate limit por tenant para evitar bloqueio da API externa
- Adotar cache curto para metadados com baixa variabilidade (ex.: inboxes)

## 4. Escala de Banco (Neon + Prisma)

- Criar índices para filtros recorrentes por tenant/data
- Revisar queries de maior volume com `EXPLAIN ANALYZE`
- Ajustar pool de conexões por ambiente e número de réplicas

## 5. Observabilidade para Escala

Métricas mínimas:

- p95/p99 de endpoints de integração
- Taxa de erro por tenant e por endpoint
- Latência média de operações Prisma
- Volume de sincronizações por janela de tempo

Alertas mínimos:

- Aumento contínuo de erros 5xx
- Timeout recorrente em chamadas Chatwoot
- Saturação de conexões no banco

## 6. Plano Evolutivo

1. Baseline de performance com carga real
2. Índices e otimizações das consultas críticas
3. Introdução de filas para sincronizações em lote
4. Estratégia de cache mais agressiva por tenant de alto volume
