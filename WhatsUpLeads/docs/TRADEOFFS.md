# TRADEOFFS

## 1. Objetivo

Consolidar trade-offs técnicos do **WhatsUpLeads** para orientar evolução do produto com equilíbrio entre velocidade, custo e confiabilidade.

## 2. Decisões Arquiteturais

### 2.1 Next.js full-stack + worker separado

**Escolha atual:** backend principal em Next.js com processamento assíncrono em worker Node.

- Prós: velocidade de desenvolvimento e separação de carga pesada
- Contras: necessidade de sincronizar contratos entre app e worker
- Mitigação: schemas compartilhados e versionamento de jobs

### 2.2 Multi-provedor WhatsApp vs operação simplificada

**Escolha atual:** suportar múltiplos provedores.

- Prós: resiliência comercial e flexibilidade por tenant
- Contras: maior complexidade de manutenção e suporte
- Mitigação: camada de abstração por provedor e testes de contrato

### 2.3 PostgreSQL + Redis/BullMQ vs stack única síncrona

**Escolha atual:** dados transacionais no Postgres e jobs no Redis.

- Prós: alta capacidade para workloads assíncronos
- Contras: operação distribuída com mais pontos de falha
- Mitigação: observabilidade forte e runbooks de incidente

## 3. Segurança x Experiência

**Escolha atual:** isolamento multi-tenant rigoroso.

- Prós: proteção de dados e conformidade operacional
- Contras: maior complexidade de queries e autorização
- Decisão: manter como princípio inegociável

## 4. Custo x Escalabilidade

**Escolha atual:** priorizar escala horizontal conforme demanda real.

- Prós: controle de custo em fase de crescimento
- Contras: risco de gargalo em picos abruptos
- Reavaliar quando: backlog e latência ultrapassarem SLOs definidos
