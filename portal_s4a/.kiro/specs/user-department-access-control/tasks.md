# Implementation Plan: User Department Access Control

## Overview

Este plano implementa o controle de acesso de usuários a operações e departamentos no sistema CRM. A implementação segue uma abordagem incremental, começando pelo backend e progredindo para o frontend.

## Tasks

- [x] 1. Atualizar Backend de Usuários
  - [x] 1.1 Atualizar schema de usuário para incluir department_ids
    - Adicionar campo `department_ids` ao `userFormSchema` em `src/lib/schemas/user.ts`
    - Criar tipo `UserWithDepartments` que estende `UserWithPermissions`
    - _Requirements: 1.3_

  - [x] 1.2 Atualizar actions de usuário para gerenciar acesso a departamentos
    - Modificar `createUser()` para salvar department_ids na tabela `user_department_access`
    - Modificar `updateUser()` para atualizar department_ids atomicamente
    - Criar `getUserWithDepartments()` para carregar usuário com departamentos
    - _Requirements: 1.3, 1.4, 6.4_

  - [ ]* 1.3 Escrever property test para persistência de acesso a departamentos
    - **Property 1: Department Access Persistence Round-Trip**
    - **Validates: Requirements 1.3, 1.4**

- [x] 2. Criar Componente de Seleção de Departamentos para Usuários
  - [x] 2.1 Criar componente UserDepartmentAccessSection
    - Criar `src/components/settings/user-department-access-section.tsx`
    - Exibir operações com departamentos aninhados usando checkboxes
    - Implementar toggle de operação para selecionar/deselecionar todos os departamentos
    - Filtrar operações e departamentos inativos
    - _Requirements: 1.1, 1.2, 6.1, 6.2, 6.3, 6.5, 6.6_

  - [x] 2.2 Integrar componente no formulário de usuário
    - Modificar `src/components/settings/user-form.tsx`
    - Adicionar seção de acesso a departamentos (oculta para admins)
    - Exibir warning quando nenhum departamento selecionado para não-admin
    - _Requirements: 1.5, 1.6_

  - [ ]* 2.3 Escrever property tests para agrupamento e toggle
    - **Property 7: Departments Are Grouped By Operation**
    - **Property 8: Operation Toggle Affects All Child Departments**
    - **Validates: Requirements 1.2, 6.2, 6.3**

- [x] 3. Checkpoint - Validar Cadastro de Usuários
  - ✅ TypeScript diagnostics passed for all implemented files
  - ✅ Schema includes department_ids field
  - ✅ createUser/updateUser handle department access atomically
  - ✅ getUserWithDepartments loads user with departments
  - ✅ UserDepartmentAccessSection component functional
  - ✅ Warning displayed for non-admin without departments
  - Note: Pre-existing test infrastructure issues (missing DATABASE_URL, Jest/Vitest conflicts) - unrelated to this feature

- [x] 4. Implementar Validação de Acesso para Criação de Registros CRM
  - [x] 4.1 Criar função de validação de acesso
    - Criar `validateUserCanCreateCrmRecord()` em `src/lib/actions/department-access.actions.ts`
    - Retornar `canCreate: true` para admins
    - Retornar `canCreate: true` com `defaultDepartmentId` para usuários com acesso
    - Retornar `canCreate: false` com mensagem de erro para usuários sem acesso
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.2 Integrar validação nas actions de criação do CRM
    - Modificar `createOpportunity()` em `src/lib/actions/crm.actions.ts`
    - Modificar `createOrder()` para validar acesso antes de criar
    - Modificar `createPostSale()` para validar acesso antes de criar
    - Bloquear criação e retornar erro se usuário não tiver acesso
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 4.3 Escrever property test para validação de acesso
    - **Property 2: Non-Admin Users Without Access Cannot Create CRM Records**
    - **Property 3: Users With Access Can Create Records With Auto-Assignment**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3**

- [x] 5. Implementar Seleção de Departamento para Administradores
  - [x] 5.1 Criar componente AdminDepartmentSelector
    - Criar `src/components/crm/admin-department-selector.tsx`
    - Dropdown de operação que filtra departamentos
    - Dropdown de departamento filtrado pela operação selecionada
    - Validação de campo obrigatório
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

  - [x] 5.2 Integrar seletor nos formulários CRM para admins
    - Modificar `src/components/crm/opportunities/opportunity-form.tsx`
    - Modificar formulário de pedidos para incluir seletor
    - Modificar formulário de pós-venda para incluir seletor
    - Exibir seletor apenas para usuários admin
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [ ]* 5.3 Escrever property test para filtro de departamentos
    - **Property 4: Admin Department Selection Filters Correctly**
    - **Validates: Requirements 3.4**

- [x] 6. Checkpoint - Validar Criação de Registros
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implementar Filtro de Dados por Perfil de Usuário
  - [x] 7.1 Atualizar DepartmentContext para suportar perfil admin
    - Modificar `src/contexts/department-context.tsx`
    - Admins carregam todos os departamentos disponíveis
    - Não-admins carregam apenas departamentos com acesso
    - _Requirements: 4.2, 4.4_

  - [x] 7.2 Atualizar DepartmentSelector no header
    - Modificar `src/components/crm/department-selector.tsx`
    - Admins veem todas as operações/departamentos
    - Não-admins veem apenas departamentos com acesso
    - Exibir mensagem quando usuário não tem acesso a nenhum departamento
    - _Requirements: 4.2, 4.4, 4.5, 4.6_

  - [x] 7.3 Atualizar queries do CRM para filtrar por perfil
    - Modificar `getOpportunities()` para admins verem todos os registros
    - Modificar `getOrders()` para admins verem todos os registros
    - Modificar `getPostSales()` para admins verem todos os registros
    - Não-admins continuam vendo apenas registros dos seus departamentos
    - _Requirements: 4.1, 4.3_

  - [ ]* 7.4 Escrever property tests para visibilidade de dados
    - **Property 5: Admin Users See All Data**
    - **Property 6: Non-Admin Users See Only Assigned Department Data**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 8. Implementar Auto-Seleção de Departamento
  - [x] 8.1 Implementar lógica de auto-seleção
    - Modificar `validateUserCanCreateCrmRecord()` para retornar departamento padrão
    - Se usuário tem apenas um departamento, usar automaticamente
    - Se contexto não está definido, usar primeiro departamento disponível
    - _Requirements: 5.4, 5.5_

  - [ ]* 8.2 Escrever property test para auto-seleção
    - **Property 10: Single Department Auto-Selection**
    - **Validates: Requirements 5.4, 5.5**

- [x] 9. Checkpoint Final - Validar Sistema Completo
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implementar Filtro de Itens Inativos
  - [x] 10.1 Filtrar operações e departamentos inativos em todas as listagens
    - Atualizar `getOperations()` para filtrar inativos
    - Atualizar `getDepartments()` para filtrar inativos
    - Atualizar `getUserDepartments()` para filtrar inativos
    - _Requirements: 6.5_

  - [ ]* 10.2 Escrever property test para filtro de inativos
    - **Property 9: Inactive Items Are Hidden**
    - **Validates: Requirements 6.5**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases

## Dependencies

- Tabelas `operations`, `departments`, `user_department_access` já existem
- Sistema de departamentos já está implementado
- Formulários CRM já suportam `department_id`
- `DepartmentContext` e `useDepartment` hook já existem
