# TRADEOFFS

## 1. Objetivo

Registrar decisões técnicas do **Chatwoot_Manager**, com benefícios, custos e critérios de reavaliação.

## 2. Decisões Principais

### 2.1 Nuxt full-stack vs microserviços

**Escolha atual:** app único Nuxt com frontend + backend.

- Prós: menor overhead operacional, entrega mais rápida
- Contras: acoplamento maior entre UI e backend
- Reavaliar quando: crescimento de equipe/domínio exigir deploy independente

### 2.2 Prisma/Neon vs acesso SQL manual

**Escolha atual:** Prisma sobre Neon PostgreSQL.

- Prós: produtividade, tipagem e migrações padronizadas
- Contras: menos controle fino para queries extremas
- Mitigação: SQL otimizado apenas para hotspots específicos

### 2.3 Integração direta com Chatwoot API vs espelhamento completo local

**Escolha atual:** consulta direta com persistência seletiva.

- Prós: menor duplicação de dados e consistência com origem
- Contras: dependência de disponibilidade da API externa
- Mitigação: retries, cache curto e tratamento robusto de falhas

## 3. Segurança x Velocidade

**Escolha atual:** validação e checagem server-side obrigatórias.

- Prós: menor risco de abuso/injeção
- Contras: maior esforço de desenvolvimento inicial
- Decisão: não negociável para endpoints de dados e integração

## 4. Operação x Custo

**Escolha atual:** stack simples com deploy direto.

- Prós: custo operacional menor no estágio atual
- Contras: menor elasticidade automática
- Reavaliar quando: picos de uso e tenants enterprise aumentarem
