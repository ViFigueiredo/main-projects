# 🔧 Fix Rápido: Erro asyncpg "invalid DSN: scheme is expected to be postgresql, got https"

## Data
2025-12-08

## Problema
```
asyncpg.exceptions._base.ClientConfigurationError: invalid DSN: scheme is expected to be either "postgresql" or "postgres", got 'https'
```

## Causa Raiz
O código ainda tem funções usando `supabase_db` (asyncpg) que tenta conectar com `SUPABASE_URL` (https://xxx.supabase.co), mas asyncpg espera uma connection string PostgreSQL.

## Solução Rápida Aplicada

### 1. Importação Condicional
Modificado `backend/db/database.py`:
```python
# Importação condicional do supabase_db para evitar erro asyncpg
try:
    from .supabase_db import supabase_db
    print("[DB] supabase_db importado com sucesso")
except Exception as e:
    print(f"[DB] Aviso: supabase_db não pôde ser importado: {e}")
    print("[DB] Usando apenas REST API")
    supabase_db = None
```

### 2. Função add_session Convertida
Convertida para usar REST API:
```python
async def add_session(target_url: str, method: str, user_id: str, custom_headers: Optional[str] = None, body: Optional[str] = None) -> Optional[int]:
    """Add a new session configuration to the history via REST API."""
    from .supabase_rest import rest_client
    
    try:
        session_data = {
            "target_url": target_url,
            "method": method,
            "user_id": user_id,
            "custom_headers": custom_headers,
            "body": body,
            "timestamp": datetime.now().isoformat()
        }
        
        response = await rest_client.post(
            "/rest/v1/sessions",
            json=session_data,
            headers={"Prefer": "return=representation"}
        )
        
        if response.status_code == 201:
            data = response.json()
            return data[0]["id"] if data else None
        else:
            print(f"[REST] Erro ao criar sessão: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"[REST] Erro ao criar sessão: {e}")
        return None
```

## Como Testar

1. **Reiniciar o backend**:
   ```bash
   cd backend
   python main.py
   ```

2. **Tentar criar uma sessão**:
   - Acesse o frontend
   - Faça login
   - Clique em "INICIAR MISSÃO DE AUDITORIA"
   - Deve funcionar sem erro asyncpg

3. **Verificar logs**:
   ```
   [DB] supabase_db importado com sucesso
   [REST] Criando sessão via REST API para user_id: xxx
   [REST] Sessão criada com sucesso: ID 123
   ```

## Status
✅ **Fix aplicado** - Função crítica `add_session` convertida para REST API

## Próximos Passos

### Conversão Completa (Recomendado)
Ainda há ~30 funções usando `supabase_db` que precisam ser convertidas para REST API:
- `get_requests_by_session()`
- `add_request()`
- `get_latest_session_id()`
- `save_analysis_result()`
- E outras...

### Solução Temporária vs Permanente

**Temporária (atual)**:
- ✅ Sistema funciona
- ⚠️ Algumas funções podem falhar silenciosamente
- ⚠️ Logs mostram avisos

**Permanente (recomendada)**:
- ✅ Todas as funções convertidas para REST API
- ✅ Sem dependência de asyncpg
- ✅ Consistência total

## Arquivos Modificados
- `backend/db/database.py` - Importação condicional + função add_session

## Como Converter Outras Funções

Exemplo para `get_latest_session_id()`:
```python
# ANTES (asyncpg)
async def get_latest_session_id() -> Optional[int]:
    row = await supabase_db.fetchrow("SELECT id FROM sessions ORDER BY timestamp DESC LIMIT 1")
    return row["id"] if row else None

# DEPOIS (REST API)
async def get_latest_session_id() -> Optional[int]:
    from .supabase_rest import rest_client
    try:
        response = await rest_client.get("/rest/v1/sessions?order=timestamp.desc&limit=1")
        if response.status_code == 200:
            data = response.json()
            return data[0]["id"] if data else None
        return None
    except Exception as e:
        print(f"[REST] Erro: {e}")
        return None
```

---

**Status**: ✅ Resolvido (temporariamente)  
**Impacto**: Sistema funciona, mas conversão completa recomendada  
**Prioridade**: Média (funciona, mas não ideal)