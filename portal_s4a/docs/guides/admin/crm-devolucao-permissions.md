# Guia do Administrador: Configuração de Permissões de Devolução CRM

## Visão Geral

Este guia detalha como configurar e gerenciar permissões para o sistema de devolução CRM, permitindo controle granular sobre quem pode realizar operações de devolução em cada estágio do pipeline.

## Sistema de Permissões

### Estrutura de Permissões

O sistema utiliza permissões baseadas em roles com controle granular por operação:

```
crm:devolucao:[source]_to_[target]
```

### Permissões Disponíveis

#### Devolução de Pedido para Oportunidade

- **Permissão**: `crm:devolucao:order_to_opportunity`
- **Descrição**: Permite devolver pedidos para a esteira de oportunidades
- **Uso**: Usuários com esta permissão verão o botão "Devolver para Oportunidade" em pedidos

#### Devolução de Demanda para Pedido

- **Permissão**: `crm:devolucao:post_sales_to_order`
- **Descrição**: Permite devolver demandas para a esteira de pedidos
- **Uso**: Usuários com esta permissão verão o botão "Devolver para Pedido" em demandas

#### Visualização de Auditoria

- **Permissão**: `crm:audit:view`
- **Descrição**: Permite visualizar trilha de auditoria de devoluções
- **Uso**: Necessária para acessar histórico completo de devoluções

#### Gerenciamento de Status

- **Permissão**: `crm:status:manage`
- **Descrição**: Permite configurar status finalizadores e de espera
- **Uso**: Necessária para configurar o sistema de status

## Configuração de Permissões

### Através da Interface Web

1. **Acesse Configurações**
   - Navegue para `Configurações > Usuários`
   - Selecione o usuário que deseja configurar

2. **Edite Permissões**
   - Clique em "Editar" no usuário selecionado
   - Vá para a seção "Permissões"

3. **Configure Permissões de Devolução**
   - Marque as permissões desejadas:
     - ☐ `crm:devolucao:order_to_opportunity`
     - ☐ `crm:devolucao:post_sales_to_order`
     - ☐ `crm:audit:view`
     - ☐ `crm:status:manage`

4. **Salve as Alterações**
   - Clique em "Salvar"
   - As permissões entram em vigor imediatamente

### Através do Banco de Dados

#### Estrutura da Tabela de Permissões

```sql
-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exemplo de inserção com permissões
INSERT INTO users (email, role, permissions) VALUES (
    'usuario@empresa.com',
    'sales_manager',
    ARRAY[
        'crm:devolucao:order_to_opportunity',
        'crm:devolucao:post_sales_to_order',
        'crm:audit:view'
    ]
);
```

#### Consultas Úteis

```sql
-- Listar usuários com permissões de devolução
SELECT email, role, permissions
FROM users
WHERE permissions && ARRAY['crm:devolucao:order_to_opportunity', 'crm:devolucao:post_sales_to_order'];

-- Adicionar permissão a um usuário
UPDATE users
SET permissions = array_append(permissions, 'crm:devolucao:order_to_opportunity')
WHERE email = 'usuario@empresa.com';

-- Remover permissão de um usuário
UPDATE users
SET permissions = array_remove(permissions, 'crm:devolucao:order_to_opportunity')
WHERE email = 'usuario@empresa.com';

-- Verificar permissões de um usuário específico
SELECT email, permissions
FROM users
WHERE email = 'usuario@empresa.com';
```

## Roles Pré-definidos

### Administrador (admin)

```json
{
  "role": "admin",
  "permissions": [
    "crm:devolucao:order_to_opportunity",
    "crm:devolucao:post_sales_to_order",
    "crm:audit:view",
    "crm:status:manage",
    "crm:*"
  ]
}
```

### Gerente de Vendas (sales_manager)

```json
{
  "role": "sales_manager",
  "permissions": [
    "crm:devolucao:order_to_opportunity",
    "crm:devolucao:post_sales_to_order",
    "crm:audit:view"
  ]
}
```

### Vendedor (sales_user)

```json
{
  "role": "sales_user",
  "permissions": ["crm:devolucao:order_to_opportunity"]
}
```

### Suporte Pós-Vendas (support_user)

```json
{
  "role": "support_user",
  "permissions": ["crm:devolucao:post_sales_to_order", "crm:audit:view"]
}
```

## Configuração de Status

### Status Finalizadores

1. **Acesse Configurações de Status**
   - Navegue para `CRM > Configurações > Status`

2. **Configure Status Finalizador**
   - Selecione o status desejado
   - Marque a opção "É Status Finalizador"
   - Salve as alterações

3. **Verificação**
   - Itens com este status serão ocultados por padrão
   - Aparecerão apenas quando "Mostrar Finalizados" estiver ativo

### Status Operacionais de Devolucao

1. **Criar Status de Destino**
   - Garanta ao menos um status ativo e nao finalizador por tipo
   - Use nomes como "Em Revisao" ou "Reprocessamento"
   - Configure para cada tipo de pipeline (Oportunidade, Pedido, Demanda)

2. **Comportamento Atual**
   - O sistema nao cria mais status automaticamente para devolucao
   - O destino e escolhido explicitamente na operacao

## Monitoramento e Auditoria

### Logs de Permissão

#### Verificar Tentativas de Acesso Negado

```sql
-- Consultar logs de auditoria para tentativas negadas
SELECT
    user_id,
    action,
    resource,
    result,
    created_at
FROM audit_logs
WHERE result = 'PERMISSION_DENIED'
AND action LIKE 'crm:devolucao:%'
ORDER BY created_at DESC;
```

#### Monitorar Uso de Permissões

```sql
-- Usuários que mais usam devoluções
SELECT
    u.email,
    COUNT(*) as devolucoes_realizadas
FROM crm_devolucao_audit da
JOIN users u ON da.user_id = u.id
WHERE da.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.email
ORDER BY devolucoes_realizadas DESC;
```

### Relatórios de Permissão

#### Script para Gerar Relatório

```sql
-- Relatório completo de permissões de devolução
SELECT
    u.email,
    u.role,
    CASE
        WHEN 'crm:devolucao:order_to_opportunity' = ANY(u.permissions) THEN 'Sim'
        ELSE 'Não'
    END as pode_devolver_pedido,
    CASE
        WHEN 'crm:devolucao:post_sales_to_order' = ANY(u.permissions) THEN 'Sim'
        ELSE 'Não'
    END as pode_devolver_demanda,
    CASE
        WHEN 'crm:audit:view' = ANY(u.permissions) THEN 'Sim'
        ELSE 'Não'
    END as pode_ver_auditoria
FROM users u
WHERE u.is_active = true
ORDER BY u.role, u.email;
```

## Segurança e Boas Práticas

### Princípio do Menor Privilégio

- Conceda apenas as permissões mínimas necessárias
- Revise permissões regularmente
- Remova permissões de usuários inativos

### Auditoria Regular

- Monitore uso de permissões mensalmente
- Identifique padrões anômalos de uso
- Documente mudanças de permissão

### Backup de Configurações

```sql
-- Backup das permissões atuais
CREATE TABLE users_permissions_backup AS
SELECT id, email, role, permissions, created_at
FROM users
WHERE created_at <= NOW();
```

### Rotação de Permissões

- Revise permissões trimestralmente
- Atualize baseado em mudanças de função
- Documente justificativas para permissões especiais

## Troubleshooting

### Usuário Não Vê Botão de Devolução

1. **Verificar Permissões**

   ```sql
   SELECT permissions FROM users WHERE email = 'usuario@empresa.com';
   ```

2. **Verificar Role**

   ```sql
   SELECT role FROM users WHERE email = 'usuario@empresa.com';
   ```

3. **Verificar Cache**
   - Peça ao usuário para fazer logout/login
   - Limpe cache do navegador se necessário

### Erro de Permissão Negada

1. **Verificar Logs**

   ```sql
   SELECT * FROM audit_logs
   WHERE user_id = (SELECT id FROM users WHERE email = 'usuario@empresa.com')
   AND result = 'PERMISSION_DENIED'
   ORDER BY created_at DESC LIMIT 10;
   ```

2. **Verificar Configuração**
   - Confirme se a permissão está corretamente configurada
   - Verifique se não há conflitos de role

### Performance de Verificação de Permissões

1. **Otimizar Consultas**

   ```sql
   -- Criar índice para melhorar performance
   CREATE INDEX idx_users_permissions ON users USING GIN (permissions);
   ```

2. **Cache de Permissões**
   - Implemente cache de permissões no lado da aplicação
   - Configure TTL apropriado (ex: 15 minutos)

## Scripts de Manutenção

### Script de Limpeza de Permissões Órfãs

```sql
-- Remover permissões que não existem mais no sistema
UPDATE users
SET permissions = array(
    SELECT unnest(permissions)
    WHERE unnest(permissions) IN (
        'crm:devolucao:order_to_opportunity',
        'crm:devolucao:post_sales_to_order',
        'crm:audit:view',
        'crm:status:manage'
    )
);
```

### Script de Migração de Permissões

```sql
-- Migrar permissões antigas para novo formato
UPDATE users
SET permissions = array_replace(permissions, 'old_permission', 'crm:devolucao:order_to_opportunity')
WHERE 'old_permission' = ANY(permissions);
```

## Contato e Suporte

### Suporte Técnico

- **Email**: admin@empresa.com
- **Documentação**: Consulte o manual técnico para desenvolvedores
- **Logs**: Monitore logs de aplicação para erros de permissão

### Escalação

- **Problemas críticos**: Contate o administrador de sistema imediatamente
- **Mudanças de permissão**: Documente e aprove através do processo estabelecido
- **Auditoria**: Mantenha registros de todas as alterações de permissão

---

**Última atualização**: Dezembro 2025  
**Versão do documento**: 1.0  
**Versão do sistema**: CRM Bidirectional Flow v1.0
