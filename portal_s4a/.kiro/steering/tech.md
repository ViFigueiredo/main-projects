# Technology Stack

## Core Framework & Language

- **Framework**: Next.js 16.0.8 (App Router)
- **Language**: TypeScript (strict mode enabled)
- **Runtime**: Node.js with ES2017 target
- **Package Manager**: pnpm 10.23.0

## Database & Backend

- **Database**: PostgreSQL via Neon (serverless)
- **Driver**: `postgres` library (not Prisma)
- **Connection**: `DATABASE_URL` environment variable
- **Migrations**: Manual SQL files in `src/lib/migrations/`

## UI & Styling

- **UI Framework**: Shadcn/UI (built on Radix UI primitives)
- **Styling**: Tailwind CSS 3.4.1 with `tailwindcss-animate`
- **Icons**: Lucide React
- **Themes**: `next-themes` with CSS variables for dynamic theming
- **Charts**: Recharts for data visualization

## Forms & Validation

- **Forms**: React Hook Form 7.56.4
- **Validation**: Zod schemas with `@hookform/resolvers`
- **File Uploads**: Custom S3 integration (Backblaze B2)

## Real-time & Communication

- **WebSockets**: Socket.io for real-time features
- **Push Notifications**: Pusher for real-time updates
- **Notifications**: Sonner for toast messages

## Development Tools

- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript with strict settings
- **Build Tool**: Next.js with Turbopack support
- **Deployment**: Cloudflare Pages with `@opennextjs/cloudflare`

## Common Commands

```bash
# Development
pnpm dev                    # Start dev server with Turbopack
pnpm dev:webpack           # Start dev server with Webpack
pnpm dev:turbo             # Explicit Turbopack mode

# Build & Deploy
pnpm build                 # Production build
pnpm start                 # Start production server
pnpm preview               # Build and start (preview)

# Code Quality
pnpm lint                  # Run ESLint

# Package Management
pnpm install               # Install dependencies
pnpm add <package>         # Add new dependency
pnpm add -D <package>      # Add dev dependency
```

## Environment Setup

Required environment variables:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `ADMIN_EMAIL`: Default admin user email
- `ADMIN_PASSWORD`: Default admin user password
- Storage credentials for S3 (Backblaze B2)

## Key Libraries

- **UI Components**: @radix-ui/* primitives
- **Drag & Drop**: @hello-pangea/dnd
- **Date Handling**: date-fns, luxon
- **PDF Generation**: jspdf with jspdf-autotable
- **Excel Processing**: xlsx
- **Authentication**: bcryptjs for password hashing
- **Email**: nodemailer for notifications