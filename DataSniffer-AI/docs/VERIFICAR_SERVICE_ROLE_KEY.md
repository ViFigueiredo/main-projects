# 🔐 Verificar Service Role Key

## 🎯 Problema

A API REST está retornando array vazio `[]` mesmo com a política RLS "Service role bypass" configurada.

**Causa provável:** A `SUPABASE_SERVICE_ROLE_KEY` no `.env` pode estar incorreta ou ser a chave `anon` em vez da `service_role`.

## ✅ Como Verificar

### Passo 1: Obter a Chave Correta

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto **DataSnifferAI**
3. Vá em **Settings** (⚙️) → **API**
4. Role até **Project API keys**
5. Procure por **`service_role`** (NÃO a `anon`!)

Você verá algo assim:

```
┌─────────────────────────────────────────┐
│ Project API keys                        │
├─────────────────────────────────────────┤
│ anon                                    │
│ public                                  │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
│                                         │
│ service_role                            │
│ secret                                  │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
│ ⚠️ This key has the ability to bypass  │
│ Row Level Security. Never share it.    │
└─────────────────────────────────────────┘
```

### Passo 2: Copiar a Chave Correta

Clique em **Reveal** ou no ícone de copiar na chave **service_role**.

A chave correta:
- ✅ Começa com `eyJ...`
- ✅ É bem longa (~200+ caracteres)
- ✅ Tem aviso "bypass Row Level Security"
- ✅ Está marcada como "secret"

### Passo 3: Atualizar o `.env`

Edite `backend/.env`:

```env
# IMPORTANTE: Use a service_role, NÃO a anon!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaHVrZXl3Z2FyYWJsc2hzbGV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIwNTk1OCwiZXhwIjoyMDgwNzgxOTU4fQ...
```

### Passo 4: Verificar a Chave

Você pode decodificar o JWT para verificar se é a chave correta:

1. Vá em https://jwt.io
2. Cole sua chave
3. Verifique o payload:

```json
{
  "iss": "supabase",
  "ref": "hqhukeywgarablshslev",
  "role": "service_role",  ← DEVE SER "service_role"!
  "iat": 1765205958,
  "exp": 2080781958
}
```

Se o `"role"` for `"anon"`, você está usando a chave errada!

### Passo 5: Reiniciar Backend

```bash
cd backend
python main.py
```

### Passo 6: Testar Login

Faça login e verifique os logs:

```
[Auth] SUPABASE_URL: https://hqhukeywgarablshslev.supabase.co
[Auth] Service Key (primeiros 20 chars): eyJhbGciOiJIUzI1NiIs...
[Auth] Usuários encontrados: 1  ✅ DEVE SER 1!
```

## 🔍 Diferença Entre as Chaves

| Chave | Role | Bypassa RLS? | Uso |
|-------|------|--------------|-----|
| `anon` | anon | ❌ Não | Frontend público |
| `service_role` | service_role | ✅ Sim | Backend privado |

## ⚠️ Importante

A chave `service_role`:
- ✅ Bypassa RLS automaticamente
- ✅ Tem acesso total ao banco
- ⚠️ NUNCA deve ser exposta no frontend
- ⚠️ NUNCA deve ser commitada no Git
- ✅ Só deve ser usada no backend

## 📋 Checklist

- [ ] Acessei Settings → API no Supabase
- [ ] Copiei a chave **service_role** (não a anon)
- [ ] Verifiquei no jwt.io que o role é "service_role"
- [ ] Atualizei `SUPABASE_SERVICE_ROLE_KEY` no `.env`
- [ ] Reiniciei o backend
- [ ] Testei login e perfil foi encontrado

## 🎯 Resultado Esperado

Depois de usar a chave correta:

```
[Auth] Usuários encontrados: 1  ✅
[Auth] Perfil: {'id': '...', 'email': 'admin@datasniffer.ai', 'role': 'admin'}
```

Se ainda retornar 0, me avise e vamos investigar mais!
