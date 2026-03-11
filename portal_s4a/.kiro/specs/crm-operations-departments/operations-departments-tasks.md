# Plano de Implementação: Sistema de Operações e Departamentos

**Data:** 10/12/2025  
**Status:** 📋 Plano de Implementação  
**Baseado em:** operations-departments-design.md

---

## 📋 Visão Geral

Plano detalhado para implementação do sistema hierárquico de Operações e Departamentos no CRM, dividido em 5 fases incrementais com tasks específicas e testáveis.

---

## 🏗️ Fase 1: Estrutura Base do Banco de Dados (3-5 dias)

### - [ ] 1.1 Criar migrations do banco de dados
- Criar arquivo `src/lib/migrations/004_operations_departments_base.sql`
- Implementar tabelas: operations, departments, user_department_access, department_configurations
- Adicionar constraints e relacionamentos apropriados
- _Requirements: RF001, RF002, RF005_

### - [ ] 1.2 Adicionar colunas department_id às tabelas CRM
- Criar arquivo `src/lib/migrations/005_add_department_columns.sql`
- Adicionar department_id em: crm_opportunities, crm_orders, crm_post_sales, crm_statuses, products, client_portfolio
- Configurar como nullable inicialmente para compatibilidade
- _Requirements: RF004_

### - [ ] 1.3 Criar índices de performance
- Criar arquivo `src/lib/migrations/006_department_indexes.sql`
- Implementar índices para todas as foreign keys e colunas de filtro
- Otimizar queries por department_id
- _Requirements: Performance_

### - [ ] 1.4 Implementar schemas de validação Zod
- Criar `src/lib/schemas/operations.ts` com OperationSchema
- Criar `src/lib/schemas/departments.ts` com DepartmentSchema
- Criar `src/lib/schemas/department-access.ts` com validações de acesso
- _Requirements: RF001, RF002, RF005_

### - [ ] 1.5 Executar migrations no banco de desenvolvimento
- Aplicar migrations na branch develop
- Verificar integridade dos dados
- Testar rollback das migrations
- _Requirements: RF001, RF002_

---

## 🔧 Fase 2: Server Actions Base (4-6 dias)

### - [ ] 2.1 Implementar actions de operações
- Criar `src/lib/actions/operations.actions.ts`
- Implementar: getOperations, createOperation, updateOperation, deleteOperation, toggleOperationStatus
- Adicionar validações de negócio para exclusão
- _Requirements: RF001_

### - [ ] 2.2 Escrever testes de propriedade para operações
- **Property 2: Edição de operação reflete em departamentos**
- **Property 4: Exclusão de operação valida dependências**
- **Validates: Requirements RF001.3, RF001.5**

### - [ ] 2.3 Implementar actions de departamentos
- Criar `src/lib/actions/departments.actions.ts`
- Implementar: getDepartments, createDepartment, updateDepartment, deleteDepartment, toggleDepartmentStatus
- Adicionar validação de dependências para exclusão
- _Requirements: RF002_

### - [ ] 2.4 Escrever testes de propriedade para departamentos
- **Property 5: Departamento herda configurações da operação**
- **Property 8: Exclusão de departamento valida dependências**
- **Validates: Requirements RF002.2, RF002.5**

### - [ ] 2.5 Implementar actions de acesso de usuários
- Criar `src/lib/actions/department-access.actions.ts`
- Implementar: getUserDepartments, grantDepartmentAccess, revokeDepartmentAccess, getUsersWithDepartmentAccess
- Adicionar middleware de validação de acesso
- _Requirements: RF005_

### - [ ] 2.6 Escrever testes de propriedade para controle de acesso
- **Property 18: Lista de departamentos respeita permissões**
- **Property 20: Remoção de acesso é imediata**
- **Validates: Requirements RF005.2, RF005.4**

### - [ ] 2.7 Implementar actions de configurações por departamento
- Criar `src/lib/actions/department-config.actions.ts`
- Implementar: getDepartmentConfig, updateDepartmentConfig, copyDepartmentConfig, resetDepartmentConfig
- Adicionar validações de tipos de configuração
- _Requirements: RF003_

### - [ ] 2.8 Escrever testes de propriedade para configurações
- **Property 6: Configurações de departamento são independentes**
- **Property 11: Cópia de configurações replica corretamente**
- **Validates: Requirements RF002.3, RF003.4**

---

## 🎨 Fase 3: Interface de Gestão (5-7 dias)

### - [ ] 3.1 Criar componente de gestão de operações
- Criar `src/components/crm/operations/operations-manager.tsx`
- Implementar CRUD completo com validações
- Adicionar confirmações para exclusão
- _Requirements: RF001_

### - [ ] 3.2 Criar componente de gestão de departamentos
- Criar `src/components/crm/departments/departments-manager.tsx`
- Implementar gestão por operação
- Adicionar interface de configurações específicas
- _Requirements: RF002_

### - [ ] 3.3 Criar página de configurações CRM
- Criar `src/app/crm/config/operations/page.tsx`
- Implementar layout com abas (Operações, Departamentos, Permissões)
- Integrar componentes de gestão
- _Requirements: RF001, RF002, RF005_

### - [ ] 3.4 Implementar componente de configurações por departamento
- Criar `src/components/crm/departments/department-config.tsx`
- Implementar interface para configurar status, campos personalizados
- Adicionar funcionalidade de cópia entre departamentos
- _Requirements: RF003_

### - [ ] 3.5 Escrever testes de propriedade para configurações específicas
- **Property 9: Status são únicos por departamento**
- **Property 10: Campos personalizados são específicos**
- **Validates: Requirements RF003.2, RF003.3**

### - [ ] 3.6 Criar componente de gestão de permissões de usuários
- Criar `src/components/settings/user-department-permissions.tsx`
- Implementar interface para atribuir departamentos a usuários
- Adicionar busca e filtros de usuários
- _Requirements: RF005_

### - [ ] 3.7 Atualizar página de permissões de usuários
- Modificar `src/app/settings/permissions/page.tsx`
- Integrar gestão de departamentos nas permissões existentes
- Manter compatibilidade com sistema atual
- _Requirements: RF005_

---

## 🔄 Fase 4: Segmentação CRM e Seletor (6-8 dias)

### - [x] 4.1 Criar context provider de departamento
- ✅ Criado `src/contexts/department-context.tsx`
- ✅ Implementado gerenciamento de estado global
- ✅ Adicionado persistência no localStorage
- ✅ Integrado no ClientDashboardLayout
- _Requirements: RF006_

### - [x] 4.2 Criar hook de departamento
- ✅ Criado `src/hooks/use-department.tsx`
- ✅ Implementado interface simplificada para componentes
- ✅ Adicionado validações de acesso
- ✅ Helpers para ID e nome do departamento
- _Requirements: RF006_

### - [x] 4.3 Criar seletor de departamento
- ✅ Criado `src/components/crm/departments/department-selector.tsx`
- ✅ Implementado no header da aplicação
- ✅ Adicionado filtro por permissões do usuário
- ✅ Suporte para múltiplos departamentos e departamento único
- _Requirements: RF006_

### - [ ] 4.4 Escrever testes de propriedade para seletor
- **Property 22: Seleção filtra toda interface**
- **Property 24: Seletor filtra por permissões**
- **Validates: Requirements RF006.2, RF006.4**

### - [x] 4.5 Atualizar actions CRM existentes - Oportunidades
- ✅ Modificado `src/lib/actions/crm.actions.ts` - funções de oportunidades
- ✅ Adicionado filtro por department_id em getOpportunities()
- ✅ Implementado department_id em createOpportunity()
- ✅ Atualizado schema CrmOpportunitySchema
- _Requirements: RF004_

### - [ ] 4.6 Escrever testes de propriedade para oportunidades
- **Property 13: Dados são filtrados por departamento**
- **Property 14: Criação vincula ao departamento automaticamente**
- **Validates: Requirements RF004.1, RF004.2**

### - [x] 4.7 Atualizar actions CRM existentes - Pedidos
- ✅ Modificado funções de pedidos em `src/lib/actions/crm.actions.ts`
- ✅ Adicionado segmentação por departamento em getOrders()
- ✅ Implementado department_id em createOrder()
- ✅ Atualizado schema CrmOrderSchema
- _Requirements: RF004_

### - [x] 4.8 Atualizar actions CRM existentes - Demandas
- ✅ Modificado funções de pós-vendas em `src/lib/actions/crm.actions.ts`
- ✅ Implementado filtros por departamento em getPostSales()
- ✅ Adicionado department_id em createPostSale()
- ✅ Atualizado schema CrmPostSalesSchema
- _Requirements: RF004_

### - [x] 4.9 Atualizar CRM Status e Client Transactions
- ✅ Modificado getCrmStatuses() para filtrar por departamento
- ✅ Atualizado createCrmStatus() e updateCrmStatus() com department_id
- ✅ Modificado getClientTransactions() para filtrar por departamento
- ✅ Corrigido schema CrmStatusSchema para department_id
- _Requirements: RF004_

### - [x] 4.11 Atualizar Products Actions
- ✅ Modificado getProducts() para filtrar por departamento
- ✅ Atualizado createProduct() com department_id
- ✅ Produtos globais (department_id IS NULL) visíveis em todos os departamentos
- _Requirements: RF004_

### - [ ] 4.10 Escrever testes de propriedade para segmentação geral
- **Property 15: Mudança de departamento filtra dados**
- **Property 16: Busca respeita escopo do departamento**
- **Validates: Requirements RF004.3, RF004.4**

---

## 🔐 Fase 5: Integração e Migração (4-6 dias)

### - [x] 5.1 Atualizar componentes CRM existentes - Oportunidades
- ✅ Modificado `src/components/crm/opportunities/kanban-board.tsx`
- ✅ Integrado useDepartment hook
- ✅ Adicionado filtro por departamento nas queries
- ✅ Implementado recarregamento automático ao trocar departamento
- _Requirements: RF004, RF006_

### - [x] 5.2 Atualizar componentes CRM existentes - Pedidos e Demandas
- ✅ Modificado `src/components/crm/orders/order-list.tsx`
- ✅ Modificado `src/components/crm/post-sales/post-sales-list.tsx`
- ✅ Integrado context de departamento em ambos
- ✅ Adicionado filtro por departamento nas queries
- ✅ Implementado recarregamento automático ao trocar departamento
- _Requirements: RF004, RF006_

### - [x] 5.3 Atualizar componentes CRM existentes - Produtos
- ✅ Modificado `src/app/crm/products/page.tsx` para client-side
- ✅ Modificado `src/components/crm/products/products-client-page.tsx`
- ✅ Integrado context de departamento
- ✅ Adicionado filtro por departamento nas queries
- ✅ Implementado carregamento client-side com department context
- _Requirements: RF004, RF006_

### - [x] 5.4 Atualizar formulários para incluir department_id automaticamente
- ✅ Modificado `src/components/crm/opportunities/opportunity-form.tsx`
- ✅ Modificado `src/components/crm/orders/order-form.tsx`
- ✅ Modificado `src/components/crm/post-sales/post-sales-form.tsx`
- ✅ Modificado `src/components/crm/products/product-form.tsx`
- ✅ Todos os formulários incluem department_id automaticamente na criação
- _Requirements: RF004_

### - [ ] 5.5 Implementar middleware de validação de acesso (OPCIONAL)
- Criar `src/lib/middleware/department-access.ts`
- Adicionar validações em todas as server actions
- Implementar logs de auditoria
- _Requirements: RF005_
- _Status: Movido para fase opcional - sistema já funciona com validações nas actions_

### - [ ] 5.3 Escrever testes de propriedade para controle de acesso
- **Property 7: Desativação de departamento remove acesso**
- **Property 19: Departamentos sem acesso são invisíveis**
- **Validates: Requirements RF002.4, RF005.3**

### - [ ] 5.4 Criar script de migração de dados existentes
- Criar operação "Principal" padrão
- Criar departamento "Geral" padrão
- Migrar todos os dados existentes para departamento padrão
- _Requirements: Migração_

### - [ ] 5.5 Implementar validações de negócio
- Criar `src/lib/validations/department-business-rules.ts`
- Implementar regras para exclusão de operações e departamentos
- Adicionar validações de integridade de dados
- _Requirements: RF001, RF002_

### - [ ] 5.6 Escrever testes de propriedade para validações
- **Property 3: Desativação de operação desativa departamentos**
- **Property 12: Restauração volta ao estado inicial**
- **Validates: Requirements RF001.4, RF003.5**

### - [ ] 5.7 Atualizar sistema de permissões existente
- Integrar departamentos no sistema de roles atual
- Manter compatibilidade com permissões existentes
- Adicionar novas permissões específicas para operações/departamentos
- _Requirements: RF005_

### - [ ] 5.8 Escrever testes de propriedade para múltiplos acessos
- **Property 21: Múltiplos acessos permitem alternância**
- **Property 25: Departamentos inativos não são selecionáveis**
- **Validates: Requirements RF005.5, RF006.5**

---

## ✅ Fase 6: Testes Finais e Documentação (2-3 dias)

### - [ ] 6.1 Checkpoint - Garantir que todos os testes passem
- Executar todos os testes de propriedades implementados
- Verificar integridade dos dados após migração
- Validar performance das queries com segmentação
- Ensure all tests pass, ask the user if questions arise.

### - [ ] 6.2 Implementar error boundaries específicos
- Criar `src/components/error-boundaries/department-error-boundary.tsx`
- Adicionar tratamento de erros específicos do sistema
- Implementar fallbacks para falhas de carregamento
- _Requirements: Tratamento de Erros_

### - [ ] 6.3 Criar documentação de usuário
- Documentar como usar o sistema de operações/departamentos
- Criar guia de migração para administradores
- Documentar permissões e controles de acesso
- _Requirements: Documentação_

### - [ ] 6.4 Executar testes de integração completos
- Testar fluxo completo de criação de operação → departamento → dados CRM
- Validar controle de acesso em cenários complexos
- Testar performance com múltiplos departamentos
- _Requirements: Todos_

### - [ ] 6.5 Preparar deploy para produção
- Validar migrations em ambiente de staging
- Criar plano de rollback
- Documentar processo de deploy
- _Requirements: Deploy_

---

## 📊 Resumo de Propriedades por Fase

### Fase 2 (Server Actions): 6 propriedades
- Property 2, 4, 5, 6, 8, 11, 18, 20

### Fase 3 (Interface): 2 propriedades  
- Property 9, 10

### Fase 4 (Segmentação): 6 propriedades
- Property 13, 14, 15, 16, 22, 24

### Fase 5 (Integração): 6 propriedades
- Property 3, 7, 12, 19, 21, 25

### Total: 20 propriedades de correção implementadas

---

## ⚠️ Pontos de Atenção

### Críticos
- **Backup obrigatório** antes da migração de dados
- **Testes extensivos** em ambiente de desenvolvimento
- **Validação de performance** com dados reais
- **Plano de rollback** detalhado

### Importantes
- **Comunicação com usuários** sobre mudanças
- **Treinamento** para novos recursos
- **Monitoramento** pós-deploy
- **Documentação** atualizada

---

**Plano criado por:** Kiro AI  
**Data:** 10/12/2025  
**Estimativa total:** 6 semanas (24-30 dias úteis)