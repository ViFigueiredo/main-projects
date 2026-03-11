# TRADEOFFS

## 1. Objetivo

Documentar os trade-offs técnicos do **DataSniffer-AI** para apoiar decisões de arquitetura e operação.

## 2. Decisões Centrais

### 2.1 Stack heterogênea (Vue + FastAPI + scanners especializados)

**Escolha atual:** tecnologias especializadas por camada.

- Prós: melhor adequação técnica por domínio
- Contras: maior custo de integração e observabilidade
- Mitigação: contratos de API estáveis e tracing de ponta a ponta

### 2.2 Análise em tempo real vs custo computacional

**Escolha atual:** feedback ao vivo por WebSocket.

- Prós: melhor UX e triagem mais rápida
- Contras: custo maior de infraestrutura e complexidade de estado
- Mitigação: limites de concorrência e priorização por sessão

### 2.3 RLS no Supabase vs simplicidade de consulta

**Escolha atual:** isolamento forte por usuário/tenant.

- Prós: segurança multi-tenant robusta
- Contras: maior cuidado em modelagem e políticas
- Decisão: manter como requisito não negociável

### 2.4 IA para explicações vs determinismo

**Escolha atual:** IA complementar ao motor de detecção.

- Prós: contextualização mais útil para o usuário
- Contras: variabilidade de resposta e custo por uso
- Mitigação: separar claramente “achado técnico” de “explicação gerada”

## 3. Reavaliações Futuras

- crescimento de custo por sessão analisada
- latência acima de SLO em análises profundas
- aumento de falso positivo não controlado por regras
