# SCALING

## 1. Objetivo

Definir estratégias de escalabilidade para o **portal_s4a** em três frentes: aplicação, banco de dados e operação.

## 2. Premissas

- Arquitetura base em Next.js (App Router)
- Banco principal em Neon PostgreSQL
- Multi-tenant com `company_id`
- Deploy containerizado em Swarm/Portainer

## 3. Estratégia de Escala da Aplicação

### 3.1 Escala horizontal

- Executar múltiplas réplicas do serviço web no Swarm
- Garantir que aplicação seja stateless no runtime
- Manter sessão/autorização compatível com múltiplas instâncias

### 3.2 Controle de carga

- Definir limites de concorrência para rotas críticas
- Implementar timeout e retry com backoff em integrações externas
- Evitar operações longas síncronas no request path

### 3.3 Caching

- Priorizar cache em leituras de baixa variabilidade
- Usar invalidação explícita ao alterar dados críticos
- Evitar cache de dados sensíveis por usuário sem chave de tenant/escopo

## 4. Estratégia de Escala do Banco (Neon/PostgreSQL)

### 4.1 Modelagem e índice

- Índices compostos para padrões de consulta com `company_id`
- Revisão de planos de execução (`EXPLAIN ANALYZE`) nas queries de maior volume
- Evitar N+1 e leituras repetitivas sem necessidade

### 4.2 Conexões

- Controlar pool de conexões por instância
- Prevenir exaustão de conexões em picos
- Monitorar latência de query e saturação do banco

### 4.3 Migrações seguras

- Aplicar migrações persistentes no Neon (não apenas alteração local de código)
- Validar schema após migração com `information_schema`
- Planejar migrações com compatibilidade retroativa quando possível

## 5. Estratégia de Escala de Upload e Arquivos

- Manter arquivos fora do filesystem local (S3 compatível)
- Separar metadado (DB) do binário (bucket)
- Definir política de ciclo de vida e limpeza de órfãos

## 6. Multi-tenant em escala

- Toda consulta deve filtrar por `company_id`
- Criar índices alinhados ao particionamento lógico por tenant
- Avaliar isolamento adicional para tenants de alto volume (futuro)

## 7. Observabilidade para escalar com segurança

### 7.1 Métricas mínimas

- p95/p99 de latência por endpoint
- Taxa de erros 4xx/5xx por domínio
- Tempo médio de query e top queries lentas
- Taxa de falha em upload e notificações

### 7.2 Alertas mínimos

- Aumento abrupto de 5xx
- Latência acima de limiar por janela contínua
- Saturação de conexões DB
- Falha recorrente em integração externa

## 8. Plano de capacidade (guideline)

1. Medir baseline de uso (CPU, memória, latência, DB)
2. Definir gatilhos para scale-out
3. Testar carga por cenário de negócio crítico
4. Ajustar índices, cache e limites
5. Repetir ciclo a cada release relevante

## 9. Anti-padrões a evitar

- Escalar réplicas sem revisar gargalo de banco
- Adicionar cache sem estratégia de invalidação
- Processar tarefas pesadas dentro da requisição do usuário
- Ignorar observabilidade antes de aumentar capacidade

## 10. Roadmap sugerido de escala

- **Fase 1:** baseline + métricas + índices essenciais
- **Fase 2:** otimização de endpoints críticos e caching seletivo
- **Fase 3:** automação de scale-out e testes de carga recorrentes
- **Fase 4:** segmentação avançada por tenant de alto volume
