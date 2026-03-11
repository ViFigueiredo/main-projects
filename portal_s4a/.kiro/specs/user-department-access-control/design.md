# Design Document

## Introduction

Este documento descreve o design técnico para implementar o controle de acesso de usuários a operações e departamentos no sistema CRM. O objetivo é garantir que usuários só possam criar e visualizar dados do pipeline CRM quando tiverem vínculo com pelo menos uma operação/departamento.

## Overview

O sistema já possui a estrutura base de operações e departamentos implementada. Esta feature adiciona:

1. **Configuração de acesso no cadastro de usuários** - Seção no formulário de usuário para vincular departamentos
2. **Validação de acesso para criação de registros** - Bloquear criação se usuário não tiver vínculo
3. **Seleção de departamento para admins** - Permitir que admins escolham departamento nos formulários
4. **Filtro de dados por perfil** - Admins veem tudo, usuários comuns veem apenas seus departamentos

## Architecture

### Componentes Existentes (Reutilizados)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Database Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  operations          │  departments        │  user_department_   │
│  - id                │  - id               │  access             │
│  - name              │  - operation_id     │  - user_id          │
│  - is_active         │  - name             │  - department_id    │
│                      │  - is_active        │  - granted_by       │
└─────────────────────────────────────────────────────────────────┘
```

### Novos Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Form Enhancement                        │
├─────────────────────────────────────────────────────────────────┤
│  UserDepartmentAccessSection                                     │
│  - Displays operations with nested departments                   │
│  - Checkbox selection for department access                      │
│  - Operation-level toggle for bulk selection                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   CRM Form Enhancement                           │
├─────────────────────────────────────────────────────────────────┤
│  AdminDepartmentSelector                                         │
│  - Operation dropdown (filters departments)                      │
│  - Department dropdown (filtered by operation)                   │
│  - Only visible for admin users                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Access Validation Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  validateUserDepartmentAccess()                                  │
│  - Checks if user has any department access                      │
│  - Returns error if no access for non-admin users                │
│  - Admins bypass validation                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. UserDepartmentAccessSection Component

```typescript
interface UserDepartmentAccessSectionProps {
  userId?: number;
  selectedDepartments: number[];
  onDepartmentsChange: (departmentIds: number[]) => void;
  disabled?: boolean;
}

// Displays operations grouped with their departments
// Allows checkbox selection for each department
// Supports operation-level toggle (select/deselect all departments in operation)
```

### 2. AdminDepartmentSelector Component

```typescript
interface AdminDepartmentSelectorProps {
  operationId?: number;
  departmentId?: number;
  onOperationChange: (operationId: number) => void;
  onDepartmentChange: (departmentId: number) => void;
  required?: boolean;
}

// Two-level dropdown: Operation -> Department
// Filters departments based on selected operation
// Only rendered for admin users
```

### 3. Enhanced User Actions

```typescript
// src/lib/actions/user.actions.ts

interface UserFormData {
  email: string;
  password?: string;
  is_admin: boolean;
  employee_id?: number;
  permissions: string[];
  department_ids: number[]; // NEW: Array of department IDs
}

async function createUser(data: UserFormData): Promise<ActionResult>;
async function updateUser(id: number, data: UserFormData): Promise<ActionResult>;
async function getUserWithDepartments(id: number): Promise<UserWithDepartments>;
```

### 4. Access Validation Functions

```typescript
// src/lib/actions/department-access.actions.ts

async function validateUserCanCreateCrmRecord(userId: number): Promise<{
  canCreate: boolean;
  error?: string;
  defaultDepartmentId?: number;
}>;

async function getUserAccessibleDepartments(userId: number): Promise<DepartmentWithOperation[]>;

async function isUserAdmin(userId: number): Promise<boolean>;
```

## Data Models

### Existing Tables (No Changes)

```sql
-- operations table
CREATE TABLE operations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- departments table
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  operation_id INTEGER REFERENCES operations(id),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_department_access table
CREATE TABLE user_department_access (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  granted_by INTEGER REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, department_id)
);
```

### Enhanced User Schema

```typescript
// src/lib/schemas/user.ts

export const userFormSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().optional(),
  is_admin: z.enum(['true', 'false']),
  employee_id: z.string().min(1, 'Funcionário é obrigatório'),
  permissions: z.array(z.string()).optional(),
  department_ids: z.array(z.number()).optional(), // NEW
});

export type UserWithDepartments = UserWithPermissions & {
  departments: DepartmentWithOperation[];
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Department Access Persistence Round-Trip

*For any* user and any set of department selections, saving the user with those departments and then loading the user should return the same set of departments.

**Validates: Requirements 1.3, 1.4**

### Property 2: Non-Admin Users Without Access Cannot Create CRM Records

*For any* non-admin user without department access, attempting to create an opportunity, order, or post-sale demand should be blocked with an error message.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Users With Access Can Create Records With Auto-Assignment

*For any* user with at least one department access, creating a CRM record should succeed and the record should be assigned to the user's current selected department.

**Validates: Requirements 2.4, 5.1, 5.2, 5.3**

### Property 4: Admin Department Selection Filters Correctly

*For any* operation selected by an admin, the department dropdown should only show departments belonging to that operation.

**Validates: Requirements 3.4**

### Property 5: Admin Users See All Data

*For any* admin user viewing the CRM pipeline, all records from all departments should be visible regardless of department assignment.

**Validates: Requirements 4.1, 4.2**

### Property 6: Non-Admin Users See Only Assigned Department Data

*For any* non-admin user viewing the CRM pipeline, only records from their assigned departments should be visible.

**Validates: Requirements 4.3, 4.4**

### Property 7: Departments Are Grouped By Operation

*For any* set of operations with departments, the UI should display departments grouped under their parent operation.

**Validates: Requirements 1.2, 6.2**

### Property 8: Operation Toggle Affects All Child Departments

*For any* operation with multiple departments, toggling the operation checkbox should select or deselect all departments within that operation.

**Validates: Requirements 6.3**

### Property 9: Inactive Items Are Hidden

*For any* inactive operation or department, it should not appear in the selection list.

**Validates: Requirements 6.5**

### Property 10: Single Department Auto-Selection

*For any* user with exactly one department assignment, that department should be automatically used without requiring selection.

**Validates: Requirements 5.4, 5.5**

## Error Handling

### User Form Errors

| Error Condition | Message | Action |
|----------------|---------|--------|
| No departments selected for non-admin | "Usuário não poderá criar registros CRM sem acesso a departamentos" | Warning (allow save) |
| Failed to save department access | "Erro ao salvar acesso aos departamentos" | Block save, show error |
| Failed to load departments | "Erro ao carregar departamentos" | Show error, retry option |

### CRM Form Errors

| Error Condition | Message | Action |
|----------------|---------|--------|
| User has no department access | "Você não tem acesso a nenhum departamento. Contate o administrador." | Block creation |
| Admin didn't select department | "Selecione uma operação e departamento" | Block save |
| Department became inactive | "O departamento selecionado não está mais ativo" | Block save |

## Testing Strategy

### Unit Tests

1. **UserDepartmentAccessSection Component**
   - Renders operations grouped with departments
   - Handles checkbox selection correctly
   - Operation toggle works as expected
   - Disabled state prevents interaction

2. **AdminDepartmentSelector Component**
   - Filters departments by operation
   - Required validation works
   - Handles empty states

3. **Access Validation Functions**
   - Returns correct result for admin users
   - Returns correct result for users with access
   - Returns error for users without access

### Property-Based Tests

Using fast-check for property-based testing:

1. **Department Access Round-Trip** (Property 1)
   - Generate random department selections
   - Save and reload user
   - Verify selections match

2. **Access Validation** (Properties 2, 3)
   - Generate random users with/without access
   - Verify creation is allowed/blocked correctly

3. **Data Visibility** (Properties 5, 6)
   - Generate random records across departments
   - Verify admin sees all, non-admin sees only assigned

4. **Department Filtering** (Property 4)
   - Generate random operations with departments
   - Verify filtering works correctly

### Integration Tests

1. **Full User Creation Flow**
   - Create user with department access
   - Verify user can create CRM records
   - Verify records are assigned to correct department

2. **Access Revocation Flow**
   - Create user with access
   - Create CRM records
   - Revoke access
   - Verify new creation blocked, existing records accessible

3. **Admin Override Flow**
   - Create admin user
   - Verify can select any department
   - Verify can see all records

## Implementation Notes

### Performance Considerations

1. **Batch Department Access Updates**
   - Use single transaction for all department access changes
   - Delete all existing access, insert new access in one operation

2. **Caching Department List**
   - Cache operations/departments list on client
   - Invalidate on department changes

3. **Lazy Loading**
   - Load department access only when editing user
   - Don't load for list view

### Security Considerations

1. **Server-Side Validation**
   - Always validate department access on server
   - Don't trust client-side department selection

2. **Admin Bypass**
   - Admin check must be server-side
   - Use `getCurrentUser()` for all validations

3. **Audit Trail**
   - Log department access changes
   - Include who granted/revoked access

### Migration Strategy

1. **Existing Users**
   - Users without department access continue to work (backward compatible)
   - Admin users are unaffected
   - Non-admin users will see warning when editing

2. **Existing Records**
   - Records without department_id remain accessible
   - New records require department assignment for non-admins
