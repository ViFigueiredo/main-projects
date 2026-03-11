# SCALING

## 1. Objetivo

Definir diretrizes de escalabilidade para o **DataSniffer-AI** com foco em throughput de análises e estabilidade operacional.

## 2. Escala de Backend

- Separar API síncrona de execução pesada de scanners
- Processar análises em workers com fila
- Definir limites por usuário/tenant para evitar starvation

## 3. Escala dos Motores de Análise

- Pool dedicado para Playwright (controle de browsers concorrentes)
- Isolamento de processos de proxy para sessões paralelas
- Timeout e cancelamento explícito por etapa de análise

## 4. Escala de Dados (Supabase)

- Índices por `user_id`, `session_id`, `created_at`
- Arquivamento de sessões antigas e logs volumosos
- Paginação obrigatória em tráfego e histórico de análises

## 5. Escala de Tempo Real

- WebSocket com canais por sessão
- Buffer/backpressure para evitar estouro de memória
- Reconexão com retomada de estado mínimo

## 6. Observabilidade de Escala

Métricas recomendadas:

- análises iniciadas/concluídas por minuto
- tempo médio por tipo de scanner
- uso de CPU/RAM por worker
- latência de escrita/leitura no Supabase

Alertas recomendados:

- fila acima do limiar por tempo contínuo
- falha recorrente em execução Playwright/mitmproxy
- erro 5xx acima do baseline

## 7. Roadmap

1. Introduzir job queue e isolamento de workers
2. Implementar autoscaling por carga de fila
3. Criar política de retenção e compactação de logs
4. Testes de carga periódicos por cenário de scanner
