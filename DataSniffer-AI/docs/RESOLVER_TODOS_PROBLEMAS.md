# 🔧 Resolver Todos os Problemas - Guia Completo

## 📋 Problemas Identificados

1. ❌ **Perfil retorna `[]`** - RLS bloqueando API REST
2. ❌ **Erro asyncpg DSN** - Falta connection string do Postgres
3. ❌ **Erro coroutine** - Funções async não aguardadas

## ✅ Solução Completa

### Problema 1: Connection String do Postgres

O `supabase_db.py` precisa da connection string do Postgres, não da URL HTTP.

#### Passo 1: Obter Connection String

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Database**
4. Role até **Connection string**
5. Selecione **URI** (não Pooler!)
6. Copie a string que começa com `postgresql://`
   - Exemplo: `postgresql://postgres.xxx:password@aws-0-us-west-2.pooler.supabase.com:5432/postgres`

#### Passo 2: Adicionar no `.env`

Edite `backend/.env` e adicione:

```env
# Connection string do Postgres (para asyncpg)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres

# URL HTTP do Supabase (para API REST)
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

**IMPORTANTE:** Substitua `[YOUR-PASSWORD]` pela senha do banco!

### Problema 2: Perfil Retorna Array Vazio

A API REST está bloqueada por RLS. Vamos usar SQL direto que bypassa RLS.

#### Solução: Modificar `get_user_profile` para usar SQL

Edite `backend/src/auth.py` e substitua a função `get_user_profile`:

```python
async def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Busca perfil do usuário na tabela users via SQL direto (bypassa RLS)"""
    try:
        from db.supabase_db import supabase_db
        
        print(f"[Auth] Buscando perfil para user_id: {user_id}")
        
        query = "SELECT id, email, role, created_at, updated_at FROM public.users WHERE id = $1"
        rows = await supabase_db.fetch_json(query, user_id)
        
        print(f"[Auth] Usuários encontrados: {len(rows)}")
        if rows:
            print(f"[Auth] Perfil: {rows[0]}")
            return rows[0]
        
        return None
    except Exception as e:
        import traceback
        print(f"[Auth] Erro ao buscar perfil: {e}")
        print(f"[Auth] Traceback: {traceback.format_exc()}")
        return None
```

### Problema 3: Funções Async Não Aguardadas

Alguns endpoints estão chamando funções async sem `await`.

#### Verificar e Corrigir

No `backend/main.py`, procure por funções que retornam coroutines e adicione `await`.

## 🔄 Passos para Aplicar

### 1. Obter Connection String

```
Dashboard Supabase → Settings → Database → Connection string (URI)
```

### 2. Atualizar `.env`

```env
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@...
SUPABASE_URL=https://[REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-key
```

### 3. Atualizar `auth.py`

Substituir função `get_user_profile` pelo código acima.

### 4. Reiniciar Backend

```bash
cd backend
python main.py
```

### 5. Testar Login

Acesse http://localhost:5173/login e faça login.

## 📊 Logs Esperados

Depois das correções:

```
[Auth] Tentando login para: admin@datasniffer.ai
[Auth] Resposta Supabase: 200
[Auth] User ID: 2a5cf2c5-51e4-4173-b6e6-9c07aac7e07d
[Auth] Buscando perfil para user_id: 2a5cf2c5-51e4-4173-b6e6-9c07aac7e07d
[Auth] Usuários encontrados: 1  ✅
[Auth] Perfil: {'id': '...', 'email': 'admin@datasniffer.ai', 'role': 'admin'}
[Auth] Token JWT criado com sucesso
```

E o endpoint `/requests` deve funcionar sem erro!

## ⚠️ Importante

A senha do Postgres é a mesma que você definiu quando criou o projeto no Supabase. Se não lembra:

1. Vá em **Settings** → **Database**
2. Clique em **Reset database password**
3. Defina uma nova senha
4. Use essa senha na connection string

## 📋 Checklist

- [ ] Obtive a connection string do Postgres
- [ ] Adicionei `DATABASE_URL` no `.env`
- [ ] Atualizei função `get_user_profile` em `auth.py`
- [ ] Reiniciei o backend
- [ ] Login funciona e perfil é encontrado
- [ ] Endpoint `/requests` funciona
- [ ] Cadeados sumiram no frontend
