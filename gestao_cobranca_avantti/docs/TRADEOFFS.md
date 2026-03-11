# TRADEOFFS

## 1. Objetivo

Registrar os principais trade-offs técnicos do **gestao_cobranca_avantti** para orientar evolução arquitetural.

## 2. Decisões Arquiteturais

### 2.1 App única Nuxt vs separação em serviços

**Escolha atual:** monólito modular em Nuxt.

- Prós: entrega rápida e operação simplificada
- Contras: risco de acoplamento entre domínios
- Reavaliar quando: time e carga exigirem deploy independente por domínio

### 2.2 Prisma em banco gerenciado vs controle manual de SQL

**Escolha atual:** Prisma + Neon.

- Prós: produtividade, tipagem, migração padronizada
- Contras: tuning avançado pode exigir SQL especializado
- Mitigação: otimização manual apenas em gargalos comprovados

### 2.3 S3 compatível vs filesystem local

**Escolha atual:** Backblaze B2 (S3).

- Prós: escalabilidade, durabilidade e desacoplamento do runtime
- Contras: custo por operação e latência de rede
- Mitigação: retenção e organização de objetos por contexto

## 3. Segurança x Usabilidade

**Escolha atual:** autorização rígida por papel/escopo.

- Prós: menor risco em operações sensíveis
- Contras: maior complexidade de regras e manutenção
- Decisão: manter rigor em endpoints críticos (usuários/exportações)

## 4. Operação x Velocidade de Entrega

**Escolha atual:** suportar Vercel e Swarm.

- Prós: flexibilidade de deployment
- Contras: maior matriz de cenários para suporte
- Mitigação: runbooks e checklists por ambiente
