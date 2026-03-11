# Requirements Document

## Introduction

Este documento especifica os requisitos para o módulo de Calendário de Eventos do CRM, focado em agendamento de contatos com prospects e tratativas de clientes. O módulo permitirá que usuários criem lembretes sobre clientes/prospects para serem notificados em datas/horas futuras, com visualização em formato de calendário e lista, similar ao módulo de Ocorrências do RH.

## Glossary

- **Event_Calendar**: Sistema de calendário de eventos do CRM para agendamento de contatos e tratativas
- **CRM_Event**: Registro de evento/lembrete associado a um cliente, oportunidade, pedido ou demanda
- **Reminder**: Notificação programada para alertar o usuário sobre um evento futuro
- **Client_Portfolio**: Carteira de clientes cadastrados no sistema CRM
- **Opportunity**: Oportunidade de venda no funil do CRM
- **Order**: Pedido de venda no CRM
- **Post_Sales**: Demanda de pós-venda no CRM
- **User**: Usuário do sistema que cria e recebe lembretes

## Requirements

### Requirement 1: Criar Eventos de Calendário

**User Story:** As a CRM user, I want to create calendar events linked to clients, opportunities, orders, or post-sales, so that I can schedule follow-ups and be reminded about important interactions.

#### Acceptance Criteria

1. WHEN a user creates a new event, THE Event_Calendar SHALL require a title, date/time, and at least one linked entity (client, opportunity, order, or post-sales)
2. WHEN a user creates an event, THE Event_Calendar SHALL allow optional description field for notes and context
3. WHEN a user creates an event, THE Event_Calendar SHALL allow selection of event type (contact, follow-up, meeting, deadline, other)
4. WHEN a user creates an event, THE Event_Calendar SHALL allow setting reminder time (15min, 30min, 1h, 1 day, 1 week before)
5. WHEN a user creates an event, THE Event_Calendar SHALL automatically associate the event with the current user as owner
6. WHEN an event is created, THE Event_Calendar SHALL persist the event to the database immediately
7. IF a required field is missing, THEN THE Event_Calendar SHALL display a validation error and prevent submission

### Requirement 2: Visualizar Eventos em Calendário

**User Story:** As a CRM user, I want to view my events in a calendar format, so that I can see my scheduled activities at a glance.

#### Acceptance Criteria

1. WHEN a user accesses the calendar view, THE Event_Calendar SHALL display events in a monthly calendar grid
2. WHEN a user views the calendar, THE Event_Calendar SHALL show event indicators on days with scheduled events
3. WHEN a user clicks on a day with events, THE Event_Calendar SHALL display a list of events for that day
4. WHEN a user navigates between months, THE Event_Calendar SHALL load and display events for the selected month
5. WHEN a user clicks "Today" button, THE Event_Calendar SHALL navigate to the current month and highlight today's date
6. WHEN events are displayed, THE Event_Calendar SHALL color-code events by type (contact, follow-up, meeting, deadline, other)

### Requirement 3: Visualizar Eventos em Lista

**User Story:** As a CRM user, I want to view my events in a list format, so that I can see detailed information about upcoming activities.

#### Acceptance Criteria

1. WHEN a user switches to list view, THE Event_Calendar SHALL display events in a chronological list
2. WHEN displaying list view, THE Event_Calendar SHALL show event title, date/time, type, linked entity, and status
3. WHEN displaying list view, THE Event_Calendar SHALL allow sorting by date, type, or linked entity
4. WHEN a user clicks on an event in the list, THE Event_Calendar SHALL display full event details
5. WHEN displaying list view, THE Event_Calendar SHALL provide pagination for large datasets

### Requirement 4: Filtrar Eventos

**User Story:** As a CRM user, I want to filter events by various criteria, so that I can find specific events quickly.

#### Acceptance Criteria

1. WHEN a user applies filters, THE Event_Calendar SHALL filter events by event type
2. WHEN a user applies filters, THE Event_Calendar SHALL filter events by linked entity type (client, opportunity, order, post-sales)
3. WHEN a user applies filters, THE Event_Calendar SHALL filter events by date range
4. WHEN a user applies filters, THE Event_Calendar SHALL filter events by status (pending, completed, cancelled)
5. WHEN a user applies filters, THE Event_Calendar SHALL filter events by client name (with autocomplete search)
6. WHEN filters are applied, THE Event_Calendar SHALL update both calendar and list views accordingly
7. WHEN a user clears filters, THE Event_Calendar SHALL restore the full event list

### Requirement 5: Editar Eventos

**User Story:** As a CRM user, I want to edit existing events, so that I can update information as circumstances change.

#### Acceptance Criteria

1. WHEN a user opens an event for editing, THE Event_Calendar SHALL display all current event data in editable form
2. WHEN a user modifies event data, THE Event_Calendar SHALL validate all required fields before saving
3. WHEN a user saves changes, THE Event_Calendar SHALL update the event in the database
4. WHEN a user saves changes, THE Event_Calendar SHALL refresh the calendar/list view to reflect updates
5. IF validation fails, THEN THE Event_Calendar SHALL display error messages and prevent saving

### Requirement 6: Excluir Eventos

**User Story:** As a CRM user, I want to delete events, so that I can remove cancelled or irrelevant activities.

#### Acceptance Criteria

1. WHEN a user requests to delete an event, THE Event_Calendar SHALL display a confirmation dialog
2. WHEN a user confirms deletion, THE Event_Calendar SHALL remove the event from the database
3. WHEN an event is deleted, THE Event_Calendar SHALL refresh the view to reflect the removal
4. IF deletion fails, THEN THE Event_Calendar SHALL display an error message and maintain the event

### Requirement 7: Marcar Eventos como Concluídos

**User Story:** As a CRM user, I want to mark events as completed, so that I can track which activities have been done.

#### Acceptance Criteria

1. WHEN a user marks an event as completed, THE Event_Calendar SHALL update the event status to "completed"
2. WHEN an event is marked completed, THE Event_Calendar SHALL record the completion timestamp
3. WHEN displaying completed events, THE Event_Calendar SHALL visually distinguish them from pending events
4. WHEN a user filters by status, THE Event_Calendar SHALL correctly show/hide completed events

### Requirement 8: Sistema de Lembretes

**User Story:** As a CRM user, I want to receive reminders about upcoming events, so that I don't miss important activities.

#### Acceptance Criteria

1. WHEN an event reminder time is reached, THE Reminder_System SHALL create a notification for the event owner
2. WHEN a reminder is triggered, THE Reminder_System SHALL include event title, time, and linked entity information
3. WHEN a reminder notification is created, THE Reminder_System SHALL make it visible in the notification bell
4. WHEN a user clicks on a reminder notification, THE Reminder_System SHALL navigate to the event details
5. WHEN an event is deleted or completed, THE Reminder_System SHALL cancel any pending reminders

### Requirement 9: Integração com Entidades do CRM

**User Story:** As a CRM user, I want events to be linked to CRM entities, so that I can see the full context of my interactions.

#### Acceptance Criteria

1. WHEN creating an event, THE Event_Calendar SHALL allow linking to existing clients from Client_Portfolio
2. WHEN creating an event, THE Event_Calendar SHALL allow linking to existing opportunities
3. WHEN creating an event, THE Event_Calendar SHALL allow linking to existing orders
4. WHEN creating an event, THE Event_Calendar SHALL allow linking to existing post-sales demands
5. WHEN viewing an event, THE Event_Calendar SHALL display linked entity details with navigation link
6. WHEN viewing a client/opportunity/order/post-sales, THE Event_Calendar SHALL show related events (future enhancement)

### Requirement 10: Controle de Acesso por Departamento

**User Story:** As a CRM manager, I want events to respect department boundaries, so that users only see events relevant to their department.

#### Acceptance Criteria

1. WHEN a user creates an event, THE Event_Calendar SHALL associate the event with the user's current department
2. WHEN a user views events, THE Event_Calendar SHALL only show events from their accessible departments
3. WHEN filtering events, THE Event_Calendar SHALL respect department access permissions
4. WHERE a user has multi-department access, THE Event_Calendar SHALL allow filtering by specific department

### Requirement 11: Persistência de Dados

**User Story:** As a system administrator, I want event data to be properly stored and retrieved, so that the system maintains data integrity.

#### Acceptance Criteria

1. WHEN storing events, THE Event_Calendar SHALL save all event data to PostgreSQL database
2. WHEN retrieving events, THE Event_Calendar SHALL load events with all related entity information
3. WHEN events are modified, THE Event_Calendar SHALL maintain audit trail with timestamps
4. FOR ALL valid CRM_Event objects, serializing then de-serializing SHALL produce an equivalent object (round-trip property)
