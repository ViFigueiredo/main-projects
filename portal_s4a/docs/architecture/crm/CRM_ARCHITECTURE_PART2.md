# Portal S4A - CRM Module Architecture Analysis (Part 2)

> Atualizacao (Marco/2026): o fluxo com status "Aguardando" foi descontinuado no runtime. Referencias a "Aguardando" nesta serie de arquitetura indicam comportamento legado.

## 5. DEVOLUÇÃO SYSTEM (Bidirectional Flow)

### 5.1 Overview

The **Devolução** system enables items to move backward through the pipeline when needed. This is critical for handling:

- Product returns
- Order cancellations/rework
- Opportunity re-negotiation
- Post-sales escalations

### 5.2 Devolução Service Architecture

Located in: `src/lib/services/devolucao.service.ts`

#### Core Components

```typescript
// Error types
export enum DevolucaoErrorType {
  PERMISSION_DENIED,
  INVALID_SOURCE,
  INVALID_TARGET_TYPE,
  DATA_VALIDATION_FAILED,
  TRANSACTION_FAILED,
  MISSING_REQUIRED_FIELDS,
  WAITING_STATUS_NOT_FOUND,
}

// Main service class
export class DevolucaoService {
  static async performDevolucao(
    request: DevolucaoRequest,
    user: any,
  ): Promise<DevolucaoResult>;
}

// Result interface
export interface DevolucaoResult {
  success: boolean;
  error?: string;
  targetId?: number; // ID of created/restored entity
  auditId?: number; // ID of audit record
}
```

### 5.3 Devolução Flow Logic

#### Step 1: Validation

```
Input: sourceType, sourceId, targetType, reason
  ↓
Check: User permissions (crm:devolucao:manage_all or specific permission)
  ↓
Check: Source entity exists and is valid
  ↓
Check: Target type is valid (order → opportunity, post_sales → order/opportunity)
  ↓
Check: No circular devolução (prevent infinite loops)
  ↓
Check: Waiting status exists for target type
```

#### Step 2: Restoration Case Detection

```
Special handling for order → opportunity devolução:
  ↓
If order.opportunity_id exists:
  → This is a RESTORATION case
  → Restore original opportunity to "Aguardando" status
  → Update order to "Aguardando" status
  ↓
Else:
  → Create NEW opportunity
  → Link to order via source_devolucao_id
```

#### Step 3: Transaction Execution

```
BEGIN TRANSACTION
  ↓
1. Fetch source entity data
  ↓
2. Determine target entity (restore or create)
  ↓
3. Update target entity status to "Aguardando"
  ↓
4. Update source entity status to "Aguardando"
  ↓
5. Create audit record in crm_devolucao_audit
  ↓
6. Log operation
  ↓
COMMIT TRANSACTION
```

### 5.4 Validation Checkpoints

Located in: `src/lib/utils/devolucao-validation.ts`

```typescript
export class DevolucaoValidator {
  static async validateDevolucaoOperation(
    sourceType: string,
    sourceId: number,
    targetType: string,
    reason: string,
    user: any,
    context?: { skipStrictValidation?: boolean; isRestorationCase?: boolean },
  ): Promise<ValidationResult[]>;
}
```

**Validation Checkpoints**:

1. **PERMISSION_CHECK**
   - User has `crm:devolucao:manage_all` OR
   - User has `crm:devolucao:{sourceType}_to_{targetType}` OR
   - User is admin

2. **SOURCE_ENTITY_CHECK**
   - Source entity exists
   - Source entity is not already finalized
   - Source entity belongs to user's department

3. **TARGET_TYPE_CHECK**
   - Valid target type for source type
   - Allowed transitions:
     - order → opportunity
     - post_sales → order
     - post_sales → opportunity

4. **CIRCULAR_DEVOLUCAO_CHECK**
   - Prevent: A → B → A (circular reference)
   - Check audit trail for existing relationships

5. **WAITING_STATUS_CHECK**
   - "Aguardando" status exists for target type
   - Status is active and not finalized

6. **BUSINESS_RULES_CHECK**
   - Order has opportunity_id (for restoration case)
   - Post-sales has order_id (for restoration case)
   - No conflicting devolução operations in progress

### 5.5 Audit Trail

Located in: `crm_devolucao_audit` table

```sql
CREATE TABLE crm_devolucao_audit (
  id SERIAL PRIMARY KEY,
  source_type TEXT ('opportunity', 'order', 'post_sales'),
  source_id INTEGER,
  target_type TEXT ('opportunity', 'order', 'post_sales'),
  target_id INTEGER,
  user_id INTEGER REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMPTZ,
  metadata JSONB
);
```

**Audit Information Stored**:

- Source and target entities
- User who performed devolução
- Reason for devolução
- Timestamp
- Metadata (validation results, error details)

### 5.6 Devolução Permissions

```typescript
// Permission keys
'crm:devolucao:manage_all'; // Full access
'crm:devolucao:order_to_opportunity'; // Specific transition
'crm:devolucao:post_sales_to_order'; // Specific transition
'crm:devolucao:post_sales_to_opportunity';
'crm:devolucao:view_history'; // View audit trail
```

---

## 6. FRONTEND COMPONENTS

### 6.1 Opportunities - Kanban Board

Located in: `src/components/crm/opportunities/kanban-board.tsx`

**Features**:

- Drag-and-drop status management
- Kanban view (default) and Table view
- Custom field display
- Visibility toggles (show/hide finalized, waiting statuses)
- Devolução button integration
- Relationship indicators

**Key Functions**:

```typescript
function KanbanBoard() {
  // Load opportunities with visibility options
  const visibilityOptions = {
    showFinalized,
    showWaiting,
    departmentId,
    customFilters,
  };

  const oppsData = await getOpportunitiesWithVisibility(visibilityOptions);

  // Handle drag-and-drop
  const onDragEnd = async (result: DropResult) => {
    // Update opportunity status
    await updateOpportunityStatus(opportunityId, newStatusId);
  };
}
```

**UI Elements**:

- Status columns (Kanban)
- Opportunity cards with:
  - ID and title
  - Client name
  - Value and expected close date
  - Custom fields
  - Devolução button
  - Relationship indicator
- Table view with sortable columns

### 6.2 Orders - Form Component

Located in: `src/components/crm/orders/order-form.tsx`

**Features**:

- Create/edit orders
- Link to source opportunity
- Line items management (products, quantities, prices)
- Automatic total calculation
- Custom fields
- Devolução button (for existing orders)
- Relationship navigation

**Key Sections**:

```typescript
function OrderForm({ orderId, statuses, onSuccess, onCancel }) {
  // 1. Order header (ID, linked opportunity)
  // 2. Client selector
  // 3. Status selector
  // 4. Opportunity selector (for new orders)
  // 5. Order date
  // 6. Line items table
  //    - Product selector
  //    - Quantity
  //    - Unit price
  //    - Total price (auto-calculated)
  // 7. Custom fields
  // 8. Devolução button (if editing)
  // 9. Relationship navigation (if editing)
}
```

**Calculations**:

```typescript
// Auto-calculate totals when items change
useEffect(() => {
  const total = items.reduce((acc, item) => {
    return acc + (Number(item.total_price) || 0);
  }, 0);
  form.setValue('total_value', total);
}, [items]);
```

### 6.3 Post-Sales - Form Component

Located in: `src/components/crm/post-sales/post-sales-form.tsx`

**Features**:

- Create/edit post-sales (demands)
- Link to source order
- Priority selection
- Description and resolution fields
- Due date
- Custom fields
- Devolução buttons (for existing post-sales)
- Relationship navigation

**Key Sections**:

```typescript
function PostSalesForm({ postSale, statuses, onSuccess, onCancel }) {
  // 1. Post-sales header (ID, linked order)
  // 2. Client selector
  // 3. Status selector
  // 4. Order selector (for new post-sales)
  // 5. Due date
  // 6. Description
  // 7. Notes
  // 8. Custom fields
  // 9. Devolução buttons (if editing)
  //    - Devolução to order
  //    - Devolução to opportunity
  // 10. Relationship navigation (if editing)
}
```

### 6.4 Devolução Button Component

Located in: `src/components/crm/devolucao-button.tsx`

**Features**:

- Conditional rendering based on permissions
- Devolução reason input
- Error handling and validation
- Success/error notifications
- Loading states

**Usage**:

```typescript
<DevolucaoButton
  sourceId={orderId}
  targetType="opportunity"
  onSuccess={handleSuccess}
  permissions={userPermissions}
  isFromDevolucao={orderData?.source_devolucao_id ? true : false}
  {...getDevolucaoButtonProps('order', 'form')}
/>
```

### 6.5 Relationship Navigation Component

Located in: `src/components/crm/relationship-navigation.tsx`

**Features**:

- Display related entities (opportunities, orders, post-sales)
- Show devolução history
- Navigate between related items
- Visual indicators for relationships

**Usage**:

```typescript
<RelationshipNavigation
  entityType="order"
  entityId={orderId}
  showHistory={true}
  compact={false}
/>
```

---

## 7. VISIBILITY & FILTERING SYSTEM

### 7.1 Visibility Toggles

Located in: `src/components/crm/visibility-toggles.tsx`

**Features**:

- Toggle finalized items visibility
- Toggle waiting status items visibility
- Persistent storage (localStorage)
- Visual styling based on status type

**Implementation**:

```typescript
export function useVisibilityToggles() {
  const [showFinalized, setShowFinalized] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);

  // Load from localStorage on mount
  // Save to localStorage on change

  return {
    showFinalized,
    showWaiting,
    toggleFinalized,
    toggleWaiting,
    isInitialized,
  };
}
```

### 7.2 Custom Filters

Located in: `src/components/crm/custom-filters-bar.tsx`

**Features**:

- Filter by custom fields
- Multiple filter conditions
- Filter persistence
- Dynamic filter UI based on field types

**Filter Types**:

- Text (contains, equals)
- Number (equals, greater than, less than)
- Date (equals, before, after)
- Select (equals)
- Boolean (true/false)

### 7.3 Status Visibility Control

**Per-Status Configuration**:

```typescript
// In crm_statuses table
is_visible_to_all: boolean,      // If true, visible to all users
visible_to_users: JSONB,         // Array of user emails if not visible to all
```

**Query Filtering**:

```typescript
// For non-admin users
WHERE (is_visible_to_all = TRUE OR visible_to_users @> '["user@email.com"]')
```

---

## 8. CUSTOM FIELDS SYSTEM

### 8.1 Custom Field Definition

Located in: `src/lib/schemas/crm.ts`

```typescript
export const CrmCustomFieldSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1), // Internal name
  label: z.string().min(1), // Display label
  type: z.enum(['text', 'number', 'date', 'select', 'boolean']),
  entity_types: z.array(
    z.enum(['opportunity', 'order', 'client', 'post_sales']),
  ),
  options: z.any().optional(), // For select type
  is_required: z.boolean(),
  is_active: z.boolean(),
  show_in_lists: z.object({
    // Visibility in list views
    opportunity: z.boolean().optional(),
    order: z.boolean().optional(),
    post_sales: z.boolean().optional(),
    client: z.boolean().optional(),
  }),
  operation_id: z.number(),
  department_ids: z.array(z.number()),
});
```

### 8.2 Custom Field Storage

**Storage Location**: `custom_data` JSONB field in each entity

```typescript
// Example: Opportunity with custom fields
{
  id: 1,
  title: "Opportunity 1",
  custom_data: {
    "internal_code": "OP-2025-001",
    "priority": "high",
    "estimated_budget": 50000,
    "decision_date": "2025-12-31"
  }
}
```

### 8.3 Custom Fields Component

Located in: `src/components/crm/custom-fields-section.tsx`

**Features**:

- Dynamic form fields based on custom field definitions
- Type-specific input components
- Validation based on field configuration
- Integration with React Hook Form

---

## 9. DEPARTMENT & OPERATION ISOLATION

### 9.1 Multi-Department Architecture

**Hierarchy**:

```
Operation (VIVO, Claro, TIM, etc.)
  ↓
Department (B2B, B2C, Corporate, etc.)
  ↓
CRM Entities (Opportunities, Orders, Post-Sales)
```

### 9.2 Data Isolation

**Query Filtering**:

```typescript
// All CRM queries include department filter
WHERE department_id = ${currentDepartment.id}
```

**User Access Control**:

```sql
-- user_department_access table
CREATE TABLE user_department_access (
  user_id INTEGER REFERENCES users(id),
  department_id INTEGER REFERENCES departments(id),
  UNIQUE(user_id, department_id)
);
```

### 9.3 Department Context Hook

Located in: `src/hooks/use-department.tsx`

```typescript
export function useDepartment() {
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user's accessible departments
  // Set current department from localStorage or first available

  return {
    currentDepartment,
    setCurrentDepartment,
    loading,
  };
}
```

---

## 10. ERROR HANDLING & LOGGING

### 10.1 Error Handler

Located in: `src/lib/utils/error-handling.ts`

```typescript
export class DevolucaoErrorHandler {
  static handle(error: any, context?: string): StructuredError;
}

export interface StructuredError {
  id: string;
  type: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  timestamp: Date;
  context?: string;
  recoveryActions: string[];
}
```

### 10.2 Logger

Located in: `src/lib/utils/devolucao-logger.ts`

```typescript
export class DevolucaoLogger {
  static logOperationStart(
    sourceType: string,
    sourceId: number,
    targetType: string,
    user: any,
  ): string; // Returns operationId

  static logValidationCheckpoint(
    operationId: string,
    checkpoint: ValidationCheckpoint,
    result: ValidationResult,
    context?: any,
  ): void;

  static logOperationSuccess(
    operationId: string,
    sourceType: string,
    sourceId: number,
    targetType: string,
    targetId: number,
    user: any,
  ): void;
}
```

### 10.3 Performance Monitoring

```typescript
export class PerformanceMonitor {
  static startTimer(label: string): void;

  static async measureAsync<T>(
    label: string,
    fn: () => Promise<T>,
    context?: any,
  ): Promise<T>;
}
```
