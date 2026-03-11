# SCALING

## 1. Objetivo

Definir estratégia de escala do **WhatsUpLeads** para sustentar aumento de tenants, campanhas e volume de mensagens.

## 2. Escala de Aplicação Web

- Escalar horizontalmente instâncias Next.js
- Manter app stateless e sessões compatíveis com múltiplas réplicas
- Usar cache seletivo para consultas de dashboard

## 3. Escala de Worker/Fila

- Escalar workers de BullMQ de forma independente do app web
- Particionar filas por tipo de job e prioridade
- Definir políticas de retry, backoff e dead-letter

## 4. Escala de Banco e Redis

- Índices por `tenant_id`, `campaign_id`, `status`, `created_at`
- Paginação obrigatória em listagens operacionais
- Monitoramento de latência de query e consumo de memória Redis

## 5. Escala de Provedores WhatsApp

- Rate limit por provedor e por tenant
- Estratégia de fallback entre provedores quando possível
- Circuit breaker para reduzir impacto de falha externa

## 6. Observabilidade para Escala

Métricas mínimas:

- jobs processados por minuto
- tempo médio de processamento por campanha
- taxa de entrega/erro por provedor
- backlog de fila por prioridade

Alertas mínimos:

- fila crescendo sem drenagem
- aumento de falha em provedor específico
- erro 5xx acima do baseline

## 7. Roadmap

1. Auto-scaling de workers por backlog
2. Caching de consultas críticas de dashboard
3. Teste de carga recorrente por cenário de campanha
4. Segmentação de tenants enterprise em filas dedicadas
