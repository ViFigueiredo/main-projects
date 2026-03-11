# Tech Stack & Build System

## Backend (Python 3.13)

### Framework & Core
- FastAPI with Uvicorn
- mitmproxy for traffic interception
- Playwright for browser automation
- PyJWT for authentication

### Database
- Supabase (PostgreSQL) via REST API only
- Never use asyncpg or direct SQL connections
- RLS (Row Level Security) always enabled

### Key Libraries
- httpx (HTTP client)
- slowapi (rate limiting)
- beautifulsoup4 (HTML parsing)
- python-dotenv (environment)

## Frontend (Vue.js 3 + TypeScript)

### Framework & Build
- Vue 3.5 with Composition API
- Vite 7 (build tool)
- pnpm 10.23 (package manager)
- TypeScript 5.9 (strict mode)

### UI & State
- PrimeVue 4 (component library)
- Tailwind CSS 4 (styling)
- Pinia 3 (state management)
- Vue Router 4 (routing)

## Common Commands

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python main.py          # Runs on :5000
```

### Frontend
```bash
cd frontend
pnpm install
pnpm dev                # Runs on :5173
pnpm build              # Production build
pnpm type-check         # TypeScript validation
pnpm lint               # ESLint + fix
```

### Security Scanning
```bash
python backend/run_security_scan.py
python backend/scripts/detect_secrets.py
```

## Environment Variables

### Required (Backend)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `JWT_SECRET` - JWT signing secret

### Optional
- `TURNSTILE_SECRET` - Cloudflare captcha
- `OPENROUTER_API_KEY` - AI explanations
- `OPENROUTER_MODEL` - AI model selection
