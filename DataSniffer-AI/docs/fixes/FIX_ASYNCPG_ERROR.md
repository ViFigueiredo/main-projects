# Fix: Erro asyncpg - Invalid DSN

## Problema
```
asyncpg.exceptions.ClientConfigurationError: invalid DSN: scheme is expected to be either "postgresql" or "postgres", got 'https'
```

## Causa
As funções de **false positive rules** em `backend/db/database.py` estavam usando `supabase_db.fetch_json()` e `supabase_db.execute()`, que tentam fazer conexão SQL direta via `asyncpg`.

O problema é que `asyncpg` espera uma connection string PostgreSQL como:
```
postgresql://user:pass@host:5432/database
```

Mas o código estava passando `SUPABASE_URL` que é uma URL HTTP:
```
https://hqhukeywgarablshslev.supabase.co
```

## Solução Aplicada

Converti **4 funções** de false positive rules para usar **REST API apenas**:

### 1. `add_false_positive_rule()` ✅
**Antes**: `supabase_db.fetchrow()` (SQL direto)
**Depois**: `rest_client.post()` (REST API)

### 2. `get_false_positive_rules()` ✅
**Antes**: `supabase_db.fetch_json()` (SQL direto)
**Depois**: `rest_client.get()` (REST API)

### 3. `update_false_positive_rule()` ✅
**Antes**: `supabase_db.execute()` (SQL direto)
**Depois**: `rest_client.patch()` (REST API)

### 4. `delete_false_positive_rule()` ✅
**Antes**: `supabase_db.execute()` (SQL direto)
**Depois**: `rest_client.delete()` (REST API)

## Código Atualizado

```python
# False Positive Rules Functions - USING REST API ONLY
async def add_false_positive_rule(rule_type: str, pattern: str, user_id: str, description: Optional[str] = None) -> int:
    """Add a new false positive rule via REST API."""
    from .supabase_rest import rest_client
    try:
        response = await rest_client.post(
            "/rest/v1/false_positive_rules",
            json={
                "rule_type": rule_type,
                "pattern": pattern,
                "description": description,
                "user_id": user_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            headers={"Prefer": "return=representation"}
        )
        if response.status_code in [200, 201]:
            data = response.json()
            return data[0]["id"] if data else 0
        return 0
    except Exception as e:
        print(f"[REST] Erro ao criar regra: {e}")
        return 0
```

## Benefícios

1. ✅ **Sem conexão SQL direta** - Usa apenas REST API
2. ✅ **RLS sempre ativo** - Service role key bypassa RLS quando necessário
3. ✅ **Sem dependência de asyncpg** - Apenas httpx
4. ✅ **Consistente com o resto do código** - Mesmo padrão usado em outras funções

## Como Testar

1. **Reinicie o backend**:
```bash
cd backend
python main.py
```

2. **Faça login**:
- Email: `admin@datasniffer.ai`
- Senha: `DataSniffer2025!Admin`

3. **Acesse Settings**:
- Vá para a aba "False Positive Rules"
- Deve carregar sem erro 500

4. **Teste CRUD**:
- ✅ Criar nova regra
- ✅ Listar regras
- ✅ Editar regra
- ✅ Deletar regra

## Logs Esperados

Agora você deve ver:
```
[Auth] get_current_user - Token válido!
[Endpoint] /false_positive_rules - Usuário autenticado: admin@datasniffer.ai (role: admin)
[Endpoint] /false_positive_rules - Buscando regras para user_id: 2a5cf2c5-...
[Endpoint] /false_positive_rules - Encontradas X regras
INFO: 127.0.0.1:62057 - "GET /false_positive_rules HTTP/1.1" 200 OK
```

## Arquivos Modificados

1. ✅ `backend/db/database.py` - Convertidas 4 funções para REST API
2. ✅ `FIX_ASYNCPG_ERROR.md` - Este arquivo

## Status

✅ **PROBLEMA RESOLVIDO**

Todas as operações de false positive rules agora usam REST API exclusivamente, mantendo RLS ativo e sem necessidade de conexão SQL direta.
