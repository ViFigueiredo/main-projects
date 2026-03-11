# Project Structure

```
datasniffer-ai/
├── backend/                    # Python FastAPI backend
│   ├── main.py                # App entry, routes, middleware
│   ├── src/                   # Core modules
│   │   ├── auth.py           # JWT authentication
│   │   ├── browser_inspector.py  # Playwright analysis
│   │   ├── crawler.py        # URL discovery
│   │   ├── fuzzer.py         # Parameter fuzzing
│   │   ├── analyzer.py       # Vulnerability detection
│   │   └── openrouter_client.py  # AI integration
│   ├── db/                    # Database layer
│   │   ├── database.py       # REST API functions
│   │   ├── supabase_rest.py  # HTTP client wrapper
│   │   └── migrations/       # SQL schemas
│   ├── proxy_addon.py        # mitmproxy addon
│   └── config/               # Configuration
│
├── frontend/                  # Vue.js SPA
│   └── src/
│       ├── views/            # Page components
│       ├── components/       # Reusable UI
│       ├── stores/           # Pinia state
│       │   ├── authBackend.ts   # Auth state
│       │   └── traffic.ts       # Traffic data
│       ├── utils/
│       │   └── api.ts        # HTTP helpers (always use these!)
│       ├── router/           # Vue Router config
│       └── layouts/          # Layout wrappers
│
├── docs/                      # Documentation
│   └── fixes/                # Bug fix documentation
│
└── reports/                   # Security scan outputs
```

## Key Conventions

### Backend Endpoints
- Protected routes: `Depends(get_current_user)`
- Admin routes: `Depends(require_role("admin"))`
- Public routes: Only `/auth/*` and `/status`

### Frontend API Calls
- Always use `getAPI()`, `postAPI()`, `putAPI()`, `deleteAPI()` from `utils/api.ts`
- Never use raw `fetch()` - helpers add JWT automatically

### Database Access
- Use REST API via `supabase_rest.py` only
- Never use direct SQL or asyncpg
- RLS policies handle data isolation

### Documentation
- Bug fixes go in `docs/fixes/`
- Update `components.json` when adding libs/endpoints
