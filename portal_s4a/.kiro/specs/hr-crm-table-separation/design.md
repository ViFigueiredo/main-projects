# Design Document: Separação de Tabelas HR e CRM

## Overview

Este documento detalha a arquitetura para separar completamente as responsabilidades entre os módulos de Recursos Humanos (HR) e Customer Relationship Management (CRM), criando estruturas de dados independentes e eliminando o conflito atual onde a tabela `departments` é utilizada por ambos os módulos.

## Architecture

### Current State Problems

1. **Conflito Conceitual**: `departments` serve tanto para equipes de RH quanto operações comerciais
2. **Acoplamento Indevido**: Módulos HR e CRM compartilham a mesma estrutura de dados
3. **Confusão de Domínios**: Equipes organizacionais misturadas com operações de vendas
4. **Dificuldade de Manutenção**: Mudanças em um módulo afetam o outro

### Target Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   HR MODULE     │    │   CRM MODULE    │
├─────────────────┤    ├─────────────────┤
│ hr_teams        │    │ operations      │
│ hr_departments  │    │ suboperations   │
│ employee_teams  │    │ crm_*           │
└─────────────────┘    └─────────────────┘
        │                       │
        └───────┬───────────────┘
                │
        ┌───────▼───────┐
        │   EMPLOYEES   │
        │   (shared)    │
        └───────────────┘
```

## Components and Interfaces

### HR Module Tables

#### hr_teams
```sql
CREATE TABLE hr_teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3b82f6',
  order_index INTEGER DEFAULT 0,
  leader_id INTEGER REFERENCES employees(id),
  manager_id INTEGER REFERENCES employees(id),
  hr_department_id INTEGER REFERENCES hr_departments(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### hr_departments
```sql
CREATE TABLE hr_departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES hr_departments(id),
  head_id INTEGER REFERENCES employees(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### employee_team_assignments
```sql
CREATE TABLE employee_team_assignments (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  hr_team_id INTEGER NOT NULL REFERENCES hr_teams(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by INTEGER REFERENCES employees(id),
  is_primary BOOLEAN DEFAULT TRUE,
  UNIQUE(employee_id, hr_team_id)
);
```

### CRM Module Tables (Already Implemented)

- `operations` - Operações comerciais (VIVO, Claro, TIM)
- `suboperations` - Suboperações (B2B, B2C, Corporate)
- `user_suboperation_access` - Controle de acesso por suboperação

### Migration Strategy

#### Phase 1: Create HR Tables
1. Create new HR-specific tables
2. Add proper indexes and constraints
3. Validate table structure

#### Phase 2: Data Migration
1. **Backup Current State**
   ```sql
   CREATE TABLE departments_backup AS SELECT * FROM departments;
   CREATE TABLE employees_backup AS SELECT * FROM employees;
   ```

2. **Migrate Teams Data**
   ```sql
   INSERT INTO hr_teams (id, name, description, color, order_index, leader_id, manager_id, is_active, created_at, updated_at)
   SELECT id, name, description, color, order_index, leader_id, manager_id, is_active, created_at, updated_at
   FROM departments;
   ```

3. **Migrate Employee Assignments**
   ```sql
   INSERT INTO employee_team_assignments (employee_id, hr_team_id, assigned_at, is_primary)
   SELECT id, department_id, created_at, TRUE
   FROM employees 
   WHERE department_id IS NOT NULL;
   ```

#### Phase 3: Update Application Code
1. Update HR actions to use new tables
2. Update HR components to use new data structure
3. Maintain CRM functionality unchanged

#### Phase 4: Cleanup
1. Remove `department_id` from employees table
2. Update foreign key references
3. Drop old department-related columns

## Data Models

### HR Team Model
```typescript
export interface HRTeam {
  id: number;
  name: string;
  description?: string;
  color: string;
  order_index: number;
  leader_id?: number;
  manager_id?: number;
  hr_department_id?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  
  // Computed fields
  leader?: Employee;
  manager?: Employee;
  employees?: Employee[];
  employee_count?: number;
}
```

### HR Department Model
```typescript
export interface HRDepartment {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  head_id?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  
  // Computed fields
  head?: Employee;
  teams?: HRTeam[];
  children?: HRDepartment[];
  parent?: HRDepartment;
}
```

### Employee Team Assignment Model
```typescript
export interface EmployeeTeamAssignment {
  id: number;
  employee_id: number;
  hr_team_id: number;
  assigned_at: Date;
  assigned_by?: number;
  is_primary: boolean;
  
  // Computed fields
  employee?: Employee;
  team?: HRTeam;
  assigned_by_employee?: Employee;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Data Migration Completeness
*For any* team in the original departments table, after migration there should exist a corresponding hr_team with identical data
**Validates: Requirements 2.1, 2.2**

### Property 2: Employee Assignment Preservation  
*For any* employee with a department_id before migration, after migration there should exist an employee_team_assignment linking them to the corresponding hr_team
**Validates: Requirements 2.2, 2.3**

### Property 3: HR-CRM Independence
*For any* HR operation (teams, hierarchies), the system should only query hr_* tables and never operations/suboperations tables
**Validates: Requirements 1.1, 1.2**

### Property 4: CRM Operation Isolation
*For any* CRM operation (opportunities, orders), the system should only query operations/suboperations tables and never hr_* tables  
**Validates: Requirements 1.2, 5.1**

### Property 5: Referential Integrity Maintenance
*For any* foreign key relationship in the new HR tables, the referenced record should exist and be valid
**Validates: Requirements 3.4, 6.2**

### Property 6: Functional Equivalence
*For any* HR functionality (drag-drop teams, set leaders), the behavior after migration should be identical to before migration
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

## Error Handling

### Migration Errors
- **Constraint Violations**: Rollback and report specific constraint failures
- **Data Inconsistencies**: Validate data before migration and report issues
- **Foreign Key Errors**: Ensure all referenced employees exist before creating assignments

### Runtime Errors
- **Missing Teams**: Graceful handling when employee has no team assignment
- **Invalid References**: Null checks for leader/manager references
- **Permission Errors**: Proper error messages for unauthorized operations

### Rollback Scenarios
- **Partial Migration Failure**: Restore from backup tables
- **Application Errors**: Revert code changes and restore original table structure
- **Data Corruption**: Use backup validation to ensure clean rollback

## Testing Strategy

### Unit Tests
- Test individual HR actions with new table structure
- Test CRM actions remain unchanged
- Test migration functions with sample data
- Test rollback functionality

### Property-Based Tests
- Generate random team configurations and verify migration preserves all data
- Generate random employee assignments and verify relationships are maintained
- Test HR operations never access CRM tables and vice versa

### Integration Tests
- Test complete HR workflows (create team, assign employees, set leaders)
- Test complete CRM workflows remain functional
- Test migration end-to-end with realistic data volumes

### Performance Tests
- Verify query performance with new table structure
- Test migration performance with large datasets
- Validate index effectiveness for common operations

## Migration Checklist

### Pre-Migration
- [ ] Create complete database backup
- [ ] Validate current data integrity
- [ ] Test migration on copy of production data
- [ ] Prepare rollback procedures

### Migration Execution
- [ ] Create new HR tables
- [ ] Migrate team data
- [ ] Migrate employee assignments  
- [ ] Update application code
- [ ] Validate data integrity
- [ ] Test all HR functionality
- [ ] Test all CRM functionality

### Post-Migration
- [ ] Monitor system performance
- [ ] Validate user workflows
- [ ] Clean up old table references
- [ ] Update documentation
- [ ] Archive backup data