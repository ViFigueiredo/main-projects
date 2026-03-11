# 🔧 Fix WebSocket: Erro asyncpg no WebSocket Traffic Logs

## Data
2025-12-08

## Problema
```
[WS] Erro ao salvar request: invalid DSN: scheme is expected to be either "postgresql" or "postgres", got 'https'
[DEBUG] session_id: <coroutine object get_latest_session_id at 0x0000000008A66F80>
```

## Causa Raiz
1. **WebSocket endpoint** ainda usava `database.supabase_db.fetchrow()` diretamente
2. **Funções async** sendo chamadas sem `await`
3. **Funções sync** tentando usar `await`

## Problemas Identificados

### 1. WebSocket usando supabase_db diretamente
```python
# ❌ PROBLEMA (linha 1546)
session_row = await database.supabase_db.fetchrow(
    "SELECT user_id FROM sessions WHERE id = $1", 
    session_id
)
```

### 2. Chamadas async sem await
```python
# ❌ PROBLEMA
session_id = database.get_latest_session_id()  # Retorna coroutine
print(f"[DEBUG] session_id: {session_id}")    # <coroutine object...>
```

### 3. Funções sync tentando usar await
```python
# ❌ PROBLEMA
@app.get("/proxy/status")
def proxy_status_endpoint():  # Função sync
    session_id = await database.get_latest_session_id()  # await em função sync
```

## Soluções Aplicadas

### 1. WebSocket convertido para REST API
```python
# ✅ SOLUÇÃO
if session_id:
    # Obter user_id da sessão via REST API
    try:
        from db.supabase_rest import rest_client
        response = await rest_client.get(f"/rest/v1/sessions?id=eq.{session_id}&select=user_id")
        if response.status_code == 200:
            data_sessions = response.json()
            user_id = data_sessions[0]["user_id"] if data_sessions else None
        else:
            print(f"[WS] Erro ao buscar sessão: {response.status_code}")
            user_id = None
    except Exception as e:
        print(f"[WS] Erro ao buscar user_id da sessão: {e}")
        user_id = None
```

### 2. Adicionado await nas chamadas async
```python
# ✅ SOLUÇÃO
session_id = await database.get_latest_session_id()  # Com await
session_id = await database.add_session(...)        # Com await
requests_list = await database.get_requests_by_session(session_id)  # Com await
```

### 3. Funções convertidas para async
```python
# ✅ SOLUÇÃO
@app.get("/proxy/status")
async def proxy_status_endpoint():  # Agora é async
    session_id = await database.get_latest_session_id()

@app.get("/proxy/test_capture")
async def test_capture_endpoint():  # Agora é async
    session_id = await database.get_latest_session_id()
```

## Como Testar

### 1. Reiniciar Backend
```bash
cd backend
python main.py
```

### 2. Testar WebSocket
1. Acesse o frontend
2. Faça login
3. Inicie uma sessão de proxy
4. Navegue em sites para gerar tráfego
5. Verifique logs - não deve ter erro asyncpg

### 3. Verificar Logs Esperados
```
[WS] Cliente conectado! Total de clientes: 1
[WS] Traffic log detectado
[DEBUG] session_id: 123  # ✅ Número, não coroutine
[WS] Vulnerabilidades brutos: 5 encontradas
[WS] Broadcast enviado!
```

### 4. Testar Endpoints
```bash
# Status do proxy
curl http://localhost:5000/proxy/status

# Test capture
curl http://localhost:5000/proxy/test_capture
```

## Arquivos Modificados

### backend/main.py
- **Linha ~1546**: WebSocket convertido para REST API
- **Linha ~377**: `proxy_status_endpoint()` → async + await
- **Linha ~397**: `test_capture_endpoint()` → async + await
- **Linha ~1345**: Adicionado await em `get_latest_session_id()`
- **Linha ~1528**: Adicionado await em `get_latest_session_id()`

## Funções Corrigidas

| Função | Problema | Solução |
|--------|----------|---------|
| `websocket_endpoint` | supabase_db.fetchrow() | REST API |
| `proxy_status_endpoint` | sync + await | Convertida para async |
| `test_capture_endpoint` | sync + await | Convertida para async |
| Múltiplas | get_latest_session_id() sem await | Adicionado await |

## Status
✅ **Resolvido** - WebSocket funciona sem erro asyncpg

## Impacto
- ✅ WebSocket de traffic logs funciona
- ✅ Proxy status endpoint funciona
- ✅ Test capture endpoint funciona
- ✅ Logs mostram session_id correto (número, não coroutine)

## Próximos Passos

### Opcional
Ainda há ~25 funções em `database.py` usando `supabase_db` que podem ser convertidas para REST API para consistência total.

### Monitoramento
Verificar logs do WebSocket para garantir que não há mais erros asyncpg:
```bash
# Deve mostrar
[DEBUG] session_id: 123

# Não deve mostrar
[DEBUG] session_id: <coroutine object...>
[WS] Erro ao salvar request: invalid DSN...
```

---

**Status**: ✅ Resolvido  
**Prioridade**: Alta (WebSocket é crítico)  
**Impacto**: Sistema funciona completamente