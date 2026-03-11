# Design Document - CRM Devolução Restore Bug Fix

## Overview

This design addresses a critical bug in the CRM devolução system where orders created automatically from opportunities are not properly restoring the original opportunity. Instead, the system creates new opportunities, leading to duplicates and incorrect pipeline management.

**Root Cause Analysis:**
The current implementation has a flow control issue where the order-to-opportunity logic falls through to the generic creation path instead of being properly contained within the restoration logic.

## Architecture

The fix involves restructuring the flow control logic in the `DevolucaoService.performDevolucao` method to ensure mutually exclusive execution paths:

### Current Problematic Flow
```
if (sourceType === 'order' && targetType === 'opportunity') {
  if (originalOpportunityId) {
    // RESTORE original opportunity
  }
  // MISSING ELSE - falls through to generic creation
}
// Generic creation logic executes regardless
```

### Fixed Flow
```
if (sourceType === 'order' && targetType === 'opportunity') {
  if (originalOpportunityId) {
    // RESTORE original opportunity
  } else {
    // CREATE new opportunity (fallback only)
  }
} else {
  // Other devolução types (always create)
}
```

## Components and Interfaces

### Enhanced Flow Control Logic

```typescript
interface DevolucaoFlowResult {
  operationType: 'restore' | 'create';
  targetId: number;
  originalOpportunityId?: number;
  statusTransition?: {
    from: string;
    to: string;
  };
}

interface OpportunityRestoration {
  originalId: number;
  currentStatus: string;
  targetStatus: string;
  devolucaoNote: string;
}
```

### Restoration Detection

```typescript
interface AutomaticOrderDetection {
  hasOpportunityId: boolean;
  opportunityId?: number;
  originalOpportunity?: {
    id: number;
    currentStatus: string;
    statusName: string;
    isFinalizerStatus: boolean;
  };
}
```

## Data Models

### Enhanced Audit Metadata

```typescript
interface DevolucaoAuditMetadata {
  operationType: 'restore_original' | 'create_new';
  originalOpportunityId?: number;
  previousStatus?: string;
  statusTransition?: {
    from: string;
    to: string;
  };
  devolucaoNote?: string;
  detectionMethod: 'opportunity_id' | 'audit_trail' | 'none';
}
```

### Status Transition Logging

```typescript
interface StatusTransitionLog {
  entityType: string;
  entityId: number;
  fromStatus: string;
  toStatus: string;
  reason: string;
  timestamp: Date;
  operationId: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Restoration Logic Properties

Property 1: Automatic order restoration
*For any* order with opportunity_id, when returned to opportunity, the system should restore the original opportunity instead of creating a new one
**Validates: Requirements 1.1**

Property 2: Status transition consistency
*For any* opportunity being restored, it should be moved to aguardando status regardless of its current status
**Validates: Requirements 1.2**

Property 3: Devolução note format
*For any* restoration operation, the opportunity should receive a detailed note with previous status and return reason
**Validates: Requirements 1.3**

Property 4: Entity status synchronization
*For any* completed devolução operation, both source and target entities should have aguardando status
**Validates: Requirements 1.4**

Property 5: Audit trail integrity
*For any* restoration operation, the audit trail should reference the original opportunity ID, not a new one
**Validates: Requirements 1.5**

### Detection Logic Properties

Property 6: Automatic creation detection
*For any* order with populated opportunity_id field, the system should identify it as automatically created
**Validates: Requirements 2.1**

Property 7: Universal opportunity restoration
*For any* opportunity in any status, when referenced by an order devolução, it should be found and restored
**Validates: Requirements 2.2**

Property 8: Finalizer status transition
*For any* opportunity in finalizer status, restoration should move it to aguardando with proper logging
**Validates: Requirements 2.3**

Property 9: Fallback creation logic
*For any* order without valid opportunity_id, the system should create a new opportunity as fallback
**Validates: Requirements 2.4**

Property 10: Operation type recording
*For any* devolução operation, the audit trail should correctly identify whether it was restoration or creation
**Validates: Requirements 2.5**

### Flow Control Properties

Property 11: Exclusive execution paths
*For any* order-to-opportunity devolução, the system should execute either restoration OR creation, never both
**Validates: Requirements 3.1**

Property 12: Restoration path isolation
*For any* restoration operation, no creation logic should be executed
**Validates: Requirements 3.2**

Property 13: Creation path conditions
*For any* creation operation, it should only execute when no original opportunity exists
**Validates: Requirements 3.3**

Property 14: Correct target ID return
*For any* devolução operation, the returned target ID should match the operation type (original for restoration, new for creation)
**Validates: Requirements 3.5**

### Note Content Properties

Property 15: Restoration note content
*For any* restored opportunity, the notes should contain previous status information and return reason
**Validates: Requirements 4.3**

### Logging Properties

Property 16: Operation detection logging
*For any* devolução operation with opportunity_id, the logs should record the detection and operation type
**Validates: Requirements 5.1**

Property 17: Restoration decision logging
*For any* found original opportunity, the logs should record current status and restoration decision
**Validates: Requirements 5.2**

Property 18: Status transition logging
*For any* status change, the logs should record previous status, new status, and timestamp
**Validates: Requirements 5.3**

Property 19: Completion result logging
*For any* completed operation, the logs should record final target ID and operation type
**Validates: Requirements 5.4**

Property 20: Error context logging
*For any* error during devolução, the logs should contain detailed context for debugging
**Validates: Requirements 5.5**

## Error Handling

### Flow Control Validation

1. **Mutual Exclusion Validation**: Ensure only one execution path is taken
2. **Target ID Validation**: Verify returned ID matches operation type
3. **Status Consistency Validation**: Ensure both entities end in correct status

### Restoration Validation

1. **Original Opportunity Existence**: Verify opportunity exists before restoration
2. **Status Transition Validation**: Ensure valid status transitions
3. **Note Content Validation**: Verify note format and content

## Testing Strategy

### Unit Testing Approach

- Test flow control logic with various order configurations
- Test restoration logic with opportunities in different statuses
- Test fallback creation when restoration is not possible
- Verify audit trail metadata for both operation types

### Property-Based Testing Requirements

The system will use **fast-check** library for property-based testing with a minimum of 100 iterations per test.

Each property-based test will be tagged with comments referencing the design document property using the format: **Feature: crm-devolucao-restore-bug, Property {number}: {property_text}**

### Integration Testing

- Test complete automatic order creation → devolução → restoration workflow
- Verify UI state consistency after operations
- Test concurrent operations to ensure data integrity
- Validate logging output for debugging scenarios

## Implementation Plan

### Phase 1: Flow Control Fix
1. Restructure conditional logic in `performDevolucao` method
2. Add explicit else clause for order-to-opportunity logic
3. Ensure mutual exclusion between restoration and creation paths

### Phase 2: Enhanced Logging
1. Add detailed logging for operation detection
2. Log restoration decisions and status transitions
3. Enhance error context capture

### Phase 3: Validation and Testing
1. Implement property-based tests for all correctness properties
2. Add integration tests for complete workflows
3. Validate UI state consistency

### Phase 4: Monitoring and Debugging
1. Add performance monitoring for restoration operations
2. Enhance error reporting with operation context
3. Implement debugging utilities for troubleshooting