# Project Structure

## Root Directory Organization

```
├── .kiro/                 # Kiro AI assistant configuration
├── docs/                  # All documentation (specs, fixes, guides)
├── public/               # Static assets (images, icons)
├── src/                  # Source code (main application)
├── scripts/              # Build and utility scripts
├── .env.example          # Environment variables template
├── .env.local           # Local environment variables (gitignored)
├── package.json         # Dependencies and scripts
├── README.md            # Project overview (Portuguese)
├── AGENTS.md            # Fonte canonica de instrucoes para IA
└── todo.md              # Project tasks and notes
```

## Source Code Structure (`src/`)

### App Router (`src/app/`)

Next.js 15+ App Router with file-based routing:

```
src/app/
├── api/                 # API routes (Route Handlers)
│   ├── auth/           # Authentication endpoints
│   ├── chat/           # Real-time chat API
│   ├── crm/            # CRM-related endpoints
│   ├── hr/             # HR management API
│   ├── notes/          # Notes management
│   ├── notifications/  # Notification system
│   ├── s3/             # File upload/storage
│   └── upload/         # File upload handler
├── crm/                # CRM module pages
├── hr/                 # HR module pages
├── intranet/           # Intranet module pages
├── login/              # Authentication pages
├── profile/            # User profile pages
├── reports/            # Reports and analytics
├── settings/           # System configuration
├── layout.tsx          # Root layout component
├── page.tsx            # Home/dashboard page
└── globals.css         # Global styles and CSS variables
```

### Components (`src/components/`)

Reusable React components organized by feature:

```
src/components/
├── ui/                 # Shadcn/UI base components
│   ├── button.tsx      # Button variants
│   ├── form.tsx        # Form components
│   ├── dialog.tsx      # Modal dialogs
│   └── ...             # Other UI primitives
├── auth/               # Authentication components
├── crm/                # CRM-specific components
├── hr/                 # HR-specific components
├── intranet/           # Intranet components
├── layout/             # Layout components (sidebar, header)
├── dashboard/          # Dashboard widgets
├── profile/            # User profile components
├── reports/            # Report viewers
└── settings/           # Settings forms and tables
```

### Library Code (`src/lib/`)

Utilities, actions, and configurations:

```
src/lib/
├── actions/            # Server Actions for data operations
├── schemas/            # Zod validation schemas
├── migrations/         # Database migration SQL files
├── utils/              # Helper functions and utilities
├── validators/         # Input validation utilities
├── constants/          # Application constants
├── auth.ts             # Authentication logic
├── db.ts               # Database connection and queries
├── mail.ts             # Email sending utilities
├── s3.ts               # S3 file storage utilities
└── utils.ts            # General utility functions
```

### Configuration (`src/config/`)

Application configuration files:

```
src/config/
├── icons.ts            # Icon mappings and definitions
├── permissions.ts      # Role-based access control
└── routes.ts           # Route definitions and navigation
```

### Hooks (`src/hooks/`)

Custom React hooks:

```
src/hooks/
├── use-debounce.tsx    # Debounced values
├── use-mobile.tsx      # Mobile device detection
├── use-global-theme.tsx # Theme management
├── use-s3-image.tsx    # S3 image handling
└── use-signed-url.tsx  # S3 signed URL generation
```

## Naming Conventions

### Files and Directories

- **Pages**: `kebab-case` (e.g., `post-sales/page.tsx`)
- **Components**: `kebab-case` (e.g., `employee-form.tsx`)
- **Utilities**: `kebab-case` (e.g., `date-helpers.ts`)
- **API Routes**: `kebab-case` directories with `route.ts`

### Code

- **Components**: `PascalCase` (e.g., `EmployeeForm`)
- **Functions**: `camelCase` (e.g., `getUserById`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PAGE_SIZE`)
- **Types/Interfaces**: `PascalCase` (e.g., `Employee`, `UserRole`)

## Module Organization

Each major feature (HR, CRM, Intranet) follows this pattern:

1. **Pages**: Route components in `src/app/[module]/`
2. **Components**: Feature components in `src/components/[module]/`
3. **Actions**: Server actions in `src/lib/actions/[module].actions.ts`
4. **Schemas**: Validation in `src/lib/schemas/[module].ts`
5. **API**: Endpoints in `src/app/api/[module]/`

## Documentation Structure (`docs/`)

```
docs/
├── specs/              # Feature specifications and analysis
├── fixes/              # Bug fixes and solutions
├── steerings/          # Development guides and workflows
└── README.md           # Documentation index
```

## Key Architectural Patterns

- **Server Actions**: Data mutations via Next.js Server Actions
- **Route Handlers**: API endpoints for external integrations
- **Component Composition**: Shadcn/UI pattern with Radix primitives
- **Schema Validation**: Zod schemas for type-safe data validation
- **File-based Routing**: Next.js App Router conventions
- **CSS Variables**: Dynamic theming via CSS custom properties
