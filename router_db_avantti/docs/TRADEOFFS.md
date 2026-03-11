# TRADEOFFS

## 1. Objetivo

Consolidar os trade-offs técnicos do **router_db_avantti** para guiar decisões futuras do gateway.

## 2. Decisões Técnicas

### 2.1 FastAPI dedicado para roteamento vs backend embutido no Nuxt

**Escolha atual:** backend Python separado para o gateway.

- Prós: melhor controle de conexão com SQL Server e ecossistema Python
- Contras: operação de runtime duplo (Node + Python)
- Mitigação: scripts de desenvolvimento unificados e observabilidade central

### 2.2 SQLite local vs banco gerenciado para metadados

**Escolha atual:** SQLite.

- Prós: simplicidade operacional e setup rápido
- Contras: limitações para concorrência/escala horizontal
- Reavaliar quando: aumento de throughput e necessidade de HA

### 2.3 API Key por projeto vs OAuth/JWT complexo

**Escolha atual:** autenticação por chave de API.

- Prós: implementação simples e integração rápida
- Contras: rotação e governança de chaves exigem disciplina operacional
- Mitigação: política de expiração/rotação e auditoria de uso

### 2.4 Flexibilidade de query vs superfície de risco

**Escolha atual:** gateway com validações e regras de proteção.

- Prós: atende múltiplos cenários de integração
- Contras: maior risco sem controles rígidos
- Decisão: manter validação estrita, timeout e limites por projeto
