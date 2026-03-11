# 🤖 Contexto Rápido para LLMs - DataSniffer AI

> Este arquivo fornece contexto essencial para LLMs trabalharem eficientemente neste projeto.

## 🎯 Informação Crítica

### Projeto
- **Nome**: DataSniffer AI
- **Tipo**: Ferramenta de análise de segurança web
- **Versão**: 1.1.0
- **Arquitetura**: Full-stack (FastAPI + Vue.js 3)

### Regras OBRIGATÓRIAS
📖 **Leia primeiro**: [../AI_RULES.md](../AI_RULES.md)

#### Top 5 Regras
1. ✅ **SEMPRE** usar REST API (nunca SQL direto com asyncpg)
2. ✅ **SEMPRE** adicionar `Depends(get_current_user)` em endpoints protegidos
3. ✅ **SEMPRE** usar helpers `getAPI/postAPI/putAPI/deleteAPI` no frontend
4. ✅ **NUNCA** usar `fetch()` direto no frontend
5. ✅ **SEMPRE** manter RLS (Row Level Security) ativo

### Estrutura Completa
📖 **Consulte**: [../components.json](../components.json)

### Documentação
- **Início rápido**: [../docs/QUICK_START.md](../docs/QUICK_START.md)
- **README principal**: [../README.md](../README.md)
- **Índice de docs**: [../docs/README.md](../docs/README.md)
- **Fixes conhecidos**: [../docs/fixes/README.md](../docs/fixes/README.md)

## 🔧 Stack Tecnológico

### Backend
```python
# Framework: FastAPI
# Linguagem: Python 3.13
# Porta: 5000
# Auth: Supabase Auth + JWT
# Database: Supabase (REST API only)
```

### Frontend
```typescript
// Framework: Vue.js 3 + TypeScript
// State: Pinia
// UI: PrimeVue 4 + Tailwind CSS 4
// Porta: 5173
```

### Database
```
Provider: Supabase
Type: PostgreSQL
Access: REST API only (RLS enabled)
```

## 🚫 Erros Comuns

### ❌ Erro 1: Usar asyncpg
```python
# ERRADO
await supabase_db.fetch_json("SELECT * FROM table")

# CORRETO
from .supabase_rest import rest_client
response = await rest_client.get("/rest/v1/table")
```

### ❌ Erro 2: Fetch sem token
```typescript
// ERRADO
const response = await fetch('http://localhost:5000/endpoint')

// CORRETO
import { getAPI } from '../utils/api'
const data = await getAPI('/endpoint')
```

### ❌ Erro 3: Endpoint sem auth
```python
# ERRADO
@app.get("/data")
async def get_data():
    return data

# CORRETO
@app.get("/data")
async def get_data(current_user: dict = Depends(get_current_user)):
    return data
```

## 📁 Arquivos Importantes

### Backend
- `backend/main.py` - FastAPI app principal
- `backend/src/auth.py` - Autenticação JWT
- `backend/db/database.py` - Funções de banco (REST API)
- `backend/db/supabase_rest.py` - Cliente REST

### Frontend
- `frontend/src/stores/authBackend.ts` - Store de autenticação
- `frontend/src/stores/traffic.ts` - Store de tráfego
- `frontend/src/utils/api.ts` - Helpers autenticados ⭐
- `frontend/src/router/index.ts` - Rotas protegidas

## 🔑 Variáveis de Ambiente

```bash
# Obrigatórias
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
JWT_SECRET=datasniffer-secret-key-change-in-production

# Opcionais
TURNSTILE_SECRET=xxx
OPENROUTER_API_KEY=xxx
```

## 🎯 Padrões de Código

### Endpoint Protegido
```python
@app.get("/endpoint")
async def get_endpoint(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    return await database.get_data(user_id)
```

### Função de Banco (REST API)
```python
async def get_data(user_id: str) -> List[Dict]:
    from .supabase_rest import rest_client
    response = await rest_client.get(
        f"/rest/v1/table?user_id=eq.{user_id}"
    )
    return response.json() if response.status_code == 200 else []
```

### Frontend Store
```typescript
import { getAPI, postAPI } from '../utils/api'

async function fetchData() {
  return await getAPI('/endpoint')  // Token automático
}
```

## 🐛 Debug

### Logs Importantes
```python
# Autenticação
print(f"[Auth] Token válido: user_id={user_id}, role={role}")

# Endpoints
print(f"[Endpoint] /route - Usuário: {email}")

# REST API
print(f"[REST] GET /rest/v1/table - Status: {status}")
```

## 📊 Usuários de Teste

```
Admin:
  Email: admin@datasniffer.ai
  Senha: DataSniffer2025!Admin
  Role: admin

User1:
  Email: user1@test.com
  Senha: test123
  Role: user
```

## 📝 Regras de Documentação

### SEMPRE Documentar:

#### 1. Fixes e Correções → `docs/fixes/`
```bash
# Corrigiu um bug?
1. Criar docs/fixes/FIX_NOME.md
2. Atualizar docs/fixes/README.md
3. Commit: "fix: descrição"
```

#### 2. Mudanças de Estrutura → `components.json`
```bash
# Adicionou biblioteca?
1. Atualizar components.json → dependencies
2. Commit: "feat: adicionar biblioteca X"

# Adicionou componente?
1. Atualizar components.json → structure
2. Commit: "feat: adicionar componente X"

# Adicionou endpoint?
1. Atualizar components.json → api.endpoints
2. Commit: "feat: adicionar endpoint X"
```

#### 3. Mudanças de Arquitetura → `README.md`
```bash
# Mudou arquitetura?
1. Atualizar README.md
2. Atualizar components.json
3. Commit: "refactor: mudança na arquitetura"
```

### Checklist Antes de Commit:
- [ ] É um fix? → `docs/fixes/FIX_*.md`
- [ ] Adicionou lib? → `components.json`
- [ ] Mudou estrutura? → `components.json`
- [ ] Adicionou endpoint? → `components.json`
- [ ] Mudou arquitetura? → `README.md` + `components.json`

## 🔗 Links Rápidos

- **Regras completas**: [../AI_RULES.md](../AI_RULES.md)
- **Estrutura JSON**: [../components.json](../components.json)
- **Quick Start**: [../docs/QUICK_START.md](../docs/QUICK_START.md)
- **Fixes**: [../docs/fixes/README.md](../docs/fixes/README.md)

---

**Última atualização**: 2025-12-08  
**Para LLMs**: 
1. Leia AI_RULES.md antes de modificar código
2. Consulte components.json para estrutura
3. SEMPRE documente mudanças (fixes em docs/fixes/, estrutura em components.json)
