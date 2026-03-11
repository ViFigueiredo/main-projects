# Content Management System Database Schema

This document describes the database schema for the Content Management System and Learning Center.

## Overview

The Content Management System uses PostgreSQL with the following key features:
- **Hierarchical categories** with unlimited nesting
- **Granular permissions** (user, department, role-based)
- **Full-text search** with Portuguese language support
- **Progress tracking** for learning analytics
- **Comprehensive analytics** with aggregated metrics
- **Automatic triggers** for data consistency

## Tables

### Core Content Tables

#### `content_categories`
Hierarchical category structure for organizing content.

**Key Features:**
- Self-referencing foreign key for unlimited nesting
- Unique constraint on category names within the same parent level
- Order index for custom sorting
- Soft delete with `is_active` flag

**Important Columns:**
- `parent_id`: References parent category (NULL for root categories)
- `order_index`: Custom sort order within parent level
- `is_active`: Soft delete flag

#### `content`
Main content storage with metadata and S3 file references.

**Key Features:**
- Full-text search vector automatically maintained
- JSONB metadata for flexible file properties
- Array-based tags for categorization
- View/download counters with automatic updates
- Status workflow (draft → published → archived)

**Important Columns:**
- `search_vector`: Automatically updated tsvector for full-text search
- `metadata`: JSONB field for file properties (pages, dimensions, etc.)
- `tags`: Array of strings for flexible tagging
- `status`: Content lifecycle status with constraints

#### `content_permissions`
Granular access control for content.

**Permission Types:**
- `user`: Individual user access (permission_value = user_id)
- `department`: Department-based access (permission_value = department_name)
- `role`: Role-based access (permission_value = role_name)

**Access Levels:**
- `view`: Can view content
- `download`: Can download content
- `admin`: Can manage content permissions

### User Engagement Tables

#### `user_content_progress`
Tracks individual user learning progress.

**Key Features:**
- Progress percentage (0-100)
- Time spent tracking (in seconds)
- Completion validation with constraints
- Last accessed timestamp for activity tracking

#### `user_content_activity`
Detailed activity logging for analytics and audit.

**Activity Types:**
- `view`: Content viewed
- `download`: Content downloaded
- `favorite`: Content bookmarked
- `share`: Content shared
- `complete`: Content completed

**Additional Data:**
- IP address and user agent for security
- JSONB metadata for action-specific data
- Automatic analytics updates via triggers

### Analytics Tables

#### `content_analytics`
Aggregated analytics per content item.

**Metrics:**
- Total views and downloads
- Unique viewer count
- Average time spent
- Completion rate percentage
- Rating average and count

**Updates:**
- Automatically updated via triggers
- Last updated timestamp for cache invalidation

#### `system_analytics`
Daily system-wide analytics snapshots.

**Daily Metrics:**
- Total content, users, views, downloads
- Storage usage in bytes
- Most popular content (array of IDs)
- Trending categories (array of IDs)
- Active users and new content counts

### Extended Features

#### `content_ratings`
User ratings and feedback system.

**Features:**
- 1-5 star rating system
- Optional text feedback
- Anonymous rating option
- Unique constraint per user-content pair

#### `content_bookmarks`
User favorites/bookmarks system.

**Features:**
- Personal notes on bookmarks
- Quick access to saved content
- Unique constraint per user-content pair

#### `learning_paths`
Structured learning sequences.

**Features:**
- Ordered array of content IDs
- Estimated duration in minutes
- Difficulty levels (beginner/intermediate/advanced)
- Prerequisites (array of learning path IDs)

#### `user_learning_path_progress`
Progress tracking through learning paths.

**Features:**
- Current position in learning path
- Completed content tracking
- Progress percentage calculation
- Estimated completion date

## Indexes and Performance

### Search Optimization
- **GIN indexes** on JSONB metadata and tag arrays
- **Full-text search** with Portuguese language support
- **Trigram indexes** for similarity search

### Query Optimization
- **Composite indexes** for common query patterns
- **Partial indexes** for filtered queries (e.g., published content only)
- **Foreign key indexes** for join performance

### Common Index Patterns
```sql
-- Status + category queries
CREATE INDEX idx_content_status_category ON content (status, category_id);

-- Date-based queries
CREATE INDEX idx_content_created_at ON content (created_at DESC);

-- Analytics queries
CREATE INDEX idx_analytics_views ON content_analytics (total_views DESC);
```

## Triggers and Automation

### Automatic Timestamp Updates
All tables with `updated_at` columns have triggers that automatically update the timestamp on row modifications.

### Search Vector Maintenance
The `content` table automatically maintains a full-text search vector that includes:
- Title and description
- Tags (array converted to text)
- Extracted text from metadata

### Analytics Updates
Activity logging automatically updates:
- Content view/download counters
- Analytics aggregation tables
- User progress statistics

## Views

### `content_with_category`
Joins content with category information and analytics for common queries.

### `category_hierarchy`
Recursive view showing the complete category tree with:
- Full path names (e.g., "Training > Safety > Fire Safety")
- Depth levels
- Content counts per category

### `user_progress_summary`
Aggregated user progress statistics including:
- Total content accessed
- Completion rates
- Time spent learning
- Last activity timestamps

## Migration Usage

### Running the Migration

```bash
# Using the CLI script
node scripts/migrate-content-system.js run

# Using TypeScript directly
npx ts-node src/lib/scripts/run-content-migration.ts run
```

### Checking Status

```bash
# Check if all tables exist and their row counts
node scripts/migrate-content-system.js status
```

### Rollback (⚠️ Destructive)

```bash
# WARNING: This deletes all data!
node scripts/migrate-content-system.js rollback
```

### Programmatic Usage

```typescript
import { runContentMigration, checkMigrationStatus } from '@/lib/utils/migration-runner';

// Run migration
await runContentMigration();

// Check status
await checkMigrationStatus();
```

## Default Data

The migration includes default categories:
- **Documentação** - Official documents and manuals
- **Treinamentos** - Training materials with subcategories:
  - Segurança (Safety)
  - Técnico (Technical)
  - Comportamental (Behavioral)
  - Compliance
- **Procedimentos** - Standard operating procedures
- **Políticas** - Company policies and guidelines
- **Recursos** - Miscellaneous resources and support materials

## Security Considerations

### Access Control
- Row-level security can be implemented using the permissions table
- Content visibility is controlled through the permissions system
- Activity logging provides audit trails

### Data Integrity
- Foreign key constraints prevent orphaned records
- Check constraints validate data ranges and formats
- Unique constraints prevent duplicate permissions

### Search Security
- Search queries are processed through PostgreSQL's full-text search
- Input sanitization should be implemented at the application level
- Search vectors are automatically maintained and cannot be directly manipulated

## Performance Recommendations

### For Large Datasets
- Consider partitioning the `user_content_activity` table by date
- Implement archiving for old analytics data
- Use connection pooling for high-concurrency scenarios

### Query Optimization
- Use the provided views for common query patterns
- Leverage the composite indexes for filtered queries
- Consider materialized views for complex analytics queries

### Monitoring
- Monitor index usage with `pg_stat_user_indexes`
- Track slow queries with `pg_stat_statements`
- Set up alerts for table size growth

## Maintenance

### Regular Tasks
- **VACUUM ANALYZE** on analytics tables (high update frequency)
- **REINDEX** on search vectors if performance degrades
- **Archive old activity logs** to prevent unbounded growth

### Backup Strategy
- Full database backups before major updates
- Point-in-time recovery for production environments
- Test restore procedures regularly

## Extension Requirements

The migration requires these PostgreSQL extensions:
- `uuid-ossp`: For UUID generation (if needed)
- `pg_trgm`: For trigram similarity search

These are automatically enabled by the migration script.