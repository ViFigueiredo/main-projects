# Task Notification Integration

## Overview

The task notification integration seamlessly connects the personal task management system with the existing notification infrastructure, providing users with timely reminders and updates about their tasks.

## Features Implemented

### ✅ Task-Specific Notification Types
- **Reminder Notifications**: Triggered based on user-configured reminder settings (15min, 30min, 1hour, 1day, 1week before due date)
- **Overdue Notifications**: Daily notifications for tasks that have passed their due date
- **Due Soon Notifications**: 24-hour advance notifications for upcoming tasks

### ✅ Notification Templates
- Context-aware notification messages with task details
- Priority and category emojis for visual distinction
- Clickable notifications that redirect to task details
- Appropriate notification types (info, warning, error) based on urgency

### ✅ Integration with Existing Notification Bell
- All task notifications appear in the existing notification bell component
- Consistent UI/UX with other system notifications
- Real-time notification updates via polling
- Click-through functionality to task management pages

### ✅ Background Processing Service
- Automated reminder processing via API endpoint
- Configurable cron job for regular processing (every 10 minutes during active hours)
- Health monitoring and error handling
- Batch processing for efficiency

### ✅ Database Integration
- Notification tracking fields to prevent duplicate notifications
- Efficient database queries with proper indexing
- Integration with existing notification table structure

## API Endpoints

### GET /api/tasks/reminders/process
Health check endpoint that returns:
- Service status (healthy/degraded/unhealthy)
- Count of pending reminders
- Count of overdue tasks needing notification
- Count of tasks due soon needing notification

### POST /api/tasks/reminders/process
Processing endpoint that:
- Processes all due reminders
- Sends overdue task notifications
- Sends due soon notifications
- Returns processing results and statistics

## Notification Types

### 1. Reminder Notifications
```typescript
{
  title: "⏰ Lembrete de Tarefa",
  message: "🔴 💼 Sua tarefa 'Revisar relatório' vence em 30 minutos.",
  type: "warning",
  link: "/intranet/tarefas?task=123"
}
```

### 2. Overdue Notifications
```typescript
{
  title: "🔴 Tarefa em Atraso",
  message: "Sua tarefa 'Revisar relatório' está 2 dias em atraso (venceu em 21/12/2025).",
  type: "error",
  link: "/intranet/tarefas?task=123"
}
```

### 3. Due Soon Notifications
```typescript
{
  title: "📅 Tarefa Vence Amanhã",
  message: "Sua tarefa 'Revisar relatório' vence em 24 horas (24/12/2025 09:00). Não esqueça!",
  type: "warning",
  link: "/intranet/tarefas?task=123"
}
```

## Cron Configuration

The system is configured to run automatically via Vercel Cron:

```json
{
  "crons": [
    {
      "path": "/api/tasks/reminders/process",
      "schedule": "*/10 6-23 * * *"
    }
  ]
}
```

This runs every 10 minutes between 6 AM and 11 PM to avoid notifications during sleeping hours.

## Testing

### Test Page
Visit `/test-tasks` to access the notification integration test page, which allows you to:
- Test basic notification creation
- Check service health status
- Manually trigger reminder processing
- Create sample notifications for each type

### Manual Testing
1. Create a task with a due date
2. Set up reminders for the task
3. Wait for the reminder time or manually trigger processing
4. Check the notification bell for new notifications
5. Click on notifications to verify redirection works

## Error Handling

The system includes comprehensive error handling:
- Database connection failures are logged and don't crash the service
- Individual notification failures don't stop batch processing
- Service health monitoring detects issues
- Graceful degradation when external services are unavailable

## Performance Considerations

- Efficient database queries with proper indexing
- Batch processing to minimize database connections
- Notification deduplication to prevent spam
- Configurable processing intervals to balance timeliness and resource usage

## Security

- All notifications require user authentication
- Task notifications only sent to task owners
- No sensitive task data exposed in notification content
- Secure API endpoints with proper authorization checks

## Future Enhancements

Potential improvements that could be added:
- Email notifications for critical overdue tasks
- Push notifications for mobile devices
- Notification preferences per user
- Smart notification timing based on user activity
- Integration with calendar systems
- Bulk notification management