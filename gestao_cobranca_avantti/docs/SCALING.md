# SCALING

## 1. Objetivo

Definir abordagem de escala para o **gestao_cobranca_avantti** em aplicação, banco e processamento operacional.

## 2. Escala de Aplicação

- Executar múltiplas réplicas sem estado local
- Reduzir trabalho síncrono em endpoints de relatório/exportação
- Introduzir processamento assíncrono para cargas pesadas

## 3. Escala de Banco (Neon + Prisma)

- Índices para filtros frequentes (filial, responsável, operação, data)
- Revisão de queries críticas com plano de execução
- Controle de pool de conexões por ambiente

## 4. Escala de Relatórios e Exportações

- Paginação para listagens extensas
- Geração de export em job assíncrono com status
- Armazenamento de artefatos temporários em S3 com retenção definida

## 5. Escala de Storage

- Separar metadado (DB) de binário (S3)
- Definir política de lifecycle para limpeza de arquivos órfãos
- Monitorar volume por tenant e custo de tráfego

## 6. Observabilidade

Métricas mínimas:

- p95 de endpoints de relatório
- tempo de geração de export
- top queries lentas por módulo
- falhas de upload/download no S3

Alertas mínimos:

- aumento de 5xx em rotas sensíveis
- latência sustentada acima do limite
- falhas recorrentes de migração/deploy

## 7. Roadmap de Escala

1. Baseline + tuning de índices
2. Fila para exportações
3. Caching seletivo para consultas agregadas
4. Segmentação de cargas por tenant de alto volume
