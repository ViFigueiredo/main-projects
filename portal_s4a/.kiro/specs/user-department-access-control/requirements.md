# Requirements Document

## Introduction

Este documento especifica os requisitos para aprimorar o controle de acesso de usuários a operações e departamentos no sistema CRM. O objetivo é garantir que usuários só possam criar e visualizar dados do pipeline CRM (oportunidades, pedidos, demandas) quando tiverem vínculo com pelo menos uma operação/departamento, e que administradores possam selecionar operação/departamento nos formulários de cadastro.

## Glossary

- **User**: Entidade que representa um usuário do sistema com credenciais de acesso
- **Admin**: Usuário com perfil administrativo que possui acesso total ao sistema
- **Operation**: Entidade que representa uma operação comercial (ex: VIVO, Claro, TIM)
- **Department**: Entidade que representa um departamento dentro de uma operação (ex: B2B, B2C, Corporate)
- **User_Department_Access**: Tabela de relacionamento que vincula usuários a departamentos
- **CRM_Pipeline**: Conjunto de entidades do CRM incluindo oportunidades, pedidos e demandas
- **Department_Selector**: Componente de seleção de departamento no header da aplicação

## Requirements

### Requirement 1: Configuração de Acesso a Departamentos no Cadastro de Usuários

**User Story:** As an administrator, I want to configure department access for users during user creation/editing, so that I can control which operations and departments each user can access.

#### Acceptance Criteria

1. WHEN an administrator opens the user form, THE User_Form SHALL display a section for configuring department access
2. WHEN configuring department access, THE User_Form SHALL display available operations grouped with their respective departments
3. WHEN an administrator selects departments for a user, THE System SHALL save the associations in the user_department_access table
4. WHEN editing an existing user, THE User_Form SHALL pre-populate the currently assigned departments
5. WHEN a user is marked as Admin, THE User_Form SHALL hide the department access section since admins have full access
6. IF no departments are selected for a non-admin user, THEN THE System SHALL display a warning that the user will not be able to create CRM records

### Requirement 2: Validação de Acesso para Criação de Registros CRM

**User Story:** As a system, I want to validate that users have department access before allowing CRM record creation, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN a non-admin user without department access attempts to create an opportunity, THE System SHALL block the creation and display an error message
2. WHEN a non-admin user without department access attempts to create an order, THE System SHALL block the creation and display an error message
3. WHEN a non-admin user without department access attempts to create a post-sale demand, THE System SHALL block the creation and display an error message
4. WHEN a user has at least one department access, THE System SHALL allow CRM record creation with automatic department assignment
5. IF a user's department access is revoked, THEN THE System SHALL prevent new record creation but maintain access to existing records

### Requirement 3: Seleção de Operação e Departamento para Administradores

**User Story:** As an administrator, I want to select operation and department when creating CRM records, so that I can create records for any department in the system.

#### Acceptance Criteria

1. WHEN an admin user opens the opportunity form, THE Opportunity_Form SHALL display operation and department selection fields
2. WHEN an admin user opens the order form, THE Order_Form SHALL display operation and department selection fields
3. WHEN an admin user opens the post-sale form, THE Post_Sale_Form SHALL display operation and department selection fields
4. WHEN an admin selects an operation, THE Form SHALL filter departments to show only those belonging to the selected operation
5. WHEN creating a record, THE System SHALL use the selected department_id for the new record
6. IF no department is selected by admin, THEN THE System SHALL require department selection before saving

### Requirement 4: Filtro de Dados por Perfil de Usuário

**User Story:** As a user, I want to see only the data I have access to, so that I can focus on my relevant work.

#### Acceptance Criteria

1. WHEN an admin user views the CRM pipeline, THE System SHALL display all records from all departments
2. WHEN an admin user uses the Department_Selector, THE System SHALL show all available operations and departments
3. WHEN a non-admin user views the CRM pipeline, THE System SHALL display only records from their assigned departments
4. WHEN a non-admin user uses the Department_Selector, THE System SHALL show only their assigned departments
5. WHEN a non-admin user has multiple department assignments, THE System SHALL allow switching between assigned departments
6. IF a user has no department assignments, THEN THE Department_Selector SHALL display a message indicating no access

### Requirement 5: Criação Automática com Vínculo de Departamento

**User Story:** As a non-admin user, I want my CRM records to be automatically linked to my current department, so that I don't need to manually select it every time.

#### Acceptance Criteria

1. WHEN a non-admin user creates an opportunity, THE System SHALL automatically assign the current selected department_id
2. WHEN a non-admin user creates an order, THE System SHALL automatically assign the current selected department_id
3. WHEN a non-admin user creates a post-sale demand, THE System SHALL automatically assign the current selected department_id
4. WHEN the user has only one department, THE System SHALL use that department automatically without requiring selection
5. IF the current department context is not set, THEN THE System SHALL use the user's first available department

### Requirement 6: Interface de Gerenciamento de Acesso

**User Story:** As an administrator, I want a clear interface to manage user department access, so that I can efficiently configure permissions.

#### Acceptance Criteria

1. WHEN viewing the user form, THE System SHALL display department access in a collapsible section with checkboxes
2. WHEN operations have multiple departments, THE System SHALL group departments under their parent operation
3. WHEN selecting/deselecting an operation header, THE System SHALL toggle all departments within that operation
4. WHEN saving user changes, THE System SHALL update the user_department_access table atomically
5. IF an operation or department is inactive, THEN THE System SHALL not display it in the selection list
6. WHEN a department is assigned, THE System SHALL display the operation name alongside the department name for clarity
