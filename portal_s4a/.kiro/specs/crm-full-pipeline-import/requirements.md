# Importação Completa da Esteira CRM

## Visão Geral

Adicionar a opção "Todas as Entidades" no módulo de importação do CRM, permitindo que usuários atualizem toda a esteira de vendas (Oportunidade → Pedido → Demanda) em uma única operação de importação, respeitando os relacionamentos entre tickets.

## Contexto

O sistema CRM possui três entidades principais que formam uma esteira de vendas:
1. **Oportunidades** (`crm_opportunities`) - Início do funil de vendas
2. **Pedidos** (`crm_orders`) - Vinculados a oportunidades via `opportunity_id`
3. **Demandas/Pós-Venda** (`crm_post_sales`) - Vinculadas a pedidos via `order_id`

Atualmente, a importação só permite atualizar uma entidade por vez. Usuários precisam de uma forma de atualizar toda a esteira de uma vez, especialmente quando recebem planilhas de sistemas externos que contêm dados de múltiplas etapas.

## User Stories

### US-1: Seleção de Tipo "Todas as Entidades"
**Como** usuário do CRM  
**Quero** selecionar "Todas as Entidades" como tipo de importação  
**Para** poder atualizar oportunidades, pedidos e demandas em uma única operação

**Critérios de Aceitação:**
- [ ] Nova opção "Todas as Entidades" disponível no seletor de tipo de entidade
- [ ] Ao selecionar, os campos disponíveis para mapeamento incluem campos de todas as entidades
- [ ] Campo obrigatório `entity_type` para identificar o tipo de cada linha
- [ ] Interface indica claramente que é uma importação multi-entidade

### US-2: Identificação do Tipo de Entidade por Linha
**Como** usuário do CRM  
**Quero** que cada linha do arquivo indique qual tipo de entidade representa  
**Para** que o sistema processe corretamente cada registro

**Critérios de Aceitação:**
- [ ] Campo `entity_type` mapeável com valores: `opportunity`, `order`, `post_sales`
- [ ] Validação que cada linha tem um tipo de entidade válido
- [ ] Suporte a nomes alternativos: `oportunidade`, `pedido`, `demanda`
- [ ] Erro claro quando tipo de entidade não é identificável

### US-3: Vinculação de Tickets Relacionados
**Como** usuário do CRM  
**Quero** poder vincular pedidos a oportunidades e demandas a pedidos durante a importação  
**Para** manter a integridade dos relacionamentos da esteira

**Critérios de Aceitação:**
- [ ] Campo `opportunity_id` disponível para vincular pedidos a oportunidades
- [ ] Campo `order_id` disponível para vincular demandas a pedidos
- [ ] Suporte a identificação por ID ou por referência externa (ex: CNPJ + número)
- [ ] Validação que IDs referenciados existem no sistema
- [ ] Criação automática de vínculos quando IDs são fornecidos

### US-4: Processamento em Ordem Correta
**Como** sistema  
**Quero** processar as entidades na ordem correta (oportunidades → pedidos → demandas)  
**Para** garantir que os vínculos possam ser criados corretamente

**Critérios de Aceitação:**
- [ ] Oportunidades são processadas primeiro
- [ ] Pedidos são processados após oportunidades
- [ ] Demandas são processadas por último
- [ ] IDs gerados durante a importação podem ser usados para vínculos
- [ ] Suporte a referência cruzada por linha (ex: "vincular ao pedido da linha 5")

### US-5: Validação Multi-Entidade
**Como** usuário do CRM  
**Quero** ver validação específica para cada tipo de entidade  
**Para** corrigir erros antes da importação

**Critérios de Aceitação:**
- [ ] Validação de campos obrigatórios por tipo de entidade
- [ ] Validação de status válido para cada tipo de entidade
- [ ] Resumo de validação separado por tipo de entidade
- [ ] Contagem de registros por tipo (X oportunidades, Y pedidos, Z demandas)

### US-6: Relatório de Importação Detalhado
**Como** usuário do CRM  
**Quero** ver um relatório detalhado após a importação  
**Para** saber exatamente o que foi criado/atualizado em cada entidade

**Critérios de Aceitação:**
- [ ] Contagem de criados/atualizados/ignorados por tipo de entidade
- [ ] Lista de vínculos criados entre entidades
- [ ] Erros agrupados por tipo de entidade
- [ ] Opção de exportar relatório

### US-7: Template Multi-Entidade
**Como** usuário do CRM  
**Quero** baixar um template que suporte todas as entidades  
**Para** preparar meus dados no formato correto

**Critérios de Aceitação:**
- [ ] Template inclui coluna `entity_type`
- [ ] Template inclui campos de todas as entidades
- [ ] Template inclui colunas de vinculação (`opportunity_id`, `order_id`)
- [ ] Exemplos de preenchimento para cada tipo de entidade
- [ ] Documentação inline sobre campos obrigatórios por tipo

## Requisitos Técnicos

### Estrutura de Dados do Arquivo

```csv
entity_type,client_cnpj,status_name,value,opportunity_id,order_id,notes
opportunity,12345678000190,Qualificação,50000,,,Nova oportunidade
order,12345678000190,Em Processamento,50000,123,,Pedido vinculado
post_sales,12345678000190,Aguardando,,123,456,Demanda do pedido
```

### Campos por Tipo de Entidade

**Oportunidades:**
- `id` (para atualização)
- `client_cnpj` / `client_cpf`
- `status_name`
- `value`
- `probability`
- `expected_close_date`
- `notes`
- Campos personalizados

**Pedidos:**
- `id` (para atualização)
- `client_cnpj` / `client_cpf`
- `opportunity_id` (vinculação)
- `status_name`
- `total_value`
- `order_date`
- `notes`
- Campos personalizados

**Demandas:**
- `id` (para atualização)
- `client_cnpj` / `client_cpf`
- `order_id` (vinculação)
- `status_name`
- `description`
- `due_date`
- `notes`
- Campos personalizados

### Ordem de Processamento

1. **Fase 1 - Separação:** Agrupar linhas por tipo de entidade
2. **Fase 2 - Oportunidades:** Processar todas as oportunidades
3. **Fase 3 - Pedidos:** Processar pedidos, vinculando a oportunidades
4. **Fase 4 - Demandas:** Processar demandas, vinculando a pedidos
5. **Fase 5 - Relatório:** Gerar relatório consolidado

### Mapeamento de Referências

Para permitir vinculação durante a importação:
- `opportunity_id`: ID numérico existente OU `row:N` para referenciar linha N do arquivo
- `order_id`: ID numérico existente OU `row:N` para referenciar linha N do arquivo

## Arquivos a Modificar

1. `src/components/crm/config/import-manager.tsx`
   - Adicionar opção "Todas as Entidades" no seletor
   - Atualizar lógica de campos disponíveis
   - Adicionar resumo por tipo de entidade
   - Atualizar template download

2. `src/lib/actions/crm-import.actions.ts`
   - Adicionar tipo `'all'` ao `EntityType`
   - Criar `getImportableFieldsAll()` para campos combinados
   - Criar `validateImportDataAll()` para validação multi-entidade
   - Criar `executeImportAll()` para processamento ordenado
   - Adicionar lógica de vinculação de referências

## Considerações de UX

- Mostrar aviso claro sobre a complexidade da importação multi-entidade
- Oferecer opção de "modo simples" (uma entidade) vs "modo avançado" (todas)
- Preview deve mostrar dados agrupados por tipo de entidade
- Progresso deve indicar qual fase está sendo processada

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Referências circulares | Validar que não há ciclos antes de processar |
| IDs inválidos | Validar existência de IDs referenciados na fase de validação |
| Ordem incorreta no arquivo | Reordenar automaticamente por tipo de entidade |
| Performance com muitos registros | Processar em lotes de 100 registros |

## Métricas de Sucesso

- Redução de 60% no tempo de importação de dados completos da esteira
- Zero erros de vinculação em importações válidas
- Feedback positivo de usuários sobre a funcionalidade

## Prioridade

**Alta** - Funcionalidade solicitada por múltiplos usuários para integração com sistemas externos.

## Estimativa

- **Desenvolvimento:** 4-6 horas
- **Testes:** 2 horas
- **Documentação:** 1 hora
