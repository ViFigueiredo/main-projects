# Task Reminder System Infrastructure

## Overview

The Task Reminder System provides comprehensive reminder functionality for personal tasks, including custom user-configured reminders, automatic overdue notifications, and due-soon alerts. The system integrates seamlessly with the existing notification infrastructure.

## Architecture

### Core Components

1. **Reminder Actions** (`reminder.actions.ts`)
   - CRUD operations for task reminders
   - Background service functions for processing due reminders
   - Integration with notification system

2. **Reminder Service** (`reminder-service.ts`)
   - Main processing service for all reminder types
   - Error handling and monitoring
   - Health status reporting

3. **Reminder Processor** (`reminder-processor.ts`)
   - Enhanced processing with comprehensive error handling
   - Detailed statistics and monitoring
   - Performance optimization

4. **Reminder Scheduler** (`reminder-scheduler.ts`)
   - Scheduling logic for different time intervals
   - Reminder validation and suggestions
   - Statistics calculation

5. **Notification Integration** (`reminder-notification-integration.ts`)
   - Seamless integration with existing notification system
   - Rich notification templates
   - Batch processing capabilities

6. **Reminder Utilities** (`reminder-utils.ts`)
   - Utility functions for time calculations
   - Validation helpers
   - Display formatting

## Features

### Reminder Types

- **15 minutes before** - Urgent reminders
- **30 minutes before** - Short-term reminders
- **1 hour before** - Medium-term reminders
- **1 day before** - Daily reminders
- **1 week before** - Long-term planning

### Automatic Notifications

1. **Custom Reminders**: User-configured reminders at specified intervals
2. **Overdue Notifications**: Daily notifications for overdue tasks
3. **Due Soon Alerts**: 24-hour advance notifications

### Smart Features

- **Optimal Suggestions**: Recommends appropriate reminder types based on due date
- **Validation**: Prevents reminders that would trigger in the past
- **Batch Processing**: Efficient processing of multiple reminders
- **Error Recovery**: Robust error handling with detailed logging

## Database Schema

### Tables

```sql
-- Task reminders
CREATE TABLE task_reminders (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES personal_tasks(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('15min', '30min', '1hour', '1day', '1week')),
  minutes_before INTEGER NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Additional columns in personal_tasks for notification tracking
ALTER TABLE personal_tasks 
ADD COLUMN IF NOT EXISTS last_overdue_notification DATE,
ADD COLUMN IF NOT EXISTS last_due_soon_notification TIMESTAMPTZ;
```

### Indexes

```sql
CREATE INDEX idx_task_reminders_task_id ON task_reminders(task_id);
CREATE INDEX idx_task_reminders_enabled ON task_reminders(is_enabled) WHERE is_enabled = TRUE;
CREATE INDEX idx_personal_tasks_overdue_notification ON personal_tasks(last_overdue_notification);
CREATE INDEX idx_personal_tasks_due_soon_notification ON personal_tasks(last_due_soon_notification);
```

## API Endpoints

### Processing Endpoint

```
POST /api/tasks/reminders/process
```

Processes all due reminders and sends notifications. Should be called periodically by a cron job.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalProcessed": 15,
    "remindersProcessed": 8,
    "overdueNotificationsSent": 4,
    "dueSoonNotificationsSent": 3,
    "processingTime": 1250,
    "timestamp": "2025-12-23T10:30:00Z"
  },
  "errors": []
}
```

### Health Check Endpoint

```
GET /api/tasks/reminders/process
```

Returns the health status of the reminder service.

**Response:**
```json
{
  "success": true,
  "health": {
    "status": "healthy",
    "pendingReminders": 12,
    "overdueTasks": 3,
    "dueSoonTasks": 5,
    "uptime": 150,
    "errors": []
  },
  "shouldProcess": true,
  "timestamp": "2025-12-23T10:30:00Z"
}
```

## Background Processing

### Cron Job Configuration

The reminder system requires periodic execution to process due reminders. Recommended configurations:

#### Vercel Cron (vercel.json)

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

#### GitHub Actions

```yaml
name: Task Reminder Processing
on:
  schedule:
    - cron: '*/10 6-23 * * *'
jobs:
  process-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger reminder processing
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/tasks/reminders/process" \
               -H "Content-Type: application/json"
```

#### External Cron Service

- **URL**: `https://your-app.vercel.app/api/tasks/reminders/process`
- **Method**: POST
- **Schedule**: Every 10 minutes during active hours (6 AM - 11 PM)
- **Headers**: `Content-Type: application/json`

### Processing Schedule

- **Active Hours**: Every 10 minutes (6 AM - 11 PM)
- **Off Hours**: Every hour (11 PM - 6 AM) for overdue notifications only
- **Time Zone**: Local server time

## Usage Examples

### Creating a Reminder

```typescript
import { createTaskReminder } from '@/lib/actions/reminder.actions';

const result = await createTaskReminder(taskId, {
  reminderType: '1day',
  minutesBefore: 1440,
  isEnabled: true,
});
```

### Processing Reminders Manually

```typescript
import { processAllReminders } from '@/lib/services/reminder-processor';

const stats = await processAllReminders();
console.log(`Processed ${stats.totalProcessed} reminders`);
```

### Getting Reminder Suggestions

```typescript
import { getOptimalReminderSuggestions } from '@/lib/services/reminder-scheduler';

const suggestions = getOptimalReminderSuggestions(dueDate);
const recommended = suggestions.filter(s => s.recommended);
```

## Monitoring and Health

### Health Status Levels

- **Healthy**: All systems operational, no errors
- **Degraded**: Some errors or slow response times
- **Unhealthy**: Critical errors or system unavailable

### Key Metrics

- **Pending Reminders**: Number of reminders waiting to be processed
- **Overdue Tasks**: Number of tasks past their due date
- **Due Soon Tasks**: Number of tasks due within 24 hours
- **Processing Time**: Time taken to process all reminders
- **Error Rate**: Percentage of failed reminder processing attempts

### Logging

The system provides comprehensive logging at different levels:

- **Info**: Successful processing, statistics
- **Warn**: Non-critical errors, degraded performance
- **Error**: Critical errors, failed operations

## Error Handling

### Error Recovery

- **Individual Failures**: Continue processing other reminders if one fails
- **Database Errors**: Retry with exponential backoff
- **Notification Failures**: Log error but don't block other notifications
- **Critical Errors**: Stop processing and report health as unhealthy

### Error Types

1. **Validation Errors**: Invalid reminder configuration
2. **Database Errors**: Connection or query failures
3. **Notification Errors**: Failed to create notifications
4. **Processing Errors**: General processing failures

## Security

### Authentication

- **Cron Jobs**: Optional `CRON_SECRET` environment variable for authentication
- **User Actions**: Standard user authentication required
- **Admin Functions**: Admin role required for system-wide operations

### Data Protection

- **User Isolation**: Users can only access their own reminders
- **Permission Checks**: All operations verify user permissions
- **Audit Trail**: All reminder actions are logged

## Performance Optimization

### Database Optimization

- **Indexes**: Optimized indexes for common queries
- **Query Optimization**: Efficient queries for large datasets
- **Connection Pooling**: Reuse database connections

### Processing Optimization

- **Batch Processing**: Process multiple reminders efficiently
- **Time-based Filtering**: Only process during active hours
- **Error Isolation**: Don't let individual failures block others

### Caching

- **Reminder Schedules**: Cache calculated trigger times
- **User Preferences**: Cache user notification preferences
- **Health Status**: Cache health checks for short periods

## Testing

### Unit Tests

Test individual functions and components:

```typescript
import { shouldTriggerReminder } from '@/lib/utils/reminder-utils';

test('should trigger reminder when due', () => {
  const dueDate = new Date('2025-12-23T10:00:00Z');
  const minutesBefore = 60;
  const result = shouldTriggerReminder(dueDate, minutesBefore);
  expect(result).toBe(true);
});
```

### Integration Tests

Test the complete reminder processing flow:

```typescript
import { processAllReminders } from '@/lib/services/reminder-processor';

test('should process all due reminders', async () => {
  const stats = await processAllReminders();
  expect(stats.errors).toHaveLength(0);
  expect(stats.totalProcessed).toBeGreaterThanOrEqual(0);
});
```

### Manual Testing

Use the test functions for manual verification:

```typescript
import { testNotificationIntegration } from '@/lib/services/reminder-notification-integration';

// Test notification integration
await testNotificationIntegration(userId);
```

## Troubleshooting

### Common Issues

1. **Reminders Not Triggering**
   - Check cron job configuration
   - Verify active hours settings
   - Check database connectivity

2. **Notifications Not Appearing**
   - Verify notification system integration
   - Check user permissions
   - Review error logs

3. **Performance Issues**
   - Monitor database query performance
   - Check processing time metrics
   - Review error rates

### Debug Commands

```typescript
// Check health status
const health = await getReminderServiceHealthStatus();

// Process reminders manually
const stats = await processAllReminders();

// Test notification integration
await testNotificationIntegration(userId);
```

## Future Enhancements

### Planned Features

1. **Email Notifications**: Backup email notifications for critical reminders
2. **Smart Scheduling**: AI-powered optimal reminder suggestions
3. **Bulk Operations**: Bulk reminder management for multiple tasks
4. **Custom Templates**: User-customizable notification templates
5. **Analytics**: Detailed analytics on reminder effectiveness

### Scalability Improvements

1. **Queue System**: Use message queues for high-volume processing
2. **Distributed Processing**: Scale across multiple instances
3. **Caching Layer**: Redis caching for improved performance
4. **Database Sharding**: Partition data for better performance

## Support

For issues or questions about the reminder system:

1. Check the logs for error messages
2. Verify configuration settings
3. Test individual components
4. Review the health status endpoint
5. Consult this documentation for troubleshooting steps