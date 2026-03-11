# Design Document - CRM Devolução Bug Fix

## Overview

This design addresses critical bugs in the CRM devolução system that prevent successful order-to-opportunity returns. The main issues identified are:

1. **Data Validation Failure**: "Dados da entidade de destino inválidos para opportunity" - Schema validation failing during target entity creation
2. **Database Query Error**: "column u.name does not exist" - Audit trail queries referencing non-existent user name field
3. **Incomplete Error Handling**: Insufficient error context for debugging validation failures

## Architecture

The fix involves three main components:

### 1. Enhanced Data Validation Layer
- Improved schema validation with detailed error reporting
- Field mapping validation between source and target entities
- Graceful handling of missing optional fields

### 2. Database Query Adaptation
- Dynamic user field detection for audit queries
- Fallback mechanisms for missing user information
- Robust error handling for schema inconsistencies

### 3. Comprehensive Error Reporting
- Detailed validation error messages
- Enhanced logging with field-level diagnostics
- Improved debugging information for developers

## Components and Interfaces

### DevolucaoService Enhancements

```typescript
interface EnhancedValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  fieldMappings: FieldMapping[];
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  value: any;
  transformed: boolean;
  validationStatus: 'valid' | 'invalid' | 'warning';
}
```

### Database Query Adapter

```typescript
interface UserFieldAdapter {
  detectAvailableFields(): Promise<string[]>;
  buildUserQuery(availableFields: string[]): string;
  formatUserInfo(userData: any): UserInfo;
}
```

### Error Context Enhancement

```typescript
interface ValidationErrorContext {
  entityType: string;
  fieldName: string;
  expectedType: string;
  actualValue: any;
  validationRule: string;
  suggestion?: string;
}
```

## Data Models

### Enhanced Opportunity Schema Validation

```typescript
const EnhancedOpportunitySchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  client_id: z.number().positive("ID do cliente deve ser positivo"),
  status_id: z.number().positive("ID do status deve ser positivo"),
  value: z.number().optional().nullable(),
  expected_close_date: z.date().optional().nullable(),
  probability: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
  created_by: z.string().optional().nullable(),
  department_id: z.number().positive().optional().nullable(),
  source_devolucao_id: z.number().positive(),
  source_devolucao_type: z.enum(['order', 'post_sales']),
  custom_data: z.record(z.any()).optional().default({})
});
```

### User Information Fallback Model

```typescript
interface UserInfo {
  id: number;
  email: string;
  displayName: string; // Falls back to email if name not available
  hasNameField: boolean;
}
```

## Error Handling

### Validation Error Categories

1. **Schema Validation Errors**
   - Missing required fields
   - Invalid data types
   - Constraint violations

2. **Business Logic Errors**
   - Invalid entity relationships
   - Status transition violations
   - Permission failures

3. **Database Errors**
   - Connection failures
   - Query execution errors
   - Constraint violations

### Error Recovery Strategies

1. **Graceful Degradation**: Continue operation with available data when non-critical fields are missing
2. **Automatic Retry**: Retry failed operations with corrected data
3. **Fallback Mechanisms**: Use alternative data sources when primary sources fail

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Data Validation Properties

Property 1: Source entity validation completeness
*For any* order entity used as devolução source, validation should identify all missing required fields and invalid data before proceeding with the operation
**Validates: Requirements 1.1**

Property 2: Target entity field mapping correctness
*For any* valid order entity, the mapped opportunity entity should contain all required fields with valid values according to the opportunity schema
**Validates: Requirements 1.2**

Property 3: Validation error message specificity
*For any* validation failure, the error message should contain specific field names, expected values, and actionable guidance for resolution
**Validates: Requirements 1.3**

Property 4: Entity insertion verification
*For any* successfully created opportunity, the database should contain the entity with correct foreign key relationships and all mapped data
**Validates: Requirements 1.4**

Property 5: Cross-table data integrity
*For any* completed devolução operation, all related tables (audit, status updates, relationships) should maintain consistent state
**Validates: Requirements 1.5**

### Audit Trail Properties

Property 6: Audit record completeness
*For any* devolução operation, the audit trail should contain complete operation metadata including user information using available fields
**Validates: Requirements 2.1**

Property 7: User field adaptation
*For any* database schema configuration, audit queries should execute successfully by adapting to available user table fields
**Validates: Requirements 2.2**

Property 8: User identification fallback
*For any* user record with missing name field, the system should display user identification using email or other available fields
**Validates: Requirements 2.3**

Property 9: Schema inconsistency handling
*For any* user table schema variation, the system should detect available fields and construct appropriate queries
**Validates: Requirements 2.4**

Property 10: Audit metadata completeness
*For any* audit record creation, the stored metadata should include all necessary information for operation troubleshooting
**Validates: Requirements 2.5**

### Error Handling Properties

Property 11: Validation error logging detail
*For any* entity validation failure, the logs should contain field-level details including field names, values, and validation rules
**Validates: Requirements 3.1**

Property 12: Schema validation completeness
*For any* entity with schema violations, the validation should identify all missing required fields and invalid data types
**Validates: Requirements 3.2**

Property 13: Database error context capture
*For any* database operation failure, the error context should include complete information about the failed operation and its parameters
**Validates: Requirements 3.3**

Property 14: Error message actionability
*For any* validation error, the error message should provide sufficient information for developers to identify and fix the issue
**Validates: Requirements 3.4**

Property 15: Field mapping error identification
*For any* data mapping failure, the system should identify specific fields that could not be converted and the reason for failure
**Validates: Requirements 3.5**

### Edge Case Handling Properties

Property 16: Optional field default handling
*For any* source entity with missing optional fields, the target entity should be created with appropriate default values
**Validates: Requirements 4.1**

Property 17: Incomplete user data graceful handling
*For any* user with missing information fields, devolução operations should continue successfully using available user data
**Validates: Requirements 4.2**

Property 18: Constraint violation transaction rollback
*For any* database constraint violation, the transaction should be completely rolled back and the specific constraint violation should be reported
**Validates: Requirements 4.3**

Property 19: Concurrent operation data integrity
*For any* set of concurrent devolução operations on different entities, data integrity should be maintained without corruption
**Validates: Requirements 4.4**

Property 20: Resource limitation graceful failure
*For any* system resource constraint scenario, the system should fail gracefully with appropriate error messages and no data corruption
**Validates: Requirements 4.5**

## Testing Strategy

### Unit Testing Approach

- Test each validation rule individually
- Mock database responses for error scenarios
- Verify error message accuracy and completeness

### Property-Based Testing Requirements

The system will use **fast-check** library for property-based testing with a minimum of 100 iterations per test.

Each property-based test will be tagged with comments referencing the design document property using the format: **Feature: crm-devolucao-bug-fix, Property {number}: {property_text}**

### Integration Testing

- Test complete devolução workflows
- Verify database transaction integrity
- Test concurrent operation handling