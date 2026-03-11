# Design Document - Sistema de Tarefas Pessoais

## Overview

O Sistema de Tarefas Pessoais é um submódulo integrado à Intranet que permite aos colaboradores gerenciar suas atividades pessoais de trabalho. O sistema oferece funcionalidades completas de criação, edição, agendamento, lembretes e notificações, seguindo os padrões arquiteturais já estabelecidos no Portal S4A.

O sistema será desenvolvido como uma extensão do módulo Intranet existente, reutilizando componentes, infraestrutura de notificações, sistema de storage S3 e padrões de UI já implementados, garantindo consistência e eficiência no desenvolvimento.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  Intranet Module                                           │
│  ├── Notes (existing)                                      │
│  ├── Chat (existing)                                       │
│  └── Tasks (NEW)                                           │
│      ├── Task Dashboard                                    │
│      ├── Task Form                                         │
│      ├── Task Calendar                                     │
│      └── Task Statistics                                   │
├─────────────────────────────────────────────────────────────┤
│                    API Layer                               │
│  ├── /api/tasks/* (NEW)                                   │
│  ├── /api/notifications/* (existing)                      │
│  └── /api/s3/* (existing)                                 │
├─────────────────────────────────────────────────────────────┤
│                  Business Logic                            │
│  ├── Task Actions (NEW)                                   │
│  ├── Reminder Service (NEW)                               │
│  ├── Notification Service (existing)                      │
│  └── File Upload Service (existing)                       │
├─────────────────────────────────────────────────────────────┤
│                    Database Layer                          │
│  ├── personal_tasks (NEW)                                 │
│  ├── task_reminders (NEW)                                 │
│  ├── task_attachments (NEW)                               │
│  ├── notifications (existing)                             │
│  └── users (existing)                                     │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

- **Notification System**: Reutiliza o sistema existente de notificações
- **File Storage**: Integra com o Backblaze B2 via S3 API existente
- **Authentication**: Usa o sistema de autenticação atual
- **UI Components**: Reutiliza componentes Shadcn/UI existentes
- **Navigation**: Integra ao menu lateral da Intranet

## Components and Interfaces

### Core Components

#### 1. Task Management Components

```typescript
// Task Dashboard - Visão principal das tarefas
interface TaskDashboardProps {
  userId: number;
  initialTasks: PersonalTask[];
  filters: TaskFilters;
}

// Task Form - Criação e edição de tarefas
interface TaskFormProps {
  task?: PersonalTask;
  onSubmit: (task: PersonalTask) => Promise<void>;
  onCancel: () => void;
}

// Task Calendar - Visualização em calendário
interface TaskCalendarProps {
  tasks: PersonalTask[];
  onTaskClick: (task: PersonalTask) => void;
  onDateSelect: (date: Date) => void;
}

// Task Statistics - Métricas e relatórios
interface TaskStatisticsProps {
  userId: number;
  dateRange: DateRange;
}
```

#### 2. Reminder Components

```typescript
// Reminder Configuration
interface ReminderConfigProps {
  taskId: number;
  reminders: TaskReminder[];
  onUpdate: (reminders: TaskReminder[]) => Promise<void>;
}

// Reminder Service Interface
interface ReminderService {
  scheduleReminder(reminder: TaskReminder): Promise<void>;
  cancelReminder(reminderId: number): Promise<void>;
  processReminders(): Promise<void>;
}
```

#### 3. File Attachment Components

```typescript
// File Upload for Tasks
interface TaskFileUploadProps {
  taskId: number;
  maxFiles: number;
  maxFileSize: number;
  onUploadComplete: (files: TaskAttachment[]) => void;
}

// File List Display
interface TaskFileListProps {
  attachments: TaskAttachment[];
  onDownload: (attachment: TaskAttachment) => void;
  onDelete: (attachmentId: number) => void;
}
```

### API Interfaces

#### Task API Endpoints

```typescript
// GET /api/tasks - Listar tarefas do usuário
interface GetTasksResponse {
  tasks: PersonalTask[];
  total: number;
  page: number;
}

// POST /api/tasks - Criar nova tarefa
interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: Date;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}

// PUT /api/tasks/[id] - Atualizar tarefa
interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus;
}

// POST /api/tasks/[id]/reminders - Configurar lembretes
interface SetRemindersRequest {
  reminders: {
    type: ReminderType;
    minutesBefore: number;
  }[];
}
```

## Data Models

### Database Schema

```sql
-- Tabela principal de tarefas pessoais
CREATE TABLE personal_tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  category TEXT NOT NULL CHECK (category IN ('trabalho', 'pessoal', 'projeto', 'reuniao', 'outros')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  due_date TIMESTAMPTZ,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB, -- {type: 'daily|weekly|monthly|yearly', interval: 1, endDate?: Date}
  parent_task_id INTEGER REFERENCES personal_tasks(id), -- Para tarefas recorrentes
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de lembretes
CREATE TABLE task_reminders (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES personal_tasks(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('15min', '30min', '1hour', '1day', '1week')),
  minutes_before INTEGER NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de anexos
CREATE TABLE task_attachments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES personal_tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_personal_tasks_user_id ON personal_tasks(user_id);
CREATE INDEX idx_personal_tasks_due_date ON personal_tasks(due_date);
CREATE INDEX idx_personal_tasks_status ON personal_tasks(status);
CREATE INDEX idx_task_reminders_task_id ON task_reminders(task_id);
CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
```

### TypeScript Interfaces

```typescript
// Tipos principais
type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';
type TaskCategory = 'trabalho' | 'pessoal' | 'projeto' | 'reuniao' | 'outros';
type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
type ReminderType = '15min' | '30min' | '1hour' | '1day' | '1week';

// Interface principal da tarefa
interface PersonalTask {
  id: number;
  userId: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  dueDate?: Date;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  parentTaskId?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  reminders?: TaskReminder[];
  attachments?: TaskAttachment[];
}

// Interface de recorrência
interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // A cada X dias/semanas/meses/anos
  endDate?: Date;
  daysOfWeek?: number[]; // Para recorrência semanal (0=domingo, 1=segunda, etc.)
  dayOfMonth?: number; // Para recorrência mensal
}

// Interface de lembrete
interface TaskReminder {
  id: number;
  taskId: number;
  reminderType: ReminderType;
  minutesBefore: number;
  isEnabled: boolean;
  lastTriggeredAt?: Date;
  createdAt: Date;
}

// Interface de anexo
interface TaskAttachment {
  id: number;
  taskId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  s3Key: string;
  uploadedAt: Date;
}

// Interface de filtros
interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  overdue?: boolean;
}

// Interface de estatísticas
interface TaskStatistics {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  byCategory: Record<TaskCategory, number>;
  byPriority: Record<TaskPriority, number>;
  weeklyCompletion: Array<{
    week: string;
    completed: number;
    created: number;
  }>;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all properties identified in the prework analysis, I identified several areas where properties can be consolidated or where redundancy exists:

- **Data persistence properties** (1.1, 3.1, 3.3) can be combined into comprehensive CRUD properties
- **Validation properties** (1.2, 1.3, 7.2) share similar validation patterns
- **Notification properties** (5.1, 5.2, 5.3, 5.4, 5.5) can be consolidated into notification behavior properties
- **Filter properties** (8.2, 8.3, 8.4) can be combined into comprehensive filtering properties

The following properties represent the unique validation value after removing redundancy:

### Core Data Management Properties

**Property 1: Task CRUD Operations Preserve Data Integrity**
*For any* valid task data, creating, reading, updating, or deleting a task should maintain data consistency and all required fields should be properly handled
**Validates: Requirements 1.1, 3.1, 3.3**

**Property 2: Task Status Transitions Update Related Fields**
*For any* task status change, the system should automatically update related timestamps and maintain status consistency (completion timestamp for completed tasks, cleared timestamps for reopened tasks)
**Validates: Requirements 3.2, 3.5**

**Property 3: Input Validation Rejects Invalid Data**
*For any* invalid input (past due dates, invalid priorities, invalid categories, oversized files), the system should reject the input and maintain current state
**Validates: Requirements 1.2, 1.3, 7.2**

### Filtering and Search Properties

**Property 4: Task Filtering Returns Correct Subsets**
*For any* combination of filters (status, priority, category, date range, search terms), the system should return only tasks that match ALL applied criteria using AND logic
**Validates: Requirements 2.2, 8.2, 8.3, 8.4, 8.5**

**Property 5: Task Sorting Produces Correct Order**
*For any* collection of tasks and any sorting criteria (due date, priority, creation date, alphabetical), the system should return tasks in the mathematically correct order
**Validates: Requirements 2.4**

### Reminder and Notification Properties

**Property 6: Reminder System Triggers Notifications Correctly**
*For any* task with configured reminders, when the reminder time is reached, the system should create appropriate notifications and handle reminder state correctly
**Validates: Requirements 4.2, 4.4, 4.5, 5.1, 5.2**

**Property 7: Notification Integration Maintains Consistency**
*For any* task notification, the system should use the existing notification infrastructure and maintain the same format, behavior, and UI integration as other system notifications
**Validates: Requirements 5.3, 5.4, 5.5, 10.1, 10.2, 10.3, 10.4, 10.5**

### Recurring Task Properties

**Property 8: Recurring Task Generation Follows Pattern Rules**
*For any* recurring task that is completed, the system should generate the next instance according to the recurrence pattern and stop generation when end conditions are met
**Validates: Requirements 6.2, 6.5**

### File Management Properties

**Property 9: File Attachment Operations Maintain Storage Consistency**
*For any* file attachment operation (upload, download, delete), the system should maintain consistency between database records and S3 storage, enforce size/count limits, and use secure signed URLs
**Validates: Requirements 7.1, 7.3, 7.4, 7.5**

### Statistics and Reporting Properties

**Property 10: Task Statistics Reflect Accurate Data**
*For any* user's task collection, calculated statistics (totals, completion rates, distributions, overdue counts) should accurately reflect the current state of tasks and their relationships
**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

## Error Handling

### Client-Side Error Handling

```typescript
// Form validation errors
interface TaskFormErrors {
  title?: string;
  dueDate?: string;
  priority?: string;
  category?: string;
  attachments?: string;
}

// API error responses
interface TaskApiError {
  success: false;
  error: string;
  code?: 'VALIDATION_ERROR' | 'PERMISSION_DENIED' | 'NOT_FOUND' | 'SERVER_ERROR';
  details?: Record<string, string>;
}

// Error boundary for task components
export function TaskErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-center">
          <p className="text-red-600">Erro ao carregar tarefas</p>
          <Button onClick={() => window.location.reload()}>
            Recarregar página
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
```

### Server-Side Error Handling

```typescript
// Standardized error handling for task actions
export async function handleTaskError(error: unknown, operation: string) {
  console.error(`Task ${operation} error:`, error);
  
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: 'Dados inválidos fornecidos',
      code: 'VALIDATION_ERROR',
      details: error.flatten().fieldErrors
    };
  }
  
  if (error instanceof Error && error.message.includes('permission')) {
    return {
      success: false,
      error: 'Permissão negada',
      code: 'PERMISSION_DENIED'
    };
  }
  
  return {
    success: false,
    error: 'Erro interno do servidor',
    code: 'SERVER_ERROR'
  };
}
```

### Reminder Service Error Handling

```typescript
// Robust reminder processing with error recovery
export async function processReminders() {
  try {
    const dueReminders = await getDueReminders();
    
    for (const reminder of dueReminders) {
      try {
        await createNotificationForReminder(reminder);
        await markReminderAsTriggered(reminder.id);
      } catch (error) {
        console.error(`Failed to process reminder ${reminder.id}:`, error);
        // Continue processing other reminders
      }
    }
  } catch (error) {
    console.error('Failed to fetch due reminders:', error);
    // Schedule retry
    setTimeout(processReminders, 60000); // Retry in 1 minute
  }
}
```

## Testing Strategy

### Unit Testing Approach

**Focus Areas:**
- Server actions validation and business logic
- Utility functions (date calculations, recurrence logic)
- Form validation schemas
- Error handling functions

**Example Unit Tests:**
```typescript
describe('Task Creation', () => {
  test('should create task with valid data', async () => {
    const taskData = {
      title: 'Test Task',
      priority: 'alta' as TaskPriority,
      category: 'trabalho' as TaskCategory,
      dueDate: new Date('2025-12-31')
    };
    
    const result = await createTask(taskData);
    expect(result.success).toBe(true);
    expect(result.task).toMatchObject(taskData);
  });
  
  test('should reject task with past due date', async () => {
    const taskData = {
      title: 'Test Task',
      priority: 'alta' as TaskPriority,
      category: 'trabalho' as TaskCategory,
      dueDate: new Date('2020-01-01') // Past date
    };
    
    const result = await createTask(taskData);
    expect(result.success).toBe(false);
    expect(result.error).toContain('data não pode ser no passado');
  });
});
```

### Property-Based Testing Approach

**Testing Framework:** fast-check (JavaScript property-based testing library)
**Configuration:** Minimum 100 iterations per property test
**Integration:** Each property test will be tagged with comments referencing the design document properties

**Property Test Examples:**
```typescript
import fc from 'fast-check';

describe('Task Filtering Properties', () => {
  test('Property 4: Task filtering returns correct subsets', () => {
    /**
     * Feature: personal-task-management, Property 4: Task Filtering Returns Correct Subsets
     * Validates: Requirements 2.2, 8.2, 8.3, 8.4, 8.5
     */
    fc.assert(fc.property(
      fc.array(taskGenerator, { minLength: 0, maxLength: 50 }),
      fc.record({
        status: fc.option(fc.array(fc.constantFrom('pendente', 'concluida', 'cancelada'))),
        priority: fc.option(fc.array(fc.constantFrom('baixa', 'media', 'alta', 'urgente'))),
        category: fc.option(fc.array(fc.constantFrom('trabalho', 'pessoal', 'projeto')))
      }),
      (tasks, filters) => {
        const filtered = applyTaskFilters(tasks, filters);
        
        // All returned tasks should match the applied filters
        return filtered.every(task => 
          (!filters.status || filters.status.includes(task.status)) &&
          (!filters.priority || filters.priority.includes(task.priority)) &&
          (!filters.category || filters.category.includes(task.category))
        );
      }
    ), { numRuns: 100 });
  });
});
```

### Integration Testing

**Key Integration Points:**
- Task creation with notification system
- File upload with S3 storage
- Reminder system with notification delivery
- Task statistics with database queries

### Testing Requirements Summary

- **Unit Tests:** Focus on business logic, validation, and error handling
- **Property Tests:** Verify universal properties across all inputs (minimum 100 iterations each)
- **Integration Tests:** Test component interactions and external service integration
- **Manual Testing:** UI workflows, accessibility, and user experience validation

The dual testing approach ensures comprehensive coverage: unit tests catch specific bugs and edge cases, while property tests verify general correctness across the entire input space.