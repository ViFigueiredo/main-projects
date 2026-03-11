# Guia de Solução de Problemas: CRM Devolução

## Visão Geral

Este documento fornece soluções para problemas comuns relacionados ao sistema de devolução CRM, incluindo diagnósticos, correções e procedimentos de recuperação.

## Problemas Comuns e Soluções

### 1. Botão de Devolução Não Aparece

#### Sintomas

- Usuário não vê o botão "Devolver para Oportunidade" ou "Devolver para Pedido"
- Interface parece normal, mas funcionalidade está ausente

#### Diagnóstico

```sql
-- Verificar permissões do usuário
SELECT u.email, u.role, u.permissions
FROM users u
WHERE u.email = 'usuario@empresa.com';

-- Verificar se o usuário está ativo
SELECT u.email, u.is_active, u.created_at
FROM users u
WHERE u.email = 'usuario@empresa.com';
```

#### Soluções

**Solução 1: Verificar Permissões**

```sql
-- Adicionar permissão necessária
UPDATE users
SET permissions = array_append(permissions, 'crm:devolucao:order_to_opportunity')
WHERE email = 'usuario@empresa.com'
AND NOT ('crm:devolucao:order_to_opportunity' = ANY(permissions));
```

**Solução 2: Limpar Cache**

1. Peça ao usuário para fazer logout
2. Limpar cache do navegador (Ctrl+Shift+Del)
3. Fazer login novamente

**Solução 3: Verificar Role**

```sql
-- Atualizar role se necessário
UPDATE users
SET role = 'sales_manager'
WHERE email = 'usuario@empresa.com';
```

### 2. Erro "Permissão Negada" ao Tentar Devolução

#### Sintomas

- Botão aparece, mas ao clicar retorna erro de permissão
- Mensagem: "Você não tem permissão para realizar esta operação"

#### Diagnóstico

```sql
-- Verificar logs de auditoria
SELECT
    al.user_id,
    al.action,
    al.resource,
    al.result,
    al.created_at,
    u.email
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.result = 'PERMISSION_DENIED'
AND al.action LIKE 'crm:devolucao:%'
ORDER BY al.created_at DESC
LIMIT 10;
```

#### Soluções

**Solução 1: Verificar Permissões Específicas**

```sql
-- Verificar permissões detalhadas
SELECT
    email,
    CASE
        WHEN 'crm:devolucao:order_to_opportunity' = ANY(permissions) THEN 'OK'
        ELSE 'FALTANDO'
    END as pedido_para_oportunidade,
    CASE
        WHEN 'crm:devolucao:post_sales_to_order' = ANY(permissions) THEN 'OK'
        ELSE 'FALTANDO'
    END as demanda_para_pedido
FROM users
WHERE email = 'usuario@empresa.com';
```

**Solução 2: Recriar Permissões**

```sql
-- Remover e readicionar permissões
UPDATE users
SET permissions = array_remove(permissions, 'crm:devolucao:order_to_opportunity')
WHERE email = 'usuario@empresa.com';

UPDATE users
SET permissions = array_append(permissions, 'crm:devolucao:order_to_opportunity')
WHERE email = 'usuario@empresa.com';
```

### 3. Devolução Falha com Erro de Validação

#### Sintomas

- Processo de devolução inicia mas falha durante execução
- Mensagem de erro sobre dados inválidos ou campos obrigatórios

#### Diagnóstico

```sql
-- Verificar integridade dos dados do item
SELECT
    id,
    client_id,
    status_id,
    created_at,
    updated_at
FROM crm_orders
WHERE id = [ID_DO_ITEM];

-- Verificar se cliente existe
SELECT c.id, c.company_name
FROM client_portfolio c
JOIN crm_orders o ON c.id = o.client_id
WHERE o.id = [ID_DO_ITEM];

-- Verificar se status de destino existe e esta ativo
SELECT id, name, type, is_active, is_finalizer
FROM crm_statuses
WHERE type = 'opportunity'
AND is_active = true
AND is_finalizer = false;
```

#### Soluções

**Solução 1: Configurar status ativo de destino**

```sql
-- Garantir ao menos um status operacional para oportunidades
INSERT INTO crm_statuses (name, type, color, order_index, is_active, is_finalizer)
VALUES ('Em Revisao', 'opportunity', '#3b82f6', 999, true, false)
ON CONFLICT DO NOTHING;

-- Garantir ao menos um status operacional para pedidos
INSERT INTO crm_statuses (name, type, color, order_index, is_active, is_finalizer)
VALUES ('Em Revisao', 'order', '#3b82f6', 999, true, false)
ON CONFLICT DO NOTHING;
```

**Solução 2: Corrigir Dados Corrompidos**

```sql
-- Verificar e corrigir referências de cliente
UPDATE crm_orders
SET client_id = (
    SELECT id FROM client_portfolio
    WHERE company_name = 'Nome da Empresa'
    LIMIT 1
)
WHERE id = [ID_DO_ITEM]
AND client_id IS NULL;
```

### 4. Item Não Aparece Após Devolução

#### Sintomas

- Devolução reporta sucesso, mas item não aparece na esteira de destino
- Usuário não consegue localizar o novo item criado

#### Diagnóstico

```sql
-- Verificar se a devolução foi registrada
SELECT
    da.source_type,
    da.source_id,
    da.target_type,
    da.target_id,
    da.reason,
    da.created_at,
    u.email as user_email
FROM crm_devolucao_audit da
JOIN users u ON da.user_id = u.id
WHERE da.source_id = [ID_ORIGINAL]
ORDER BY da.created_at DESC;

-- Verificar se o item de destino foi criado
SELECT id, client_id, status_id, source_devolucao_id, source_devolucao_type
FROM crm_opportunities
WHERE source_devolucao_id = [ID_ORIGINAL]
AND source_devolucao_type = 'order';
```

#### Soluções

**Solução 1: Verificar Filtros de Visibilidade**

1. Instrua o usuário a verificar o toggle "Mostrar Finalizados"
2. Confirme o status de destino selecionado no fluxo de devolucao
3. Procure pelo item na esteira de destino

**Solução 2: Verificar Status do Item Criado**

```sql
-- Verificar status do item criado
SELECT
    o.id,
    o.client_id,
    s.name as status_name,
    s.is_finalizer,
    s.is_waiting_status
FROM crm_opportunities o
JOIN crm_statuses s ON o.status_id = s.id
WHERE o.source_devolucao_id = [ID_ORIGINAL];
```

**Solução 3: Recriar Item se Necessário**

```sql
-- Em caso extremo, recriar manualmente
INSERT INTO crm_opportunities (
    client_id,
    status_id,
    title,
    description,
    source_devolucao_id,
    source_devolucao_type,
    created_at
)
SELECT
    client_id,
    (SELECT id FROM crm_statuses WHERE type = 'opportunity' AND is_active = true AND is_finalizer = false ORDER BY order_index ASC LIMIT 1),
    title,
    description,
    id,
    'order',
    NOW()
FROM crm_orders
WHERE id = [ID_ORIGINAL];
```

### 5. Dados Perdidos Durante Devolução

#### Sintomas

- Item é criado na esteira de destino, mas faltam dados importantes
- Campos customizados não foram copiados
- Anexos ou relacionamentos perdidos

#### Diagnóstico

```sql
-- Comparar dados entre origem e destino
SELECT 'ORIGEM' as tipo, id, title, description, custom_fields
FROM crm_orders WHERE id = [ID_ORIGINAL]
UNION ALL
SELECT 'DESTINO' as tipo, id, title, description, custom_fields
FROM crm_opportunities WHERE source_devolucao_id = [ID_ORIGINAL];

-- Verificar campos customizados
SELECT
    cf.field_name,
    cf.field_type,
    cf.entity_type
FROM custom_fields cf
WHERE cf.entity_type IN ('order', 'opportunity');
```

#### Soluções

**Solução 1: Atualizar Dados Manualmente**

```sql
-- Copiar dados faltantes
UPDATE crm_opportunities
SET
    custom_fields = (
        SELECT custom_fields
        FROM crm_orders
        WHERE id = [ID_ORIGINAL]
    ),
    description = (
        SELECT description
        FROM crm_orders
        WHERE id = [ID_ORIGINAL]
    )
WHERE source_devolucao_id = [ID_ORIGINAL];
```

**Solução 2: Executar Script de Correção**

```sql
-- Script para corrigir devoluções com dados incompletos
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT o.id as opp_id, ord.id as order_id, ord.custom_fields
        FROM crm_opportunities o
        JOIN crm_orders ord ON o.source_devolucao_id = ord.id
        WHERE o.custom_fields IS NULL OR o.custom_fields = '{}'::jsonb
    LOOP
        UPDATE crm_opportunities
        SET custom_fields = rec.custom_fields
        WHERE id = rec.opp_id;

        RAISE NOTICE 'Corrigido oportunidade % com dados do pedido %', rec.opp_id, rec.order_id;
    END LOOP;
END $$;
```

### 6. Performance Lenta em Devoluções

#### Sintomas

- Processo de devolução demora muito para completar
- Interface trava durante a operação
- Timeout em operações

#### Diagnóstico

```sql
-- Verificar queries lentas relacionadas a devoluções
SELECT
    query,
    mean_exec_time,
    calls,
    total_exec_time
FROM pg_stat_statements
WHERE query LIKE '%devolucao%'
OR query LIKE '%crm_opportunities%'
OR query LIKE '%crm_orders%'
ORDER BY mean_exec_time DESC;

-- Verificar tamanho das tabelas
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_stat_get_tuples_returned(c.oid) as rows_read
FROM pg_tables pt
JOIN pg_class c ON c.relname = pt.tablename
WHERE tablename LIKE 'crm_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Soluções

**Solução 1: Otimizar Índices**

```sql
-- Criar índices para melhorar performance
CREATE INDEX CONCURRENTLY idx_crm_opportunities_source_devolucao
ON crm_opportunities (source_devolucao_id, source_devolucao_type);

CREATE INDEX CONCURRENTLY idx_crm_orders_client_status
ON crm_orders (client_id, status_id);

CREATE INDEX CONCURRENTLY idx_crm_devolucao_audit_source
ON crm_devolucao_audit (source_type, source_id);
```

**Solução 2: Otimizar Queries**

```sql
-- Analisar plano de execução
EXPLAIN ANALYZE
SELECT o.*, c.company_name, s.name as status_name
FROM crm_opportunities o
JOIN client_portfolio c ON o.client_id = c.id
JOIN crm_statuses s ON o.status_id = s.id
WHERE o.source_devolucao_id IS NOT NULL;
```

**Solução 3: Limpeza de Dados**

```sql
-- Limpar registros antigos de auditoria (manter últimos 6 meses)
DELETE FROM crm_devolucao_audit
WHERE created_at < NOW() - INTERVAL '6 months';

-- Reindexar tabelas
REINDEX TABLE crm_opportunities;
REINDEX TABLE crm_orders;
REINDEX TABLE crm_devolucao_audit;
```

## Procedimentos de Recuperação

### Recuperação de Devolução Falhada

1. **Identificar o Problema**

   ```sql
   -- Encontrar devoluções incompletas
   SELECT da.*
   FROM crm_devolucao_audit da
   LEFT JOIN crm_opportunities o ON da.target_id = o.id AND da.target_type = 'opportunity'
   LEFT JOIN crm_orders ord ON da.target_id = ord.id AND da.target_type = 'order'
   WHERE o.id IS NULL AND ord.id IS NULL;
   ```

2. **Recriar Item de Destino**

   ```sql
   -- Exemplo para oportunidade
   INSERT INTO crm_opportunities (
       client_id, status_id, title, description,
       source_devolucao_id, source_devolucao_type
   )
   SELECT
       client_id,
       (SELECT id FROM crm_statuses WHERE type = 'opportunity' AND is_waiting_status = true LIMIT 1),
       title,
       description,
       id,
       'order'
   FROM crm_orders
   WHERE id = [ID_ORIGINAL];
   ```

3. **Atualizar Auditoria**
   ```sql
   -- Atualizar registro de auditoria com ID correto
   UPDATE crm_devolucao_audit
   SET target_id = [NOVO_ID]
   WHERE source_id = [ID_ORIGINAL]
   AND target_id IS NULL;
   ```

### Rollback de Devolução

1. **Identificar Devolução a Reverter**

   ```sql
   SELECT * FROM crm_devolucao_audit
   WHERE target_id = [ID_ITEM_CRIADO];
   ```

2. **Restaurar Status Original**

   ```sql
   -- Restaurar status do item original
   UPDATE crm_orders
   SET status_id = [STATUS_ANTERIOR]
   WHERE id = [ID_ORIGINAL];
   ```

3. **Remover Item Criado**

   ```sql
   -- Remover item criado pela devolução
   DELETE FROM crm_opportunities
   WHERE id = [ID_ITEM_CRIADO]
   AND source_devolucao_id = [ID_ORIGINAL];
   ```

4. **Registrar Rollback**
   ```sql
   -- Registrar operação de rollback
   INSERT INTO crm_devolucao_audit (
       source_type, source_id, target_type, target_id,
       user_id, reason, metadata
   ) VALUES (
       'rollback', [ID_ITEM_CRIADO], 'order', [ID_ORIGINAL],
       [USER_ID], 'Rollback de devolução',
       '{"operation": "rollback", "original_devolucao_id": [AUDIT_ID]}'::jsonb
   );
   ```

## Scripts de Manutenção

### Verificação de Integridade

```sql
-- Script completo de verificação
DO $$
DECLARE
    issues_count INTEGER := 0;
BEGIN
    -- Verificar devoluções órfãs
    SELECT COUNT(*) INTO issues_count
    FROM crm_devolucao_audit da
    LEFT JOIN crm_opportunities o ON da.target_id = o.id AND da.target_type = 'opportunity'
    LEFT JOIN crm_orders ord ON da.target_id = ord.id AND da.target_type = 'order'
    WHERE o.id IS NULL AND ord.id IS NULL;

    IF issues_count > 0 THEN
        RAISE NOTICE 'PROBLEMA: % devoluções órfãs encontradas', issues_count;
    END IF;

    -- Verificar status de espera
    SELECT COUNT(*) INTO issues_count
    FROM crm_statuses
    WHERE is_waiting_status = true;

    IF issues_count = 0 THEN
        RAISE NOTICE 'PROBLEMA: Nenhum status de espera configurado';
    END IF;

    RAISE NOTICE 'Verificação de integridade concluída';
END $$;
```

### Limpeza Automática

```sql
-- Script de limpeza mensal
DELETE FROM crm_devolucao_audit
WHERE created_at < NOW() - INTERVAL '1 year';

-- Reindexar após limpeza
REINDEX TABLE crm_devolucao_audit;
```

## Contato e Escalação

### Níveis de Suporte

**Nível 1 - Suporte Básico**

- Problemas de permissão
- Questões de interface
- Dúvidas de uso

**Nível 2 - Suporte Técnico**

- Problemas de performance
- Erros de validação
- Recuperação de dados

**Nível 3 - Desenvolvimento**

- Bugs críticos
- Problemas de integridade
- Modificações no sistema

### Informações para Suporte

Ao reportar problemas, inclua:

1. **ID do usuário** afetado
2. **ID do item** envolvido na devolução
3. **Timestamp** do problema
4. **Mensagem de erro** completa
5. **Passos** para reproduzir o problema
6. **Logs** relevantes do sistema

### Logs Importantes

```bash
# Logs de aplicação
tail -f /var/log/app/crm-devolucao.log

# Logs de banco de dados
tail -f /var/log/postgresql/postgresql.log | grep -i devolucao

# Logs de auditoria
SELECT * FROM audit_logs
WHERE action LIKE 'crm:devolucao:%'
AND created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

**Última atualização**: Dezembro 2025  
**Versão do documento**: 1.0  
**Versão do sistema**: CRM Bidirectional Flow v1.0
