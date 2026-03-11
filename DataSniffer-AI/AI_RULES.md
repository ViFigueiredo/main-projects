# 🤖 AI Development Rules - DataSniffer AI

## 📋 Regras Prioritárias para LLMs

### 1. 🔐 Autenticação e Segurança

#### ✅ SEMPRE FAZER:
- **Backend**: Adicionar `Depends(get_current_user)` em TODOS os endpoints protegidos
- **Backend Admin**: Usar `Depends(require_role("admin"))` para rotas administrativas
- **Frontend**: Usar helpers `getAPI()`, `postAPI()`, `putAPI()`, `deleteAPI()` de `src/utils/api.ts`
- **NUNCA** usar `fetch()` direto no frontend - sempre usar os helpers que adicionam token JWT automaticamente

#### ❌ NUNCA FAZER:
- Criar endpoints sem autenticação (exceto `/auth/*` e `/status`)
- Fazer requisições HTTP diretas com `fetch()` no frontend
- Expor dados de outros usuários (RLS deve estar sempre ativo)
- Usar `asyncpg` ou conexões SQL diretas (usar REST API apenas)

### 2. 🗄️ Banco de Dados

#### ✅ ESTRATÉGIA OBRIGATÓRIA: REST API ONLY
```python
# ✅ CORRETO - Usar REST API
from .supabase_rest import rest_client
response = await rest_client.get("/rest/v1/table?filter=value")

# ❌ ERRADO - Não usar SQL direto
await supabase_db.fetch_json("SELECT * FROM table")  # NÃO FAZER!
```

#### Configuração:
- **SUPABASE_URL**: URL HTTP do Supabase (https://...)
- **SUPABASE_SERVICE_ROLE_KEY**: Service role key (bypassa RLS quando necessário)
- **Sem DATABASE_URL**: Não usar connection string PostgreSQL
- **Sem asyncpg**: Apenas httpx para REST API

#### RLS (Row Level Security):
- **SEMPRE ATIVO** em todas as tabelas
- Service role key bypassa RLS para operações administrativas
- Usuários veem apenas seus próprios dados
- Admins veem tudo (via RLS policies)

### 3. 🎨 Frontend

#### Estrutura de Stores (Pinia):
```typescript
// ✅ CORRETO - Usar helpers autenticados
import { getAPI, postAPI, putAPI, deleteAPI } from '../utils/api'

async function fetchData() {
  return await getAPI('/endpoint')  // Token adicionado automaticamente
}

// ❌ ERRADO - Fetch direto
async function fetchData() {
  const response = await fetch('http://localhost:5000/endpoint')  // NÃO FAZER!
}
```

#### Autenticação:
- Store: `authBackendStore` (não usar `authStore` antigo)
- Token: Armazenado em `localStorage` como `auth_token`
- Expiração: 24 horas
- Verificação: Automática ao carregar a aplicação

### 4. 📁 Estrutura de Arquivos

#### Backend:
```
backend/
├── main.py                 # FastAPI app principal
├── src/
│   ├── auth.py            # Autenticação JWT
│   ├── browser_inspector.py
│   ├── crawler.py
│   ├── fuzzer.py
│   └── openrouter_client.py
├── db/
│   ├── database.py        # Funções de banco (REST API)
│   ├── supabase_rest.py   # Cliente REST
│   └── supabase_db.py     # Legacy (sendo removido)
└── proxy_addon.py         # mitmproxy addon
```

#### Frontend:
```
frontend/src/
├── stores/
│   ├── authBackend.ts     # Autenticação
│   └── traffic.ts         # Tráfego e análise
├── views/                 # Páginas
├── components/            # Componentes reutilizáveis
├── utils/
│   └── api.ts            # Helpers autenticados ⭐
├── layouts/
│   └── DefaultLayout.vue
└── router/
    └── index.ts          # Rotas protegidas
```

### 5. 🔧 Padrões de Código

#### Endpoints FastAPI:
```python
# ✅ Endpoint protegido (usuário autenticado)
@app.get("/endpoint")
async def get_endpoint(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    # Lógica aqui
    return data

# ✅ Endpoint admin
@app.get("/admin/endpoint")
async def admin_endpoint(current_user: dict = Depends(require_role("admin"))):
    # Apenas admins podem acessar
    return data

# ✅ Endpoint público
@app.post("/auth/signin")
async def signin(user_data: UserLogin):
    # Sem autenticação necessária
    return await sign_in(user_data.email, user_data.password)
```

#### Funções de Banco (REST API):
```python
async def get_data(user_id: str) -> List[Dict]:
    """Get data via REST API with RLS."""
    from .supabase_rest import rest_client
    try:
        response = await rest_client.get(
            f"/rest/v1/table?user_id=eq.{user_id}&order=created_at.desc"
        )
        if response.status_code == 200:
            return response.json()
        return []
    except Exception as e:
        print(f"[REST] Erro: {e}")
        return []
```

### 6. 🐛 Debug e Logging

#### Adicionar logs em pontos críticos:
```python
# Autenticação
print(f"[Auth] Tentando login para: {email}")
print(f"[Auth] Token válido: user_id={user_id}, role={role}")

# Endpoints
print(f"[Endpoint] /route - Usuário: {email} (role: {role})")

# REST API
print(f"[REST] GET /rest/v1/table - Status: {response.status_code}")
```

### 7. 📝 Documentação

#### ✅ REGRAS OBRIGATÓRIAS DE DOCUMENTAÇÃO:

##### 1. Correções e Fixes
**SEMPRE** criar documentação em `docs/fixes/` quando:
- Corrigir bugs ou erros
- Resolver problemas de integração
- Aplicar hotfixes
- Solucionar erros de configuração

**Nomenclatura**:
- `FIX_*.md` - Correções específicas
- `SOLUCAO_*.md` - Soluções completas
- `CORRECAO_*.md` - Correções gerais

**Template**:
```markdown
# Título do Fix

## Problema
Descrição clara do problema

## Causa Raiz
O que causou o problema

## Solução Aplicada
O que foi feito para resolver

## Como Testar
Passos para verificar a correção

## Arquivos Modificados
Lista de arquivos alterados

## Status
✅ Resolvido / 🔄 Em andamento
```

##### 2. Documentação Geral
**SEMPRE** criar/atualizar em `docs/` quando:
- Adicionar novas funcionalidades
- Criar guias técnicos
- Documentar processos
- Escrever tutoriais

**Nomenclatura**:
- `*_GUIDE.md` - Guias técnicos
- `*_SETUP.md` - Guias de configuração
- `COMO_*.md` - Tutoriais

##### 3. Atualização de Estrutura
**SEMPRE** atualizar quando houver mudanças:

| Mudança | Arquivo a Atualizar | Obrigatório |
|---------|---------------------|-------------|
| Adicionar/remover biblioteca | `components.json` → dependencies | ✅ SIM |
| Adicionar/remover componente | `components.json` → structure | ✅ SIM |
| Mudar arquitetura | `README.md` + `components.json` | ✅ SIM |
| Adicionar endpoint | `components.json` → api.endpoints | ✅ SIM |
| Adicionar variável de ambiente | `.env.example` + `components.json` | ✅ SIM |
| Mudar tecnologia | `README.md` + `components.json` | ✅ SIM |
| Adicionar tabela no banco | `components.json` → database.tables | ✅ SIM |

##### 4. Checklist de Documentação

Antes de fazer commit, verifique:
- [ ] Se é um fix → Criou arquivo em `docs/fixes/`?
- [ ] Adicionou biblioteca → Atualizou `components.json`?
- [ ] Mudou estrutura → Atualizou `components.json`?
- [ ] Adicionou endpoint → Atualizou `components.json`?
- [ ] Mudou arquitetura → Atualizou `README.md`?
- [ ] Adicionou variável de ambiente → Atualizou `.env.example`?
- [ ] Atualizou índice em `docs/fixes/README.md` (se for fix)?

#### Estrutura de docs:
```
docs/
├── README.md              # Índice geral da documentação
├── QUICK_START.md         # Guia rápido de início
├── fixes/                 # ⭐ CORREÇÕES (obrigatório para fixes)
│   ├── README.md         # Índice de fixes
│   ├── FIX_*.md          # Correções específicas
│   ├── SOLUCAO_*.md      # Soluções completas
│   └── CORRECAO_*.md     # Correções gerais
└── guides/                # Guias técnicos gerais
    ├── *_GUIDE.md        # Guias técnicos
    ├── *_SETUP.md        # Guias de configuração
    └── COMO_*.md         # Tutoriais
```

#### Exemplos Práticos:

**Exemplo 1: Adicionou biblioteca httpx**
```bash
# 1. Instalar
pip install httpx

# 2. Atualizar components.json
# Adicionar em backend.dependencies.http: ["httpx"]

# 3. Commit
git commit -m "feat: adicionar httpx para requisições HTTP"
```

**Exemplo 2: Corrigiu erro 401**
```bash
# 1. Corrigir código
# 2. Criar docs/fixes/FIX_401_ERROR.md
# 3. Atualizar docs/fixes/README.md (adicionar na tabela)
# 4. Commit
git commit -m "fix: corrigir erro 401 em endpoints autenticados"
```

**Exemplo 3: Adicionou novo endpoint**
```bash
# 1. Criar endpoint em main.py
# 2. Atualizar components.json → api.endpoints
# 3. Commit
git commit -m "feat: adicionar endpoint /new-feature"
```

### 8. 🚫 Erros Comuns a Evitar

#### ❌ Erro 1: Usar asyncpg com SUPABASE_URL
```python
# ❌ ERRADO
await supabase_db.fetch_json("SELECT * FROM table")
# Erro: invalid DSN: scheme is expected to be "postgresql", got "https"

# ✅ CORRETO
response = await rest_client.get("/rest/v1/table")
```

#### ❌ Erro 2: Fetch sem token no frontend
```typescript
// ❌ ERRADO
const response = await fetch('http://localhost:5000/endpoint')
// Resultado: 401 Unauthorized

// ✅ CORRETO
const data = await getAPI('/endpoint')  // Token adicionado automaticamente
```

#### ❌ Erro 3: Endpoint sem autenticação
```python
# ❌ ERRADO
@app.get("/sensitive_data")
async def get_data():
    return database.get_all_data()  # Qualquer um pode acessar!

# ✅ CORRETO
@app.get("/sensitive_data")
async def get_data(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    return await database.get_user_data(user_id)
```

### 9. 🧪 Testing

#### Usuários de teste:
- **Admin**: `admin@datasniffer.ai` / `DataSniffer2025!Admin`
- **User1**: `user1@test.com` / `test123`
- **User2**: `user2@test.com` / `test123`

#### Checklist de teste:
- [ ] Login funciona
- [ ] Token é salvo no localStorage
- [ ] Rotas protegidas exigem autenticação
- [ ] RLS isola dados entre usuários
- [ ] Admin vê todos os dados
- [ ] Logout limpa token

### 10. 🚀 Deploy

#### Variáveis de ambiente obrigatórias:
```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Opcional
TURNSTILE_SECRET=xxx
OPENROUTER_API_KEY=xxx
OPENROUTER_MODEL=google/gemini-2.0-flash-lite-preview-02-05:free
```

#### Portas:
- Backend: 5000
- Frontend: 5173

### 11. 📋 Manutenção de Documentação

#### Quando Atualizar components.json

**SEMPRE** atualizar `components.json` quando:

1. **Adicionar/Remover Biblioteca**
```json
// Adicionar em backend.dependencies ou frontend.dependencies
{
  "backend": {
    "dependencies": {
      "http": ["httpx", "requests"]  // ← Adicionar aqui
    }
  }
}
```

2. **Adicionar/Remover Componente**
```json
// Adicionar em structure
{
  "structure": {
    "backend": {
      "components": {
        "new_module": {  // ← Adicionar aqui
          "path": "src/new_module.py",
          "description": "Descrição do módulo"
        }
      }
    }
  }
}
```

3. **Adicionar/Remover Endpoint**
```json
// Adicionar em api.endpoints
{
  "api": {
    "endpoints": {
      "authenticated": [
        "GET /new-endpoint"  // ← Adicionar aqui
      ]
    }
  }
}
```

4. **Adicionar/Remover Tabela**
```json
// Adicionar em database.tables
{
  "database": {
    "tables": {
      "new_table": {  // ← Adicionar aqui
        "description": "Descrição da tabela",
        "columns": ["id", "name", "created_at"],
        "rls": "Filtrado por user_id"
      }
    }
  }
}
```

5. **Adicionar Variável de Ambiente**
```json
// Adicionar em backend.environment ou frontend.environment
{
  "backend": {
    "environment": {
      "required": [
        "NEW_ENV_VAR"  // ← Adicionar aqui
      ]
    }
  }
}
```

#### Quando Criar Documentação em docs/fixes/

**SEMPRE** criar em `docs/fixes/` quando:
- ✅ Corrigir bug ou erro
- ✅ Resolver problema de integração
- ✅ Aplicar hotfix
- ✅ Solucionar erro de configuração
- ✅ Corrigir comportamento inesperado

**Passos**:
1. Criar arquivo `docs/fixes/FIX_NOME_DO_PROBLEMA.md`
2. Seguir template de fix (ver seção 7)
3. Atualizar `docs/fixes/README.md` (adicionar na tabela)
4. Commitar com mensagem: `fix: descrição do problema`

#### Quando Criar Documentação em docs/

**SEMPRE** criar em `docs/` quando:
- ✅ Adicionar nova funcionalidade (guia de uso)
- ✅ Criar processo novo (guia técnico)
- ✅ Documentar configuração (setup guide)
- ✅ Escrever tutorial

**Passos**:
1. Criar arquivo `docs/NOME_GUIDE.md` ou `docs/NOME_SETUP.md`
2. Atualizar `docs/README.md` (adicionar no índice)
3. Commitar com mensagem: `docs: adicionar guia de X`

#### Workflow de Documentação

```
┌─────────────────────────────────────────────────────────┐
│ Fez mudança no código?                                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ É um fix?     │
         └───┬───────┬───┘
             │       │
         Sim │       │ Não
             │       │
             ▼       ▼
    ┌────────────┐  ┌──────────────────────┐
    │docs/fixes/ │  │ Mudou estrutura?     │
    └────────────┘  └───┬──────────────┬───┘
                        │              │
                    Sim │              │ Não
                        │              │
                        ▼              ▼
              ┌──────────────────┐  ┌─────────────┐
              │components.json + │  │ Apenas      │
              │README.md         │  │ código      │
              └──────────────────┘  └─────────────┘
```

#### Checklist Antes de Commit

```bash
# 1. Mudanças no código
git status

# 2. Verificar documentação
[ ] É um fix? → Criar docs/fixes/FIX_*.md
[ ] Adicionou lib? → Atualizar components.json
[ ] Mudou estrutura? → Atualizar components.json
[ ] Adicionou endpoint? → Atualizar components.json
[ ] Mudou arquitetura? → Atualizar README.md
[ ] Adicionou env var? → Atualizar .env.example

# 3. Commit
git add .
git commit -m "tipo: descrição"
```

---

## 🎯 Resumo Executivo

### Ao trabalhar neste projeto, SEMPRE:
1. ✅ Usar REST API (nunca SQL direto)
2. ✅ Adicionar autenticação em endpoints
3. ✅ Usar helpers `getAPI/postAPI/putAPI/deleteAPI` no frontend
4. ✅ Manter RLS ativo
5. ✅ Adicionar logs para debug
6. ✅ **Documentar mudanças** (fixes em `docs/fixes/`, estrutura em `components.json`)
7. ✅ **Atualizar `components.json`** ao adicionar/remover libs ou componentes

### NUNCA:
1. ❌ Usar `asyncpg` ou conexões SQL diretas
2. ❌ Fazer `fetch()` direto no frontend
3. ❌ Criar endpoints sem autenticação
4. ❌ Expor dados de outros usuários
5. ❌ Commitar secrets no código
6. ❌ **Fazer mudanças sem documentar**
7. ❌ **Esquecer de atualizar `components.json`**

---

## 📚 Documentos de Referência

- **Estrutura do Projeto**: [components.json](components.json)
- **Visão Geral**: [README.md](README.md)
- **Guia Rápido**: [docs/QUICK_START.md](docs/QUICK_START.md)
- **Índice de Docs**: [docs/README.md](docs/README.md)
- **Índice de Fixes**: [docs/fixes/README.md](docs/fixes/README.md)
- **Contexto para LLMs**: [.kiro/CONTEXT.md](.kiro/CONTEXT.md)

---

**Última atualização**: 2025-12-08
**Versão**: 1.1.0
