# SCALING

## 1. Objetivo

Definir estratégias de escala do **router_db_avantti** para throughput de consultas, estabilidade e isolamento por projeto.

## 2. Escala do Backend Gateway

- Separar plano de controle (cadastros/configuração) do plano de dados (execução de query)
- Aplicar limites de concorrência por API Key
- Definir timeout máximo por consulta para proteção do serviço

## 3. Escala de Conexões SQL Server

- Implementar pool de conexões por destino
- Limitar conexões simultâneas por host/banco remoto
- Adotar circuito de proteção para destinos instáveis

## 4. Escala de Dados Locais (SQLite)

- Indexar tabelas de projetos/chaves por campos de busca
- Rotina de limpeza e rotação para logs e metadados antigos
- Plano de migração para banco central (PostgreSQL) quando volume crescer

## 5. Observabilidade

Métricas mínimas:

- requests por API Key/projeto
- latência média e p95 por query roteada
- taxa de falha por destino SQL Server
- tempo de validação/autorização no gateway

Alertas mínimos:

- aumento de timeout por destino
- erro 5xx sustentado no backend Python
- degradação de throughput acima do baseline

## 6. Roadmap de Escala

1. Definir quotas por projeto
2. Introduzir fila para cargas em lote
3. Migrar metadados para banco central quando necessário
4. Automatizar testes de carga por tipo de consulta
