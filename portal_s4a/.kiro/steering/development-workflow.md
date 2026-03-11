---
title: "Development Workflow - Portal S4A"
description: "Standard development process for Portal S4A features"
tags: ["workflow", "development", "process", "git"]
---

# Development Workflow - Portal S4A

## Overview

Standardized workflow for developing features in Portal S4A, ensuring quality, consistency, and proper testing.

## Development Process

### 1. Planning Phase (30-60 min)

#### Analyze Requirements
- Review specification in `docs/specs/`
- Identify dependencies and impacts
- Estimate development time
- Create/update specification if needed

#### Create Development Branch
```bash
# Create Neon database branch
neonctl branches create feature-name --project-id restless-morning-33051903

# Update .env.local with new DATABASE_URL
DATABASE_URL="new-branch-connection-string"
```

### 2. Implementation Phase

#### Backend First Approach
```typescript
// 1. Define Zod schemas (src/lib/schemas/)
export const FeatureSchema = z.object({
  name: z.string().min(1),
  // ... other fields
});

// 2. Create migrations (src/lib/migrations/)
CREATE TABLE feature_table (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

// 3. Implement server actions (src/lib/actions/)
export async function createFeature(data: Feature) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, 'feature_create')) {
    return { success: false, error: 'Permission denied' };
  }
  
  try {
    // Implementation
    revalidatePath('/feature-path');
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Internal error' };
  }
}
```

#### Frontend Implementation
```typescript
// 1. Create components (src/components/)
export function FeatureForm() {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await createFeature(data);
      if (result.success) {
        toast.success('Success!');
      } else {
        toast.error(result.error);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    // Component JSX
  );
}

// 2. Create pages (src/app/)
export default function FeaturePage() {
  return <FeatureForm />;
}
```

### 3. Quality Assurance

#### Required Checks
```bash
# TypeScript validation
npx tsc --noEmit

# Build test
npm run build

# Manual testing checklist
- [ ] Create functionality works
- [ ] Edit functionality works
- [ ] Delete functionality works
- [ ] Permissions are respected
- [ ] Error handling works
- [ ] Loading states work
```

#### Code Standards
- Use TypeScript strict mode
- Follow existing naming conventions
- Include proper error handling
- Add loading states for async operations
- Use `revalidatePath()` after mutations
- Implement proper permission checks

### 4. Testing Strategy

#### Manual Testing
- Test all CRUD operations
- Verify permission boundaries
- Test error scenarios
- Validate UI/UX flows
- Check responsive design

#### Automated Testing
```bash
# Run existing tests
npm test

# Add new tests for critical paths
# Focus on server actions and business logic
```

### 5. Documentation

#### Required Documentation
- Update relevant specs in `docs/specs/`
- Create fix documentation if solving bugs
- Update API documentation if needed
- Add inline code comments for complex logic

#### Documentation Template
```markdown
# Feature: [Name]

**Status:** ✅ Implemented
**Date:** YYYY-MM-DD

## Overview
Brief description of the feature...

## Implementation
Technical details...

## Usage
How to use the feature...

## Testing
How to test the feature...
```

### 6. Deployment Process

#### Development Deployment
```bash
# Merge to develop branch
neonctl branches restore develop feature-name --project-id restless-morning-33051903

# Test in development environment
# Validate all functionality works
```

#### Production Deployment
```bash
# After validation, merge to production
neonctl branches restore production develop --project-id restless-morning-33051903

# Vercel automatically deploys from main branch
# Monitor deployment and validate in production
```

## Code Quality Standards

### TypeScript
- Use strict mode
- Define proper types for all data
- Avoid `any` type
- Use Zod schemas for validation

### React Components
- Use functional components with hooks
- Implement proper loading states
- Handle errors gracefully
- Follow accessibility guidelines

### Server Actions
- Always validate user permissions
- Use proper error handling
- Include `revalidatePath()` calls
- Log errors for debugging

### Database
- Use parameterized queries
- Include proper indexes
- Follow naming conventions
- Document schema changes

## Common Patterns

### Form Handling
```typescript
const form = useForm({
  resolver: zodResolver(Schema),
  defaultValues: { /* defaults */ }
});

const onSubmit = async (data) => {
  setLoading(true);
  try {
    const result = await serverAction(data);
    if (result.success) {
      toast.success('Success message');
      form.reset();
      onSuccess?.();
    } else {
      toast.error(result.error);
    }
  } catch (error) {
    toast.error('Unexpected error');
  } finally {
    setLoading(false);
  }
};
```

### Permission Checking
```typescript
// In server actions
const user = await getCurrentUser();
if (!user || (user.role !== 'admin' && !user.permissions.includes('required_permission'))) {
  return { success: false, error: 'Permission denied' };
}

// In components
const { user } = useAuth();
const canEdit = user?.role === 'admin' || user?.permissions.includes('edit_permission');
```

### Error Handling
```typescript
try {
  // Operation
  return { success: true, data };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: 'User-friendly error message' };
}
```

## Troubleshooting

### Build Failures
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all imports are correct
- Check for missing dependencies

### Database Issues
- Verify connection string in `.env.local`
- Check if tables exist in database
- Validate migration syntax

### Permission Issues
- Check user role and permissions
- Verify `getCurrentUser()` returns expected data
- Validate permission constants

## Best Practices

### Development
- Start with backend (schemas, actions, migrations)
- Test each component individually
- Use TypeScript strictly
- Follow existing patterns

### Performance
- Use `revalidatePath()` instead of full page reloads
- Implement proper loading states
- Optimize database queries
- Use appropriate indexes

### Security
- Always validate permissions
- Sanitize user inputs
- Use parameterized queries
- Never expose sensitive data

### Maintainability
- Write clear, self-documenting code
- Follow consistent naming conventions
- Add comments for complex logic
- Keep components focused and small