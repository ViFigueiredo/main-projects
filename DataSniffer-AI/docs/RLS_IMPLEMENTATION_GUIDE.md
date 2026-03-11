# Guia de Implementação RLS - DataSniffer AI

## ✅ O QUE FOI FEITO NO BANCO DE DADOS

### 1. Schema Atualizado
- ✅ Adicionada coluna `user_id UUID` em todas as tabelas principais
- ✅ Criados índices para performance
- ✅ Tabela `users` agora referencia `auth.users` do Supabase
- ✅ RLS habilitado em todas as tabelas

### 2. Políticas RLS Criadas
- ✅ Usuários só podem ver/criar/editar seus próprios dados
- ✅ Admins podem ver todos os dados
- ✅ Função `is_admin()` para verificar role

### 3. Funções Auxiliares
- ✅ `handle_new_user()` - Cria perfil automaticamente no signup
- ✅ `promote_user_to_admin(email)` - Promove usuário a admin
- ✅ `demote_admin_to_user(email)` - Remove role de admin

### 4. Segurança Validada
- ✅ Nenhum problema de segurança detectado pelo Supabase Advisor
- ✅ Search path fixo em todas as funções
- ✅ RLS habilitado em todas as tabelas públicas

---

## 🔧 O QUE PRECISA SER ATUALIZADO NO CÓDIGO

### Passo 1: Atualizar `backend/db/database.py`

Todas as funções que inserem ou consultam dados precisam incluir `user_id`.

#### Exemplo: `add_session`

**ANTES:**
```python
async def add_session(target_url: str, method: str, custom_headers: Optional[str] = None, body: Optional[str] = None) -> Optional[int]:
    row = await supabase_db.fetchrow(
        """
        INSERT INTO sessions (target_url, method, custom_headers, body, timestamp)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        """, target_url, method, custom_headers, body, datetime.now()
    )
    return row["id"] if row else None
```

**DEPOIS:**
```python
async def add_session(target_url: str, method: str, user_id: str, custom_headers: Optional[str] = None, body: Optional[str] = None) -> Optional[int]:
    row = await supabase_db.fetchrow(
        """
        INSERT INTO sessions (target_url, method, user_id, custom_headers, body, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        """, target_url, method, user_id, custom_headers, body, datetime.now()
    )
    return row["id"] if row else None
```

#### Exemplo: `get_history`

**ANTES:**
```python
async def get_history() -> List[Dict[str, Any]]:
    sessions = await supabase_db.fetch_json("SELECT * FROM sessions ORDER BY timestamp DESC")
    # ...
```

**DEPOIS:**
```python
async def get_history(user_id: str) -> List[Dict[str, Any]]:
    # RLS vai filtrar automaticamente, mas é bom ser explícito
    sessions = await supabase_db.fetch_json(
        "SELECT * FROM sessions WHERE user_id = $1 ORDER BY timestamp DESC",
        user_id
    )
    # ...
```

#### Funções que precisam ser atualizadas:

1. ✅ `add_session` - adicionar parâmetro `user_id`
2. ✅ `get_history` - filtrar por `user_id`
3. ✅ `add_request` - adicionar parâmetro `user_id`
4. ✅ `get_requests_by_session` - já filtra por session, mas session tem user_id (RLS cuida)
5. ✅ `add_crawl_log` - adicionar parâmetro `user_id`
6. ✅ `add_false_positive_rule` - adicionar parâmetro `user_id`
7. ✅ `get_false_positive_rules` - filtrar por `user_id`

---

### Passo 2: Atualizar `backend/main.py`

Todos os endpoints precisam usar `Depends(get_current_user)` para obter o `user_id`.

#### Exemplo: `/start_proxy`

**ANTES:**
```python
@app.post("/start_proxy")
async def start_proxy(config: ProxyConfig, background_tasks: BackgroundTasks):
    session_id = database.add_session(config.target_url, config.method, config.custom_headers, config.body)
    # ...
```

**DEPOIS:**
```python
@app.post("/start_proxy")
async def start_proxy(
    config: ProxyConfig, 
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    session_id = await database.add_session(
        config.target_url, 
        config.method, 
        user_id,  # ✅ PASSAR user_id
        config.custom_headers, 
        config.body
    )
    # ...
```

#### Endpoints que precisam ser atualizados:

1. ✅ `POST /start_proxy` - adicionar `Depends(get_current_user)`
2. ✅ `GET /history` - adicionar `Depends(get_current_user)` e passar `user_id`
3. ✅ `POST /analyze_with_browser` - adicionar `Depends(get_current_user)`
4. ✅ `GET /requests/{session_id}` - adicionar `Depends(get_current_user)` (RLS cuida)
5. ✅ `POST /crawl/{session_id}` - adicionar `Depends(get_current_user)`
6. ✅ `POST /false_positive_rules` - adicionar `Depends(get_current_user)`
7. ✅ `GET /false_positive_rules` - adicionar `Depends(get_current_user)`

---

### Passo 3: Atualizar `backend/src/auth.py`

A função `create_user_profile` não é mais necessária, pois o trigger `handle_new_user()` faz isso automaticamente.

**REMOVER:**
```python
async def create_user_profile(user_id: str, email: str, role: str = "user") -> bool:
    # ... pode remover esta função
```

**ATUALIZAR `sign_up`:**
```python
async def sign_up(email: str, password: str) -> AuthResponse:
    try:
        # Cria usuário no Supabase Auth
        response = await supabase_client.post(
            "/auth/v1/signup",
            json={
                "email": email,
                "password": password
            }
        )
        
        if response.status_code in [200, 201]:
            auth_data = response.json()
            user_id = auth_data.get("user", {}).get("id")
            
            # ✅ O trigger handle_new_user() cria o perfil automaticamente
            # Aguardar um pouco para o trigger executar
            await asyncio.sleep(0.5)
            
            # Buscar perfil criado
            profile = await get_user_profile(user_id)
            
            # ... resto do código
```

---

### Passo 4: Criar Primeiro Usuário Admin

Execute no SQL Editor do Supabase:

```sql
-- Criar usuário admin via auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@datasniffer.ai',
  crypt('SUA_SENHA_AQUI', gen_salt('bf')),
  NOW(),
  '{"role": "admin"}'::jsonb,
  NOW(),
  NOW()
);

-- Verificar se o perfil foi criado automaticamente
SELECT * FROM public.users WHERE email = 'admin@datasniffer.ai';
```

Ou promover um usuário existente:

```sql
SELECT public.promote_user_to_admin('usuario@example.com');
```

---

## 🧪 COMO TESTAR

### 1. Criar dois usuários diferentes
```bash
# Usuário 1
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@test.com", "password": "test123"}'

# Usuário 2
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@test.com", "password": "test123"}'
```

### 2. Fazer login e obter tokens
```bash
# Login usuário 1
TOKEN1=$(curl -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@test.com", "password": "test123"}' \
  | jq -r '.session.access_token')

# Login usuário 2
TOKEN2=$(curl -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@test.com", "password": "test123"}' \
  | jq -r '.session.access_token')
```

### 3. Criar sessão com usuário 1
```bash
curl -X POST http://localhost:5000/start_proxy \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"target_url": "https://example.com", "method": "GET"}'
```

### 4. Verificar isolamento
```bash
# Usuário 1 vê suas sessões
curl -X GET http://localhost:5000/history \
  -H "Authorization: Bearer $TOKEN1"

# Usuário 2 NÃO vê sessões do usuário 1
curl -X GET http://localhost:5000/history \
  -H "Authorization: Bearer $TOKEN2"
```

### 5. Testar admin
```bash
# Promover usuário 1 a admin
psql -h db.hqhukeywgarablshslev.supabase.co -U postgres -d postgres \
  -c "SELECT public.promote_user_to_admin('user1@test.com');"

# Admin vê todas as sessões
curl -X GET http://localhost:5000/history \
  -H "Authorization: Bearer $TOKEN1"
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Banco de Dados
- [x] Adicionar coluna `user_id` em todas as tabelas
- [x] Criar índices para performance
- [x] Atualizar tabela `users` para referenciar `auth.users`
- [x] Criar políticas RLS
- [x] Criar função `is_admin()`
- [x] Criar trigger `handle_new_user()`
- [x] Criar funções de promoção/demoção de admin
- [x] Validar segurança com Advisor

### Código Backend
- [ ] Atualizar `database.py` - adicionar `user_id` em todas as funções
- [ ] Atualizar `main.py` - adicionar `Depends(get_current_user)` em todos os endpoints
- [ ] Atualizar `auth.py` - remover `create_user_profile` e ajustar `sign_up`
- [ ] Testar com 2 usuários diferentes
- [ ] Testar com admin
- [ ] Verificar que dados são isolados

### Documentação
- [x] Criar guia de implementação
- [ ] Atualizar README com informações de RLS
- [ ] Documentar funções de admin

---

## 🎯 RESULTADO ESPERADO

Após implementar todas as mudanças:

✅ **Isolamento de Dados**
- Cada usuário vê apenas seus próprios dados
- Sessões, requisições, logs e regras são privadas

✅ **Controle de Acesso**
- Admins podem ver todos os dados
- Usuários comuns têm acesso limitado

✅ **Segurança**
- RLS habilitado em todas as tabelas
- Políticas validadas pelo Supabase Advisor
- Funções com search_path fixo

✅ **Automação**
- Perfis criados automaticamente no signup
- Trigger gerencia criação de usuários

---

## 🚨 IMPORTANTE

**NÃO ESQUEÇA:**
1. Todas as funções em `database.py` que inserem dados precisam receber `user_id`
2. Todos os endpoints em `main.py` precisam usar `Depends(get_current_user)`
3. O `user_id` deve ser extraído de `current_user["user_id"]`
4. Testar com múltiplos usuários antes de deploy

**ORDEM DE IMPLEMENTAÇÃO:**
1. ✅ Banco de dados (já feito via MCP)
2. ⏳ Atualizar `database.py`
3. ⏳ Atualizar `main.py`
4. ⏳ Atualizar `auth.py`
5. ⏳ Testar isolamento
6. ⏳ Criar usuário admin
7. ⏳ Deploy
