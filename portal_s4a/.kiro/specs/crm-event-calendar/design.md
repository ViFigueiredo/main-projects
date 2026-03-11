# Design Document: CRM Event Calendar

## Overview

O módulo de Calendário de Eventos do CRM é um sistema de agendamento e lembretes para gerenciar contatos com prospects e tratativas de clientes. O módulo segue a arquitetura existente do Portal S4A, utilizando Next.js App Router, Server Actions, PostgreSQL (Neon), e componentes Shadcn/UI.

A implementação é inspirada no módulo de Ocorrências do RH, adaptando a estrutura para o contexto do CRM com vinculação a entidades como clientes, oportunidades, pedidos e pós-vendas.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  src/app/crm/calendar/page.tsx (Server Component)               │
│  src/components/crm/calendar/                                    │
│    ├── calendar-page-client.tsx (Client Component)              │
│    ├── event-calendar-view.tsx (Calendar Grid)                  │
│    ├── event-list-view.tsx (List View)                          │
│    ├── new-event-dialog.tsx (Create Event)                      │
│    ├── edit-event-dialog.tsx (Edit Event)                       │
│    └── event-filters.tsx (Filter Controls)                      │
├─────────────────────────────────────────────────────────────────┤
│                     Server Actions                               │
├─────────────────────────────────────────────────────────────────┤
│  src/lib/actions/crm-events.actions.ts                          │
│    ├── getCrmEvents()                                           │
│    ├── getCrmEventById()                                        │
│    ├── createCrmEvent()                                         │
│    ├── updateCrmEvent()                                         │
│    ├── deleteCrmEvent()                                         │
│    ├── markEventCompleted()                                     │
│    └── processEventReminders()                                  │
├─────────────────────────────────────────────────────────────────┤
│                      Data Layer                                  │
├─────────────────────────────────────────────────────────────────┤
│  src/lib/schemas/crm-events.ts (Zod Schemas)                    │
│  src/lib/migrations/XXX_crm_events.sql (Database Schema)        │
│  PostgreSQL (Neon) - crm_events table                           │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Page Component

```typescript
// src/app/crm/calendar/page.tsx
interface CalendarPageProps {
  // Server-side data fetching
}

export default async function CrmCalendarPage() {
  const events = await getCrmEvents();
  const clients = await getClients();
  return (
    <DashboardLayout>
      <CalendarPageClient 
        initialEvents={events} 
        clients={clients}
      />
    </DashboardLayout>
  );
}
```

### Client Components

```typescript
// src/components/crm/calendar/calendar-page-client.tsx
interface CalendarPageClientProps {
  initialEvents: CrmEvent[];
  clients: Client[];
}

// src/components/crm/calendar/event-calendar-view.tsx
interface EventCalendarViewProps {
  events: CrmEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: CrmEvent) => void;
}

// src/components/crm/calendar/event-list-view.tsx
interface EventListViewProps {
  events: CrmEvent[];
  sortBy: 'date' | 'type' | 'entity';
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onEventClick: (event: CrmEvent) => void;
  onMarkComplete: (eventId: number) => void;
}

// src/components/crm/calendar/new-event-dialog.tsx
interface NewEventDialogProps {
  clients: Client[];
  onSuccess: () => void;
  defaultClientId?: number;
  defaultEntityType?: EntityType;
  defaultEntityId?: number;
}

// src/components/crm/calendar/edit-event-dialog.tsx
interface EditEventDialogProps {
  event: CrmEvent;
  clients: Client[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// src/components/crm/calendar/event-filters.tsx
interface EventFiltersProps {
  clients: Client[];
  onFilterChange: (filters: EventFilters) => void;
  activeFilters: EventFilters;
}
```

### Server Actions Interface

```typescript
// src/lib/actions/crm-events.actions.ts

// Get all events with optional filters
export async function getCrmEvents(filters?: EventFilters): Promise<CrmEvent[]>;

// Get single event by ID
export async function getCrmEventById(id: number): Promise<{ data?: CrmEvent; error?: string }>;

// Create new event
export async function createCrmEvent(data: CrmEventInput): Promise<{ success: boolean; error?: string; data?: CrmEvent }>;

// Update existing event
export async function updateCrmEvent(id: number, data: Partial<CrmEventInput>): Promise<{ success: boolean; error?: string }>;

// Delete event
export async function deleteCrmEvent(id: number): Promise<{ success: boolean; error?: string }>;

// Mark event as completed
export async function markEventCompleted(id: number): Promise<{ success: boolean; error?: string }>;

// Process pending reminders (called by cron/scheduler)
export async function processEventReminders(): Promise<{ processed: number; errors: number }>;
```

## Data Models

### Database Schema

```sql
-- Migration: XXX_crm_events.sql

CREATE TABLE IF NOT EXISTS crm_events (
  id SERIAL PRIMARY KEY,
  
  -- Core fields
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('contact', 'follow_up', 'meeting', 'deadline', 'other')),
  
  -- Date/Time
  event_date TIMESTAMPTZ NOT NULL,
  event_end_date TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  
  -- Reminder
  reminder_time VARCHAR(20) CHECK (reminder_time IN ('15min', '30min', '1h', '1day', '1week', 'none')),
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  -- Linked entities (at least one required)
  client_id INTEGER REFERENCES client_portfolio(id) ON DELETE SET NULL,
  opportunity_id INTEGER REFERENCES crm_opportunities(id) ON DELETE SET NULL,
  order_id INTEGER REFERENCES crm_orders(id) ON DELETE SET NULL,
  post_sales_id INTEGER REFERENCES crm_post_sales(id) ON DELETE SET NULL,
  
  -- Ownership and access
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: at least one entity must be linked
  CONSTRAINT at_least_one_entity CHECK (
    client_id IS NOT NULL OR 
    opportunity_id IS NOT NULL OR 
    order_id IS NOT NULL OR 
    post_sales_id IS NOT NULL
  )
);

-- Indexes for performance
CREATE INDEX idx_crm_events_owner ON crm_events(owner_id);
CREATE INDEX idx_crm_events_department ON crm_events(department_id);
CREATE INDEX idx_crm_events_date ON crm_events(event_date);
CREATE INDEX idx_crm_events_status ON crm_events(status);
CREATE INDEX idx_crm_events_client ON crm_events(client_id);
CREATE INDEX idx_crm_events_reminder ON crm_events(reminder_time, reminder_sent, event_date) 
  WHERE reminder_time IS NOT NULL AND reminder_sent = FALSE;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_crm_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crm_events_updated_at
  BEFORE UPDATE ON crm_events
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_events_updated_at();
```

### Zod Schemas

```typescript
// src/lib/schemas/crm-events.ts
import { z } from 'zod';

export const CrmEventTypeSchema = z.enum([
  'contact',
  'follow_up', 
  'meeting',
  'deadline',
  'other'
]);

export const CrmEventStatusSchema = z.enum([
  'pending',
  'completed',
  'cancelled'
]);

export const CrmEventReminderSchema = z.enum([
  '15min',
  '30min',
  '1h',
  '1day',
  '1week',
  'none'
]);

export const CrmEventSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  event_type: CrmEventTypeSchema,
  event_date: z.date({ required_error: 'Data do evento é obrigatória' }),
  event_end_date: z.date().optional(),
  status: CrmEventStatusSchema.default('pending'),
  completed_at: z.date().optional(),
  reminder_time: CrmEventReminderSchema.default('none'),
  reminder_sent: z.boolean().default(false),
  client_id: z.number().optional(),
  opportunity_id: z.number().optional(),
  order_id: z.number().optional(),
  post_sales_id: z.number().optional(),
  owner_id: z.number().optional(),
  department_id: z.number().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).refine(
  (data) => data.client_id || data.opportunity_id || data.order_id || data.post_sales_id,
  { message: 'Pelo menos uma entidade deve ser vinculada (cliente, oportunidade, pedido ou pós-venda)' }
);

export type CrmEvent = z.infer<typeof CrmEventSchema>;
export type CrmEventType = z.infer<typeof CrmEventTypeSchema>;
export type CrmEventStatus = z.infer<typeof CrmEventStatusSchema>;
export type CrmEventReminder = z.infer<typeof CrmEventReminderSchema>;

// Event types with labels and colors
export const CRM_EVENT_TYPES = [
  { value: 'contact', label: 'Contato', color: 'bg-blue-500' },
  { value: 'follow_up', label: 'Follow-up', color: 'bg-green-500' },
  { value: 'meeting', label: 'Reunião', color: 'bg-purple-500' },
  { value: 'deadline', label: 'Prazo', color: 'bg-red-500' },
  { value: 'other', label: 'Outro', color: 'bg-gray-500' },
];

export const CRM_EVENT_STATUSES = [
  { value: 'pending', label: 'Pendente' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

export const CRM_EVENT_REMINDERS = [
  { value: 'none', label: 'Sem lembrete' },
  { value: '15min', label: '15 minutos antes' },
  { value: '30min', label: '30 minutos antes' },
  { value: '1h', label: '1 hora antes' },
  { value: '1day', label: '1 dia antes' },
  { value: '1week', label: '1 semana antes' },
];

// Filter schema
export const EventFiltersSchema = z.object({
  eventType: z.string().optional(),
  entityType: z.enum(['client', 'opportunity', 'order', 'post_sales']).optional(),
  status: CrmEventStatusSchema.optional(),
  clientId: z.number().optional(),
  clientName: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  departmentId: z.number().optional(),
});

export type EventFilters = z.infer<typeof EventFiltersSchema>;
```

### Enhanced Event Type (with joins)

```typescript
// Extended type for events with related data
export interface EnhancedCrmEvent extends CrmEvent {
  client_name?: string;
  client_cnpj?: string;
  opportunity_title?: string;
  order_total_value?: number;
  post_sales_description?: string;
  owner_name?: string;
  owner_email?: string;
  department_name?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Validation Property

*For any* CRM event creation or update request, if any required field (title, event_date, or at least one linked entity) is missing or invalid, the system SHALL reject the request with a validation error; conversely, if all required fields are present and valid, the system SHALL accept the request.

**Validates: Requirements 1.1, 1.7, 5.2, 5.5**

### Property 2: CRUD Persistence Property

*For any* valid CRM event, after a successful create operation the event SHALL exist in the database; after a successful update operation the event SHALL reflect the new values; after a successful delete operation the event SHALL no longer exist in the database.

**Validates: Requirements 1.6, 5.3, 6.2**

### Property 3: Event Type and Reminder Property

*For any* CRM event, the event_type SHALL be one of the valid types (contact, follow_up, meeting, deadline, other) and the reminder_time SHALL be one of the valid options (15min, 30min, 1h, 1day, 1week, none).

**Validates: Requirements 1.3, 1.4**

### Property 4: User Association Property

*For any* CRM event created by a user, the owner_id SHALL automatically be set to the current user's ID without requiring explicit input.

**Validates: Requirements 1.5**

### Property 5: Date Range Query Property

*For any* date range query, the system SHALL return only events where event_date falls within the specified range (inclusive).

**Validates: Requirements 2.3, 2.4**

### Property 6: Chronological Sorting Property

*For any* list of events returned by the system, when sorted by date, the events SHALL be ordered chronologically (ascending or descending based on sort order).

**Validates: Requirements 3.1, 3.3**

### Property 7: Filtering Property

*For any* filter applied to the event list, the returned events SHALL match ALL specified filter criteria; when filters are cleared, ALL events accessible to the user SHALL be returned.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.7**

### Property 8: Entity Linking Property

*For any* CRM event with a linked entity (client, opportunity, order, or post_sales), the linked entity SHALL exist in the database, and when retrieving the event, the linked entity details SHALL be included in the response.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 9: Department Access Property

*For any* user viewing events, the system SHALL only return events where the department_id matches one of the user's accessible departments; events created by a user SHALL automatically have the department_id set to the user's current department.

**Validates: Requirements 10.1, 10.2, 10.4**

### Property 10: Reminder System Property

*For any* event with a reminder_time set (not 'none'), when the current time reaches the reminder threshold before event_date, the system SHALL create a notification for the owner; when an event is deleted or marked completed, any pending reminder SHALL be cancelled (reminder_sent set to true or event removed).

**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 11: Completion Timestamp Property

*For any* event marked as completed, the completed_at timestamp SHALL be set to the current time and the status SHALL be 'completed'.

**Validates: Requirements 7.1, 7.2**

### Property 12: Round-Trip Serialization Property

*For any* valid CrmEvent object, serializing to JSON and then deserializing back to a CrmEvent object SHALL produce an equivalent object (all fields match).

**Validates: Requirements 11.4**

## Error Handling

### Validation Errors

```typescript
// Validation error responses
interface ValidationError {
  success: false;
  error: string;
  field?: string;
}

// Examples:
// { success: false, error: 'Título é obrigatório', field: 'title' }
// { success: false, error: 'Pelo menos uma entidade deve ser vinculada' }
// { success: false, error: 'Data do evento é obrigatória', field: 'event_date' }
```

### Permission Errors

```typescript
// Permission denied responses
// { success: false, error: 'Permissão negada.' }
// { success: false, error: 'Evento não encontrado ou sem permissão de acesso.' }
```

### Database Errors

```typescript
// Database error responses (logged, generic message to user)
// { success: false, error: 'Erro ao criar evento.' }
// { success: false, error: 'Erro ao atualizar evento.' }
// { success: false, error: 'Erro ao deletar evento.' }
```

### Error Handling Strategy

1. **Validation First**: All inputs validated via Zod schemas before database operations
2. **Permission Check**: User authentication and authorization checked before any operation
3. **Database Errors**: Caught and logged, generic error message returned to user
4. **Optimistic UI**: Client shows loading state, reverts on error with toast notification

## Testing Strategy

### Unit Tests

Unit tests focus on specific examples and edge cases:

1. **Schema Validation Tests**
   - Test valid event creation with all required fields
   - Test rejection of events without title
   - Test rejection of events without linked entity
   - Test valid event types and reminder times

2. **Server Action Tests**
   - Test CRUD operations with mocked database
   - Test permission checks for different user roles
   - Test department filtering logic

3. **Component Tests**
   - Test form validation in NewEventDialog
   - Test filter application in EventFilters
   - Test date navigation in calendar view

### Property-Based Tests

Property-based tests verify universal properties across many generated inputs. Each test runs minimum 100 iterations.

**Testing Framework**: fast-check (TypeScript property-based testing library)

```typescript
// Example property test structure
import fc from 'fast-check';

describe('CRM Event Calendar Properties', () => {
  // Property 1: Validation Property
  it('should reject events with missing required fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.oneof(fc.constant(''), fc.constant(undefined)),
          event_date: fc.date(),
          event_type: fc.constantFrom('contact', 'follow_up', 'meeting', 'deadline', 'other'),
        }),
        (invalidEvent) => {
          const result = CrmEventSchema.safeParse(invalidEvent);
          return !result.success;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 7: Filtering Property
  it('should return only events matching all filter criteria', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryCrmEvent(), { minLength: 1, maxLength: 50 }),
        fc.record({
          eventType: fc.option(fc.constantFrom('contact', 'follow_up', 'meeting', 'deadline', 'other')),
          status: fc.option(fc.constantFrom('pending', 'completed', 'cancelled')),
        }),
        (events, filters) => {
          const filtered = applyFilters(events, filters);
          return filtered.every(event => 
            (!filters.eventType || event.event_type === filters.eventType) &&
            (!filters.status || event.status === filters.status)
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Requirements

- **Unit Tests**: Cover all server actions, schema validations, and component logic
- **Property Tests**: Cover all 12 correctness properties defined above
- **Integration Tests**: Test full flow from UI to database (manual or E2E)

### Test File Structure

```
src/__tests__/
├── crm-events/
│   ├── crm-events.actions.test.ts    # Server action unit tests
│   ├── crm-events.schema.test.ts     # Schema validation tests
│   └── crm-events.properties.test.ts # Property-based tests
└── components/
    └── crm/
        └── calendar/
            ├── new-event-dialog.test.tsx
            └── event-filters.test.tsx
```
