# Portal S4A - CRM Module Architecture Analysis

> Atualizacao (Marco/2026): o fluxo com status "Aguardando" foi descontinuado no runtime. Referencias a "Aguardando" nesta serie de arquitetura indicam comportamento legado.

## Executive Summary

The CRM module in Portal S4A is built on a **three-tier pipeline system** consisting of:

1. **Opportunities (Funil)** - Sales pipeline/funnel
2. **Orders (Pedidos)** - Confirmed sales/transactions
3. **Post-Sales (Demandas)** - After-sales support and fulfillment

These three entities are interconnected through a sophisticated **bidirectional flow system** called "Devolução" (reversal/return), allowing items to move backward through the pipeline when needed.

---

## 1. DATABASE SCHEMA STRUCTURE

### 1.1 Core CRM Tables

#### `crm_opportunities` (Sales Funnel)

```sql
CREATE TABLE crm_opportunities (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  client_id INTEGER REFERENCES client_portfolio(id),
  status_id INTEGER REFERENCES crm_statuses(id),
  value DECIMAL(15, 2),                    -- Opportunity value
  expected_close_date DATE,                -- Expected closing date
  probability INTEGER (0-100),             -- Win probability
  notes TEXT,
  created_by TEXT,
  department_id INTEGER REFERENCES departments(id),
  custom_data JSONB DEFAULT '{}',          -- Custom fields storage
  source_devolucao_id INTEGER,             -- Devolução relationship
  source_devolucao_type TEXT,              -- Type of source (order/post_sales)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Purpose**: Represents potential sales opportunities in the pipeline
**Lifecycle**: Created → Progressed through statuses → Converted to Order or Finalized

#### `crm_orders` (Confirmed Sales)

```sql
CREATE TABLE crm_orders (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES client_portfolio(id),
  opportunity_id INTEGER REFERENCES crm_opportunities(id),  -- Link to source opportunity
  status_id INTEGER REFERENCES crm_statuses(id),
  total_value DECIMAL(15, 2),
  notes TEXT,
  created_by TEXT,
  department_id INTEGER REFERENCES departments(id),
  custom_data JSONB DEFAULT '{}',
  source_devolucao_id INTEGER,             -- Devolução relationship
  source_devolucao_type TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Purpose**: Represents confirmed sales/transactions
**Lifecycle**: Created from Opportunity → Progressed through statuses → Converted to Post-Sales or Finalized

#### `crm_order_items` (Order Line Items)

```sql
CREATE TABLE crm_order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES crm_orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity DECIMAL(10, 3),
  unit_price DECIMAL(15, 2),
  total_price DECIMAL(15, 2)
);
```

**Purpose**: Itemized products in each order

#### `crm_post_sales` (After-Sales/Demands)

```sql
CREATE TABLE crm_post_sales (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  client_id INTEGER REFERENCES client_portfolio(id),
  order_id INTEGER REFERENCES crm_orders(id),  -- Link to source order
  status_id INTEGER REFERENCES crm_statuses(id),
  priority TEXT ('low', 'medium', 'high', 'urgent'),
  description TEXT,
  resolution TEXT,
  created_by TEXT,
  department_id INTEGER REFERENCES departments(id),
  custom_data JSONB DEFAULT '{}',
  source_devolucao_id INTEGER,             -- Devolução relationship
  source_devolucao_type TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Purpose**: Represents post-sales activities, support tickets, fulfillment tasks
**Lifecycle**: Created from Order → Progressed through statuses → Finalized

#### `crm_statuses` (Pipeline Status Configuration)

```sql
CREATE TABLE crm_statuses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT ('opportunity', 'order', 'post_sales'),
  color TEXT,                              -- Visual indicator
  order_index INTEGER,                     -- Display order
  is_active BOOLEAN,
  is_finalizer BOOLEAN,                    -- Marks end of pipeline
  is_waiting_status BOOLEAN,               -- Marks "Aguardando" status
  create_order_on_entry BOOLEAN,           -- Auto-create order when entering
  target_order_status_id INTEGER,          -- Target status for auto-created order
  create_demand_on_entry BOOLEAN,          -- Auto-create post-sales
  target_demand_status_id INTEGER,         -- Target status for auto-created post-sales
  visible_to_users JSONB,                  -- User visibility control
  is_visible_to_all BOOLEAN,
  department_id INTEGER REFERENCES departments(id),
  created_at TIMESTAMPTZ
);
```

**Purpose**: Defines available statuses for each entity type
**Key Features**:

- Type-specific (opportunity, order, or post_sales)
- Automation triggers (auto-create order/post-sales)
- Visibility controls (per-user or all-users)
- Finalizer flag (marks end of pipeline)
- Waiting status flag (for devolução operations)

---

## 2. DATA FLOW ARCHITECTURE

### 2.1 Normal Forward Flow (Happy Path)

```
OPPORTUNITY
    ↓
    [Status: Prospecting → Qualification → Proposal → Negotiation → VENDA]
    ↓
ORDER (created when opportunity reaches "VENDA" status)
    ↓
    [Status: Pendente → Confirmado → Enviado → Entregue]
    ↓
POST-SALES (created when order reaches "Entregue" status)
    ↓
    [Status: Aberto → Em Andamento → Resolvido → Fechado]
    ↓
FINALIZED (marked with is_finalizer = true)
```

### 2.2 Bidirectional Flow (Devolução System)

The **Devolução** system allows items to move backward through the pipeline:

```
POST-SALES (Resolvido)
    ↓ [Devolução triggered]
    ↓
ORDER (restored to "Aguardando" status)
    ↓ [Devolução triggered]
    ↓
OPPORTUNITY (restored to "Aguardando" status)
```

**Use Cases**:

- Customer returns product → Post-Sales reverted to Order
- Order needs rework → Order reverted to Opportunity
- Opportunity needs re-negotiation → Opportunity stays in pipeline

---

## 3. VALIDATION & SCHEMAS

### 3.1 Zod Schemas (Type Safety)

Located in: `src/lib/schemas/crm.ts`

#### CrmOpportunitySchema

```typescript
export const CrmOpportunitySchema = z.object({
  id: z.number().optional(),
  title: z.string().optional(), // Optional - auto-generated if empty
  client_id: z.number({ required_error: 'Cliente é obrigatório' }),
  status_id: z.number({ required_error: 'Status é obrigatório' }),
  value: z.coerce.number().min(0).optional(),
  expected_close_date: z.date().optional(),
  probability: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  created_by: z.string().optional(),
  department_id: z.number().optional(),
  source_devolucao_id: z.number().optional(),
  source_devolucao_type: z
    .enum(['opportunity', 'order', 'post_sales'])
    .optional(),
  items: z.array(CrmOpportunityItemSchema).optional(),
  custom_data: z.record(z.any()).optional(),
});
```

#### CrmOrderSchema

```typescript
export const CrmOrderSchema = z.object({
  id: z.number().optional(),
  client_id: z.number({ required_error: 'Cliente é obrigatório' }),
  opportunity_id: z.number().optional().nullable(), // Link to source opportunity
  status_id: z.number({ required_error: 'Status é obrigatório' }),
  total_value: z.coerce.number().min(0),
  order_date: z.date(),
  notes: z.string().optional(),
  created_by: z.string().optional(),
  department_id: z.number().optional(),
  source_devolucao_id: z.number().optional(),
  source_devolucao_type: z
    .enum(['opportunity', 'order', 'post_sales'])
    .optional(),
  items: z.array(CrmOrderItemSchema).optional(),
  custom_data: z.record(z.any()).optional(),
});
```

#### CrmPostSalesSchema

```typescript
export const CrmPostSalesSchema = z.object({
  id: z.number().optional(),
  order_id: z.number().optional(), // Link to source order
  client_id: z.number({ required_error: 'Cliente é obrigatório' }),
  status_id: z.number({ required_error: 'Status é obrigatório' }),
  description: z.string().optional(),
  notes: z.string().optional(),
  due_date: z.date().optional(),
  created_by: z.string().optional(),
  department_id: z.number().optional(),
  source_devolucao_id: z.number().optional(),
  source_devolucao_type: z
    .enum(['opportunity', 'order', 'post_sales'])
    .optional(),
  custom_data: z.record(z.any()).optional(),
});
```

### 3.2 Devolução Request Schema

```typescript
export const DevolucaoRequestSchema = z.object({
  sourceType: z.enum(['order', 'post_sales']),
  sourceId: z.number({ required_error: 'ID de origem é obrigatório' }),
  targetType: z.enum(['opportunity', 'order']),
  reason: z.string().min(1, 'Motivo é obrigatório'),
});
```

---

## 4. SERVER ACTIONS (Business Logic)

Located in: `src/lib/actions/crm.actions.ts`

### 4.1 Opportunity Actions

```typescript
// Fetch opportunities with visibility filtering
export async function getOpportunitiesWithVisibility(options?: {
  departmentId?: number;
  customFilters?: { conditions: string[]; params: any[] };
  showFinalized?: boolean;
  showWaiting?: boolean;
});

// Create new opportunity
export async function createOpportunity(
  data: CrmOpportunity & { department_id?: number },
);

// Update opportunity (partial)
export async function updateOpportunity(
  id: number,
  data: Partial<CrmOpportunity>,
);

// Update only status (triggers automation)
export async function updateOpportunityStatus(id: number, statusId: number);

// Delete opportunity
export async function deleteOpportunity(id: number);
```

### 4.2 Order Actions

```typescript
// Fetch orders with visibility filtering
export async function getOrdersWithVisibility(options?: {
  departmentId?: number;
  customFilters?: { conditions: string[]; params: any[] };
  showFinalized?: boolean;
  showWaiting?: boolean;
});

// Create new order
export async function createOrder(data: CrmOrder & { department_id?: number });

// Update order
export async function updateOrder(id: number, data: Partial<CrmOrder>);

// Update only status
export async function updateOrderStatus(id: number, statusId: number);

// Delete order
export async function deleteOrder(id: number);

// Get single order with relationships
export async function getOrder(id: number);
```

### 4.3 Post-Sales Actions

```typescript
// Fetch post-sales with visibility filtering
export async function getPostSalesWithVisibility(options?: {
  departmentId?: number;
  customFilters?: { conditions: string[]; params: any[] };
  showFinalized?: boolean;
  showWaiting?: boolean;
});

// Create new post-sales
export async function createPostSale(
  data: CrmPostSales & { department_id?: number },
);

// Update post-sales
export async function updatePostSale(id: number, data: Partial<CrmPostSales>);

// Update only status
export async function updatePostSaleStatus(id: number, statusId: number);

// Delete post-sales
export async function deletePostSale(id: number);
```

### 4.4 Status Management Actions

```typescript
// Get statuses for specific type and department
export async function getCrmStatuses(
  type?: CrmStatusType,
  departmentId?: number,
);

// Create new status
export async function createCrmStatus(
  data: CrmStatus & { department_id?: number },
);

// Update status
export async function updateCrmStatus(
  id: number,
  data: CrmStatus & { department_id?: number },
);

// Delete status
export async function deleteCrmStatus(id: number);

// Reorder statuses
export async function updateCrmStatusOrder(
  items: { id: number; order_index: number }[],
);

// Ensure default "Aguardando" status exists
export async function ensureDefaultWaitingStatuses(departmentId: number);

// Validate status configuration
export async function validateStatusConfiguration(
  type: CrmStatusType,
  departmentId: number,
);
```

### 4.5 Automation Triggers

When a status is updated, the system checks for automation rules:

```typescript
async function checkAndTriggerAutomation(
  entityId: number,
  statusId: number,
  createdBy: string,
);
```

**Automation Rules**:

1. If status has `create_order_on_entry = true`:
   - Automatically create an Order
   - Set order status to `target_order_status_id`

2. If status has `create_demand_on_entry = true`:
   - Automatically create a Post-Sales
   - Set post-sales status to `target_demand_status_id`
