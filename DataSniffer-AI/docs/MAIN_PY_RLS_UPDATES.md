# Atualizações Necessárias no main.py para RLS

## Imports Necessários

Certifique-se de que estes imports estão no topo do arquivo:

```python
from src.auth import (
    sign_in, sign_up, sign_out, get_current_user, require_role,
    UserLogin, UserSignup, UserResponse, AuthResponse, close_supabase_client
)
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, WebSocket, WebSocketDisconnect, status, Depends
```

## Endpoints que PRECISAM ser atualizados

### 1. POST /start_proxy

**ANTES:**
```python
@app.post("/start_proxy")
def start_proxy(config: ProxyConfig, background_tasks: BackgroundTasks):
    session_id = database.add_session(config.target_url, config.method, config.custom_headers, config.body)
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
        user_id,
        config.custom_headers, 
        config.body
    )
```

### 2. GET /history

**ANTES:**
```python
@app.get("/history")
def get_history():
    return database.get_history()
```

**DEPOIS:**
```python
@app.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    return await database.get_history(user_id)
```

### 3. POST /analyze_with_browser

**ANTES:**
```python
@app.post("/analyze_with_browser")
async def analyze_with_browser(config: ProxyConfig):
    # ...
    session_id = database.add_session(config.target_url, config.method, config.custom_headers, config.body)
```

**DEPOIS:**
```python
@app.post("/analyze_with_browser")
async def analyze_with_browser(
    config: ProxyConfig,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    # ...
    session_id = await database.add_session(
        config.target_url, 
        config.method, 
        user_id,
        config.custom_headers, 
        config.body
    )
```

### 4. POST /crawl/{session_id}

**ANTES:**
```python
@app.post("/crawl/{session_id}")
async def start_crawling(session_id: int, max_depth: int = 3, base_url: Optional[str] = None):
    async def log_callback(data):
        database.add_crawl_log(session_id, data["type"], data["message"])
```

**DEPOIS:**
```python
@app.post("/crawl/{session_id}")
async def start_crawling(
    session_id: int, 
    max_depth: int = 3, 
    base_url: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    
    async def log_callback(data):
        await database.add_crawl_log(session_id, data["type"], data["message"], user_id)
```

### 5. POST /false_positive_rules

**ANTES:**
```python
@app.post("/false_positive_rules")
def create_false_positive_rule(rule_data: dict):
    rule_id = database.add_false_positive_rule(
        rule_type=rule_data["rule_type"],
        pattern=rule_data["pattern"],
        description=rule_data.get("description")
    )
```

**DEPOIS:**
```python
@app.post("/false_positive_rules")
async def create_false_positive_rule(
    rule_data: dict,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    rule_id = await database.add_false_positive_rule(
        rule_type=rule_data["rule_type"],
        pattern=rule_data["pattern"],
        user_id=user_id,
        description=rule_data.get("description")
    )
```

### 6. GET /false_positive_rules

**ANTES:**
```python
@app.get("/false_positive_rules")
def get_false_positive_rules():
    return database.get_false_positive_rules()
```

**DEPOIS:**
```python
@app.get("/false_positive_rules")
async def get_false_positive_rules(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    return await database.get_false_positive_rules(user_id)
```

### 7. WebSocket /ws/traffic_logs

**ATUALIZAR a parte que salva requests:**

**ANTES:**
```python
request_id = database.add_request(
    session_id=session_id,
    flow_id=str(data.get("id") or ""),
    url=str(data.get("url") or ""),
    method=str(data.get("method") or "GET"),
    status_code=int(data.get("status_code") or 0),
    response_time=float(data.get("response_time") or 0.0),
    request_headers=data.get("request_headers") or {},
    response_headers=data.get("response_headers") or {},
    response_body_snippet=str(data.get("response_body_snippet") or ""),
    vulnerabilities=filtered_vulns,
    raw_vulnerabilities=raw_vulns,
    request_body=data.get("request_body"),
    cookies=data.get("cookies")
)
```

**DEPOIS:**
```python
# Obter user_id da sessão
session_row = await database.supabase_db.fetchrow(
    "SELECT user_id FROM sessions WHERE id = $1", 
    session_id
)
user_id = session_row["user_id"] if session_row else None

request_id = await database.add_request(
    session_id=session_id,
    flow_id=str(data.get("id") or ""),
    url=str(data.get("url") or ""),
    method=str(data.get("method") or "GET"),
    status_code=int(data.get("status_code") or 0),
    response_time=float(data.get("response_time") or 0.0),
    request_headers=data.get("request_headers") or {},
    response_headers=data.get("response_headers") or {},
    response_body_snippet=str(data.get("response_body_snippet") or ""),
    vulnerabilities=filtered_vulns,
    raw_vulnerabilities=raw_vulns,
    user_id=user_id,
    request_body=data.get("request_body"),
    cookies=data.get("cookies")
)
```

### 8. POST /test_log

**ATUALIZAR:**

**ANTES:**
```python
session_id = database.add_session(
    target_url=log_data.get("url", "test"),
    method=log_data.get("method", "GET"),
    custom_headers=None,
    body=None
)
```

**DEPOIS:**
```python
# Para testes, usar um user_id padrão ou criar um usuário de teste
# Ou melhor: adicionar autenticação também neste endpoint
session_id = await database.add_session(
    target_url=log_data.get("url", "test"),
    method=log_data.get("method", "GET"),
    user_id="00000000-0000-0000-0000-000000000000",  # UUID de teste
    custom_headers=None,
    body=None
)
```

## Endpoints que NÃO precisam de autenticação

Estes endpoints podem permanecer públicos:
- `POST /validate-captcha`
- `POST /auth/signin`
- `POST /auth/signup`
- `POST /auth/signout`
- `GET /auth/me`
- `GET /auth/verify`

## Endpoints de Admin

Para endpoints que devem ser acessíveis apenas por admins, use:

```python
@app.get("/active_sessions")
async def get_active_sessions(current_user: dict = Depends(require_role("admin"))):
    # Apenas admins podem ver todas as sessões ativas
    query = """
        SELECT s.id, u.email as user, s.timestamp as start
        FROM sessions s
        LEFT JOIN users u ON s.user_id = u.id
        ORDER BY s.timestamp DESC
        LIMIT 10
    """
    rows = await supabase_db.fetch_json(query)
    # ...
```

## Checklist de Atualização

- [ ] Adicionar `Depends(get_current_user)` em todos os endpoints protegidos
- [ ] Passar `user_id` para todas as funções de database que inserem dados
- [ ] Atualizar WebSocket para obter `user_id` da sessão
- [ ] Converter funções síncronas em assíncronas onde necessário
- [ ] Testar com múltiplos usuários
- [ ] Verificar que RLS está funcionando (usuários não veem dados de outros)

## Importante

1. **Todas as funções de database agora são async** - use `await`
2. **Endpoints protegidos devem ser async** - adicione `async def`
3. **user_id é obrigatório** - sempre passe para funções de insert
4. **RLS cuida do resto** - não precisa filtrar manualmente em queries SELECT
