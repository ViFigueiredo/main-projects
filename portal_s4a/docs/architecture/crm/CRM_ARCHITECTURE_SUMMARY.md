# Portal S4A - CRM Module Architecture Summary

> Atualizacao (Marco/2026): o fluxo com status "Aguardando" foi descontinuado no runtime. Trechos deste documento que citam "Aguardando" representam comportamento historico e devem ser lidos como referencia legado.

## Quick Reference

### Three-Tier Pipeline System

```
OPPORTUNITIES (Funil)
    ↓ [Auto-create on status trigger]
ORDERS (Pedidos)
    ↓ [Auto-create on status trigger]
POST-SALES (Demandas)
    ↓ [Finalized]
ARCHIVED
```

### Key Entities

| Entity          | Purpose             | Lifecycle                       | Key Fields                                    |
| --------------- | ------------------- | ------------------------------- | --------------------------------------------- |
| **Opportunity** | Sales pipeline      | Prospecting → VENDA → Finalized | client_id, status_id, value, probability      |
| **Order**       | Confirmed sales     | Pendente → Entregue → Finalized | client_id, opportunity_id, items, total_value |
| **Post-Sales**  | After-sales support | Aberto → Resolvido → Fechado    | client_id, order_id, priority, description    |

### Database Tables

```
crm_opportunities
├── id, title, client_id, status_id
├── value, expected_close_date, probability
├── source_devolucao_id, source_devolucao_type
└── custom_data (JSONB)

crm_orders
├── id, client_id, opportunity_id, status_id
├── total_value, order_date
├── source_devolucao_id, source_devolucao_type
└── custom_data (JSONB)

crm_order_items
├── order_id, product_id
├── quantity, unit_price, total_price

crm_post_sales
├── id, client_id, order_id, status_id
├── priority, description, resolution
├── source_devolucao_id, source_devolucao_type
└── custom_data (JSONB)

crm_statuses
├── id, name, type (opportunity|order|post_sales)
├── color, order_index, is_active
├── is_finalizer, is_waiting_status
├── create_order_on_entry, target_order_status_id
├── create_demand_on_entry, target_demand_status_id
├── visible_to_users, is_visible_to_all
└── department_id

crm_devolucao_audit
├── id, source_type, source_id
├── target_type, target_id
├── user_id, reason
└── metadata (JSONB)
```

---

## Core Concepts

### 1. Automation Triggers

When an entity's status changes, the system checks for automation rules:

```
Status Update
    ↓
Check: create_order_on_entry?
    ├─ YES → Create Order with target_order_status_id
    └─ NO → Continue
    ↓
Check: create_demand_on_entry?
    ├─ YES → Create Post-Sales with target_demand_status_id
    └─ NO → Continue
```

### 2. Devolução (Bidirectional Flow)

Allows items to move backward through the pipeline:

```
POST-SALES (Resolvido)
    ↓ [Devolução]
ORDER (Aguardando)
    ↓ [Devolução]
OPPORTUNITY (Aguardando)
```

**Allowed Transitions**:

- Order → Opportunity (restore or create)
- Post-Sales → Order (restore or create)
- Post-Sales → Opportunity (restore or create)

### 3. Restoration vs. Creation

**Restoration Case** (Order → Opportunity):

- If order.opportunity_id exists
- Restore original opportunity to "Aguardando"
- Preserve original opportunity data

**Creation Case**:

- If no source opportunity exists
- Create new opportunity
- Link via source_devolucao_id

### 4. Visibility & Filtering

**Finalized Items**:

- Marked with `is_finalizer = true`
- Hidden by default (toggle to show)
- Archived for reporting

**Waiting Status**:

- Marked with `is_waiting_status = true`
- Used for devolução operations
- Hidden by default (toggle to show)

**Department Isolation**:

- All queries filtered by department_id
- Users can only see their department's data
- Prevents cross-department data leakage

---

## File Structure

### Database & Schema

```
src/lib/db.ts                          # Database initialization & tables
src/lib/schemas/crm.ts                 # Zod schemas for validation
```

### Business Logic

```
src/lib/actions/crm.actions.ts         # Server actions (CRUD operations)
src/lib/services/devolucao.service.ts  # Devolução logic
src/lib/utils/devolucao-validation.ts  # Validation checkpoints
src/lib/utils/devolucao-logger.ts      # Logging & monitoring
src/lib/utils/error-handling.ts        # Error handling
```

### Frontend Components

```
src/components/crm/opportunities/
├── kanban-board.tsx                    # Kanban view with drag-drop
└── opportunity-form.tsx                # Create/edit form

src/components/crm/orders/
├── order-form.tsx                      # Create/edit form
└── order-list.tsx                      # List view

src/components/crm/post-sales/
├── post-sales-form.tsx                 # Create/edit form
└── post-sales-list.tsx                 # List view

src/components/crm/
├── devolucao-button.tsx                # Devolução action button
├── relationship-navigation.tsx         # Show related entities
├── visibility-toggles.tsx              # Show/hide finalized & waiting
├── custom-filters-bar.tsx              # Custom field filtering
└── custom-fields-section.tsx           # Custom field form section
```

### Hooks

```
src/hooks/use-department.tsx            # Department context
src/hooks/use-visibility-toggles.tsx    # Visibility state management
```

---

## API Endpoints

### Opportunities

```
GET    /api/crm/opportunities           # List opportunities
POST   /api/crm/opportunities           # Create opportunity
PUT    /api/crm/opportunities/:id       # Update opportunity
DELETE /api/crm/opportunities/:id       # Delete opportunity
```

### Orders

```
GET    /api/crm/orders                  # List orders
POST   /api/crm/orders                  # Create order
PUT    /api/crm/orders/:id              # Update order
DELETE /api/crm/orders/:id              # Delete order
```

### Post-Sales

```
GET    /api/crm/post-sales              # List post-sales
POST   /api/crm/post-sales              # Create post-sales
PUT    /api/crm/post-sales/:id          # Update post-sales
DELETE /api/crm/post-sales/:id          # Delete post-sales
```

### Devolução

```
POST   /api/crm/devolucao               # Perform devolução
GET    /api/crm/devolucao/audit         # Get audit trail
GET    /api/crm/devolucao/permissions   # Get user permissions
```

### Statuses

```
GET    /api/crm/statuses                # List statuses
POST   /api/crm/statuses                # Create status
PUT    /api/crm/statuses/:id            # Update status
DELETE /api/crm/statuses/:id            # Delete status
```

---

## Key Features

### ✅ Implemented

- [x] Three-tier pipeline (Opportunities → Orders → Post-Sales)
- [x] Drag-and-drop Kanban board
- [x] Automatic entity creation on status triggers
- [x] Bidirectional flow (Devolução system)
- [x] Custom fields per entity type
- [x] Department-based data isolation
- [x] User visibility controls
- [x] Audit trail for all operations
- [x] Comprehensive validation
- [x] Error handling & logging
- [x] Relationship navigation
- [x] Custom filtering
- [x] Multi-view (Kanban & Table)

### 🔄 In Progress

- [ ] Advanced reporting & analytics
- [ ] Bulk operations
- [ ] Workflow automation rules
- [ ] Integration with external systems

### 📋 Planned

- [ ] Mobile app support
- [ ] Real-time collaboration
- [ ] AI-powered recommendations
- [ ] Predictive analytics

---

## Performance Metrics

### Query Performance

- Opportunity list: ~50ms (with 1000 items)
- Order list: ~75ms (with 500 items)
- Post-sales list: ~60ms (with 300 items)

### Indexes

- 15+ indexes on critical columns
- JSONB indexes for custom_data
- Composite indexes for common filters

### Caching

- Department context cached in localStorage
- Custom field definitions cached
- Status list cached per department

---

## Security & Permissions

### Permission Keys

```
crm:opportunities:create
crm:opportunities:edit
crm:opportunities:delete
crm:orders:create
crm:orders:edit
crm:orders:delete
crm:post_sales:create
crm:post_sales:edit
crm:post_sales:delete
crm:devolucao:manage_all
crm:devolucao:order_to_opportunity
crm:devolucao:post_sales_to_order
crm:devolucao:post_sales_to_opportunity
crm:devolucao:view_history
crm:settings:manage
```

### Data Isolation

- Department-level filtering on all queries
- User access control via user_department_access table
- Status visibility per user
- Audit trail for compliance

---

## Common Tasks

### Create Opportunity

```typescript
const result = await createOpportunity({
  client_id: 1,
  status_id: 1,
  value: 50000,
  expected_close_date: new Date('2025-12-31'),
  probability: 75,
  notes: 'High-value prospect',
  department_id: 1,
});
```

### Update Opportunity Status

```typescript
const result = await updateOpportunityStatus(opportunityId, newStatusId);
// Triggers automation if configured
```

### Create Order from Opportunity

```typescript
// Automatic when opportunity reaches "VENDA" status
// OR manual creation:
const result = await createOrder({
  client_id: 1,
  opportunity_id: 1,
  status_id: 2,
  total_value: 50000,
  order_date: new Date(),
  items: [
    { product_id: 1, quantity: 2, unit_price: 10000, total_price: 20000 },
    { product_id: 2, quantity: 3, unit_price: 10000, total_price: 30000 },
  ],
  department_id: 1,
});
```

### Perform Devolução

```typescript
const result = await performDevolucao(
  {
    sourceType: 'order',
    sourceId: 1,
    targetType: 'opportunity',
    reason: 'Customer needs rework',
  },
  currentUser,
);
```

---

## Troubleshooting Checklist

- [ ] Department is set correctly
- [ ] User has required permissions
- [ ] Status exists for entity type
- [ ] "Aguardando" status exists (for devolução)
- [ ] Client exists and is active
- [ ] Products exist (for orders)
- [ ] Custom fields are configured
- [ ] Automation rules are set up
- [ ] Indexes are created
- [ ] Audit trail is being logged

---

## Related Documentation

- **Database Setup**: `database-setup.md`
- **Deployment**: `deploy-vercel.md`
- **Development Workflow**: `development-workflow.md`
- **Theme System**: `theme-system.md`
- **Notifications**: `notifications-system.md`

---

## Support & Contact

For issues or questions about the CRM module:

1. Check the troubleshooting guide above
2. Review the detailed architecture documents (Part 1-3)
3. Check the audit trail for operation history
4. Review error logs in the browser console
5. Contact the development team

---

**Last Updated**: December 2025  
**Version**: 1.0  
**Status**: Production Ready
