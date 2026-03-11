# TRADEOFFS

## 1. Objetivo

Registrar escolhas técnicas do projeto, seus benefícios, custos e critérios de decisão. Este documento apoia decisões futuras com contexto explícito.

## 2. Princípio de decisão

Para cada decisão, avaliar:

- Impacto em segurança e multi-tenant
- Impacto em custo operacional
- Impacto em velocidade de entrega
- Impacto em manutenção no médio/longo prazo

## 3. Trade-offs Arquiteturais

### 3.1 Next.js full-stack vs serviços separados

**Escolha atual:** Next.js com frontend e backend integrados.

- **Prós:** menor overhead de deploy, entrega mais rápida, stack unificada
- **Contras:** crescimento de acoplamento entre domínios, risco de aumento de complexidade no app único
- **Quando revisar:** aumento forte de carga por domínio ou necessidade de equipes totalmente independentes

### 3.2 Server Actions/Route Handlers vs camada de serviços dedicada

**Escolha atual:** lógica majoritariamente em handlers/actions, com utilitários compartilhados.

- **Prós:** simplicidade inicial, menor quantidade de abstrações
- **Contras:** risco de regras duplicadas e handlers extensos
- **Mitigação:** extrair serviços por domínio quando houver repetição e alta complexidade

### 3.3 PostgreSQL gerenciado (Neon) vs autogerenciamento

**Escolha atual:** Neon PostgreSQL.

- **Prós:** operação simplificada, elasticidade e menor custo de administração
- **Contras:** dependência de provedor e limites da plataforma
- **Quando revisar:** exigências regulatórias específicas ou necessidade de tuning extremo

### 3.4 S3 compatível (B2) vs armazenamento local

**Escolha atual:** B2 via API S3.

- **Prós:** escalabilidade, durabilidade e desacoplamento do runtime
- **Contras:** latência de rede e custos por transferência/operação
- **Mitigação:** compressão, política de retenção e organização de objetos

## 4. Trade-offs de Segurança

### 4.1 Validação forte no servidor vs flexibilidade de entrada

**Escolha atual:** validação com Zod no servidor.

- **Prós:** redução de risco, contratos de dados previsíveis
- **Contras:** maior esforço inicial de schema e manutenção
- **Decisão:** manter validação server-side como padrão obrigatório

### 4.2 Escopo por `company_id` em toda operação vs simplicidade de query

**Escolha atual:** escopo organizacional obrigatório.

- **Prós:** isolamento de dados e segurança multi-tenant
- **Contras:** maior complexidade de query e modelagem de índices
- **Decisão:** não negociável por requisito de negócio/segurança

## 5. Trade-offs de Produto e UX

### 5.1 Notificação ampla vs ruído para usuário

**Escolha atual:** avaliar notificação em toda nova feature.

- **Prós:** melhor visibilidade de mudanças relevantes
- **Contras:** risco de fadiga por excesso de notificações
- **Mitigação:** critérios de relevância, tipo (`info/success/warning/error`) e link contextual

### 5.2 Consistência visual rígida vs liberdade local de estilo

**Escolha atual:** Tailwind + Shadcn/UI + regras globais de tema.

- **Prós:** identidade visual consistente e manutenção previsível
- **Contras:** customizações locais podem exigir seletores específicos
- **Mitigação:** seguir padrão documentado para sobrescritas de tema

## 6. Trade-offs Operacionais

### 6.1 Deploy em Swarm/Portainer vs plataformas PaaS opinionadas

**Escolha atual:** stack com `docker-stack.yaml`.

- **Prós:** controle de infraestrutura e padronização por compose/stack
- **Contras:** maior responsabilidade operacional do time
- **Mitigação:** runbooks claros, monitoramento e automação de deploy

### 6.2 Observabilidade mínima vs custo de instrumentação

**Escolha atual:** observabilidade orientada a endpoints e erros críticos.

- **Prós:** visão rápida de saúde com custo controlado
- **Contras:** menor profundidade diagnóstica inicial
- **Mitigação:** evoluir telemetria por criticidade de domínio

## 7. Decisões não negociáveis (no contexto atual)

- Segurança e permissões no servidor
- Isolamento multi-tenant por `company_id`
- Queries parametrizadas
- Upload em S3 compatível (sem armazenamento local)
- Migração persistente e validada no Neon para alterações de schema

## 8. Sinais para reavaliar decisões

- Incidentes recorrentes de desempenho por domínio específico
- Crescimento acentuado de tenants enterprise
- Aumento do lead time por acoplamento arquitetural
- Custos operacionais acima do previsto

## 9. Governança

Sempre que uma decisão deste documento mudar, atualizar na mesma entrega:

- `AGENTS.md` (se regra global mudar)
- Documentação detalhada relevante em `docs/`
- `README.md` (se impacto para onboarding/uso)
