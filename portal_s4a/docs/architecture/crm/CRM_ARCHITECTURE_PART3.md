# Portal S4A - CRM Module Architecture Analysis (Part 3)

> Atualizacao (Marco/2026): o fluxo com status "Aguardando" foi descontinuado no runtime. Referencias a "Aguardando" nesta serie de arquitetura indicam comportamento legado.

## 11. DATA FLOW EXAMPLES

### 11.1 Example 1: Normal Opportunity → Order → Post-Sales Flow

```
STEP 1: Create Opportunity
┌─────────────────────────────────────┐
│ Opportunity Created                 │
│ - Client: Acme Corp                 │
│ - Status: Prospecting               │
│ - Value: $50,000                    │
│ - Expected Close: 2025-12-31        │
└─────────────────────────────────────┘
         ↓ (User drags to "VENDA" status)

STEP 2: Status Update Triggers Automation
┌─────────────────────────────────────┐
│ Opportunity Status: Prospecting      │
│ → VENDA (has create_order_on_entry)  │
│                                      │
│ Automation Triggered:                │
│ - Create Order automatically         │
│ - Set Order status to "Pendente"     │
│ - Link Order.opportunity_id = Opp.id │
└─────────────────────────────────────┘
         ↓

STEP 3: Order Created
┌─────────────────────────────────────┐
│ Order Created                        │
│ - Client: Acme Corp                 │
│ - Opportunity: #1                   │
│ - Status: Pendente                  │
│ - Items: [Product A x 2, Product B] │
│ - Total: $50,000                    │
└─────────────────────────────────────┘
         ↓ (User updates status to "Entregue")

STEP 4: Order Status Update
┌─────────────────────────────────────┐
│ Order Status: Pendente               │
│ → Entregue (has create_demand...)    │
│                                      │
│ Automation Triggered:                │
│ - Create Post-Sales automatically    │
│ - Set Post-Sales status to "Aberto"  │
│ - Link PostSales.order_id = Order.id │
└─────────────────────────────────────┘
         ↓

STEP 5: Post-Sales Created
┌─────────────────────────────────────┐
│ Post-Sales Created                  │
│ - Client: Acme Corp                 │
│ - Order: #1                         │
│ - Status: Aberto                    │
│ - Description: Support & Fulfillment │
└─────────────────────────────────────┘
         ↓ (User updates status to "Fechado")

STEP 6: Post-Sales Finalized
┌─────────────────────────────────────┐
│ Post-Sales Status: Aberto            │
│ → Fechado (is_finalizer = true)      │
│                                      │
│ Result: Pipeline Complete            │
│ - Opportunity: VENDA (finalized)     │
│ - Order: Entregue (finalized)        │
│ - Post-Sales: Fechado (finalized)    │
└─────────────────────────────────────┘
```

### 11.2 Example 2: Devolução - Post-Sales to Order

```
SCENARIO: Customer returns product, needs rework

INITIAL STATE:
┌─────────────────────────────────────┐
│ Post-Sales #5                       │
│ - Status: Resolvido (finalized)     │
│ - Order: #3                         │
│ - Client: Acme Corp                 │
└─────────────────────────────────────┘

USER ACTION: Click "Devolução" button
┌─────────────────────────────────────┐
│ Devolução Dialog                    │
│ - Source: Post-Sales #5             │
│ - Target: Order                     │
│ - Reason: "Customer returned item"  │
└─────────────────────────────────────┘

VALIDATION PHASE:
✓ User has permission: crm:devolucao:post_sales_to_order
✓ Post-Sales #5 exists and is finalized
✓ Order #3 exists and is not finalized
✓ No circular devolução detected
✓ "Aguardando" status exists for orders

TRANSACTION EXECUTION:
1. Fetch Post-Sales #5 data
2. Fetch Order #3 data
3. Update Order #3 status → "Aguardando"
4. Update Post-Sales #5 status → "Aguardando"
5. Create audit record:
   {
     source_type: 'post_sales',
     source_id: 5,
     target_type: 'order',
     target_id: 3,
     user_id: 42,
     reason: 'Customer returned item',
     metadata: { validation_results: [...] }
   }

RESULT:
┌─────────────────────────────────────┐
│ Order #3                            │
│ - Status: Aguardando (waiting)      │
│ - Can be re-worked or re-shipped    │
│                                      │
│ Post-Sales #5                       │
│ - Status: Aguardando (waiting)      │
│ - Linked to Order #3 via audit      │
└─────────────────────────────────────┘
```

### 11.3 Example 3: Devolução - Order to Opportunity (Restoration)

```
SCENARIO: Order needs rework, restore original opportunity

INITIAL STATE:
┌─────────────────────────────────────┐
│ Order #2                            │
│ - Status: Enviado                   │
│ - Opportunity: #1 (original)        │
│ - Client: Acme Corp                 │
│ - opportunity_id: 1 (stored)        │
└─────────────────────────────────────┘

USER ACTION: Click "Devolução" button
┌─────────────────────────────────────┐
│ Devolução Dialog                    │
│ - Source: Order #2                  │
│ - Target: Opportunity               │
│ - Reason: "Needs rework"            │
└─────────────────────────────────────┘

RESTORATION CASE DETECTION:
✓ Order #2 has opportunity_id = 1
✓ This is a RESTORATION case
✓ Skip strict validation (more lenient)

TRANSACTION EXECUTION:
1. Fetch Order #2 data
2. Fetch Opportunity #1 (original)
3. Update Opportunity #1 status → "Aguardando"
   (NOT creating new opportunity)
4. Update Order #2 status → "Aguardando"
5. Create audit record:
   {
     source_type: 'order',
     source_id: 2,
     target_type: 'opportunity',
     target_id: 1,
     user_id: 42,
     reason: 'Needs rework',
     metadata: {
       is_restoration_case: true,
       original_opportunity_restored: true
     }
   }

RESULT:
┌─────────────────────────────────────┐
│ Opportunity #1 (RESTORED)           │
│ - Status: Aguardando (waiting)      │
│ - Can be re-negotiated              │
│ - Original data preserved           │
│                                      │
│ Order #2                            │
│ - Status: Aguardando (waiting)      │
│ - Linked to Opportunity #1          │
└─────────────────────────────────────┘
```

---

## 12. QUERY PATTERNS & PERFORMANCE

### 12.1 Opportunity Query Pattern

```typescript
// With visibility filtering
const opportunities = await db`
  SELECT 
    o.*,
    c.company_name as client_name,
    s.name as status_name,
    s.color as status_color,
    s.is_finalizer,
    s.is_waiting_status,
    CASE 
      WHEN o.source_devolucao_id IS NOT NULL THEN true
      ELSE false
    END as is_from_devolucao,
    (
      SELECT COALESCE(json_agg(oi.*), '[]'::json)
      FROM opportunity_items oi
      WHERE oi.opportunity_id = o.id
    ) as items
  FROM crm_opportunities o
  JOIN client_portfolio c ON o.client_id = c.id
  JOIN crm_statuses s ON o.status_id = s.id
  WHERE 
    o.department_id = ${departmentId}
    AND s.is_finalizer = ${!showFinalized}
    AND s.is_waiting_status = ${!showWaiting}
  ORDER BY o.updated_at DESC
`;
```

**Performance Considerations**:

- Indexes on: `client_id`, `status_id`, `department_id`, `created_at`
- JSON aggregation for items (efficient)
- Status JOIN for filtering and display data

### 12.2 Order Query Pattern

```typescript
// With opportunity relationship
const orders = await db`
  SELECT 
    o.*,
    c.company_name as client_name,
    s.name as status_name,
    opp.title as opportunity_title,
    (
      SELECT COALESCE(json_agg(oi.*), '[]'::json)
      FROM crm_order_items oi
      WHERE oi.order_id = o.id
    ) as items
  FROM crm_orders o
  JOIN client_portfolio c ON o.client_id = c.id
  JOIN crm_statuses s ON o.status_id = s.id
  LEFT JOIN crm_opportunities opp ON o.opportunity_id = opp.id
  WHERE o.department_id = ${departmentId}
  ORDER BY o.created_at DESC
`;
```

### 12.3 Post-Sales Query Pattern

```typescript
// With order relationship
const postSales = await db`
  SELECT 
    ps.*,
    c.company_name as client_name,
    s.name as status_name,
    ord.total_value as order_total_value
  FROM crm_post_sales ps
  JOIN client_portfolio c ON ps.client_id = c.id
  JOIN crm_statuses s ON ps.status_id = s.id
  LEFT JOIN crm_orders ord ON ps.order_id = ord.id
  WHERE ps.department_id = ${departmentId}
  ORDER BY ps.created_at DESC
`;
```

### 12.4 Indexes

```sql
-- Opportunities
CREATE INDEX idx_crm_opportunities_client ON crm_opportunities(client_id);
CREATE INDEX idx_crm_opportunities_status ON crm_opportunities(status_id);
CREATE INDEX idx_crm_opportunities_department ON crm_opportunities(department_id);
CREATE INDEX idx_crm_opportunities_created_at ON crm_opportunities(created_at DESC);

-- Orders
CREATE INDEX idx_crm_orders_client ON crm_orders(client_id);
CREATE INDEX idx_crm_orders_status ON crm_orders(status_id);
CREATE INDEX idx_crm_orders_opportunity ON crm_orders(opportunity_id);
CREATE INDEX idx_crm_orders_department ON crm_orders(department_id);

-- Post-Sales
CREATE INDEX idx_crm_post_sales_client ON crm_post_sales(client_id);
CREATE INDEX idx_crm_post_sales_status ON crm_post_sales(status_id);
CREATE INDEX idx_crm_post_sales_order ON crm_post_sales(order_id);
CREATE INDEX idx_crm_post_sales_department ON crm_post_sales(department_id);

-- Statuses
CREATE INDEX idx_crm_statuses_type ON crm_statuses(type);
CREATE INDEX idx_crm_statuses_department ON crm_statuses(department_id);
```

---

## 13. INTEGRATION POINTS

### 13.1 Client Portfolio Integration

**Relationship**:

```
client_portfolio (1) ←→ (many) crm_opportunities
client_portfolio (1) ←→ (many) crm_orders
client_portfolio (1) ←→ (many) crm_post_sales
```

**Data Flow**:

- Client selector in forms
- Client name display in lists
- Client-based filtering

### 13.2 Products Integration

**Relationship**:

```
products (1) ←→ (many) crm_order_items
products (1) ←→ (many) opportunity_items
```

**Data Flow**:

- Product selector in order/opportunity forms
- Automatic price lookup
- Stock management (future)

### 13.3 Notifications Integration

**Triggers**:

- New opportunity created → Notify sales team
- Order status changed → Notify client
- Post-sales created → Notify support team
- Devolução performed → Notify relevant users

### 13.4 Audit Trail Integration

**Tracked Events**:

- Entity creation
- Status changes
- Devolução operations
- Custom field updates

---

## 14. COMMON WORKFLOWS

### 14.1 Sales Representative Workflow

```
1. Create Opportunity
   - Enter client, value, close date
   - Add notes and custom fields

2. Progress Opportunity
   - Drag through statuses (Prospecting → Qualification → Proposal → Negotiation → VENDA)
   - Update probability and notes

3. Order Auto-Created
   - When opportunity reaches "VENDA"
   - Add line items
   - Confirm total value

4. Track Order
   - Update order status as it progresses
   - Add notes and attachments

5. Post-Sales Auto-Created
   - When order reaches "Entregue"
   - Support team takes over
```

### 14.2 Support Team Workflow

```
1. View Post-Sales Queue
   - Filter by priority
   - Sort by due date

2. Work on Post-Sales
   - Update status as work progresses
   - Add resolution notes
   - Link related items

3. Handle Returns/Issues
   - Use Devolução to revert to order
   - Coordinate with sales team
   - Track reason and resolution

4. Close Post-Sales
   - Mark as "Fechado" (finalized)
   - Archive for reporting
```

### 14.3 Manager Workflow

```
1. Monitor Pipeline
   - View Kanban board
   - See opportunities by stage
   - Track conversion rates

2. Analyze Performance
   - Filter by custom fields
   - View custom reports
   - Track devolução trends

3. Manage Configuration
   - Create/edit statuses
   - Configure automation rules
   - Set up custom fields
   - Manage user permissions
```

---

## 15. BEST PRACTICES & RECOMMENDATIONS

### 15.1 Data Entry

✅ **DO**:

- Always link opportunities to clients
- Set realistic close dates
- Use custom fields for tracking
- Add detailed notes for context
- Link orders to opportunities

❌ **DON'T**:

- Leave opportunities without status
- Create duplicate opportunities
- Manually create orders (use automation)
- Skip custom field requirements
- Delete finalized items (archive instead)

### 15.2 Status Configuration

✅ **DO**:

- Create clear, sequential statuses
- Use automation to reduce manual work
- Set up "Aguardando" status for devolução
- Configure visibility per user role
- Test automation rules before deployment

❌ **DON'T**:

- Create too many statuses (keep < 10 per type)
- Skip the "Aguardando" status
- Create circular automation rules
- Change status order frequently
- Remove statuses with active items

### 15.3 Devolução Operations

✅ **DO**:

- Document reason for devolução
- Check audit trail before reverting
- Verify permissions before attempting
- Test in development first
- Monitor devolução frequency

❌ **DON'T**:

- Perform devolução without reason
- Create circular devolução patterns
- Revert finalized items without approval
- Ignore validation warnings
- Perform bulk devolução without review

### 15.4 Performance Optimization

✅ **DO**:

- Use department filtering
- Implement pagination for large lists
- Cache custom field definitions
- Use visibility toggles to reduce data
- Monitor query performance

❌ **DON'T**:

- Load all opportunities at once
- Fetch unnecessary relationships
- Perform complex calculations in UI
- Skip index creation
- Ignore slow query warnings

---

## 16. TROUBLESHOOTING GUIDE

### Issue: Devolução fails with "Waiting status not found"

**Cause**: "Aguardando" status doesn't exist for target type

**Solution**:

```typescript
// Run this action to create default waiting statuses
await ensureDefaultWaitingStatuses(departmentId);
```

### Issue: Order not auto-created when opportunity reaches VENDA

**Cause**: Status doesn't have `create_order_on_entry = true`

**Solution**:

1. Go to CRM Settings → Statuses
2. Edit the "VENDA" status
3. Enable "Create order on entry"
4. Set target order status

### Issue: Custom fields not showing in list view

**Cause**: `show_in_lists.opportunity` is false

**Solution**:

1. Go to CRM Settings → Custom Fields
2. Edit the field
3. Enable "Show in lists" for desired entity types

### Issue: Devolução permission denied

**Cause**: User doesn't have required permission

**Solution**:

1. Go to Settings → Users
2. Edit user permissions
3. Add `crm:devolucao:manage_all` or specific permission
4. Save and refresh
