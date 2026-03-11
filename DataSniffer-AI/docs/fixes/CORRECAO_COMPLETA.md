# 🔧 Correção Completa - Passo a Passo

## 📋 Problemas Identificados

1. ❌ **JWT Error:** `module 'jwt' has no attribute 'encode'`
2. ⚠️ **Perfil não encontrado:** Precisa investigar por que não está achando

## ✅ Solução - Execute Estes Passos

### Passo 1: Corrigir JWT

Execute o script de correção:

```bash
cd backend
fix_jwt.bat
```

Ou manualmente:

```bash
cd backend
.venv\Scripts\activate
pip uninstall jwt -y
pip install --upgrade PyJWT
```

### Passo 2: Verificar Instalação

```bash
python -c "import jwt; print('PyJWT:', jwt.__version__); print('encode:', hasattr(jwt, 'encode'))"
```

Deve mostrar:
```
PyJWT: 2.8.0 (ou superior)
encode: True
```

### Passo 3: Reiniciar Backend

```bash
python main.py
```

### Passo 4: Testar Login

1. Acesse http://localhost:5173/login
2. Use as credenciais:
   - Email: `admin@datasniffer.ai`
   - Senha: `DataSniffer2025!Admin`
3. Clique em "Entrar"

### Passo 5: Verificar Logs

No console do backend, você deve ver:

```
[Auth] Tentando login para: admin@datasniffer.ai
[Auth] Resposta Supabase: 200
[Auth] User ID: 2a5cf2c5-51e4-4173-b6e6-9c07aac7e07d
[Auth] Buscando perfil para user_id: 2a5cf2c5-51e4-4173-b6e6-9c07aac7e07d
[Auth] Status da busca de perfil: 200
[Auth] Usuários encontrados: 1
[Auth] Perfil: {'id': '...', 'email': 'admin@datasniffer.ai', 'role': 'admin'}
[Auth] Token JWT criado com sucesso
```

## 🔍 Se o Perfil Não For Encontrado

Os logs vão mostrar o problema. Possíveis causas:

### Causa 1: Permissões RLS
A API REST pode estar bloqueada por RLS. Solução:

```sql
-- Execute no SQL Editor do Supabase
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para service_role (bypass RLS)
CREATE POLICY "Service role bypass" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### Causa 2: Header incorreto
Verifique se o `SUPABASE_SERVICE_ROLE_KEY` está correto no `.env`.

## 📝 Comandos Resumidos

```bash
# 1. Corrigir JWT
cd backend
.venv\Scripts\activate
pip uninstall jwt -y
pip install --upgrade PyJWT

# 2. Reiniciar backend
python main.py

# 3. Em outro terminal, iniciar frontend
cd frontend
pnpm dev

# 4. Testar login em http://localhost:5173/login
```

## ✅ Checklist

- [ ] JWT corrigido (sem erro de 'encode')
- [ ] Backend reiniciado
- [ ] Frontend rodando
- [ ] Login testado com admin@datasniffer.ai
- [ ] Logs mostram "Token JWT criado com sucesso"
- [ ] Redirecionado para a aplicação após login

## 🆘 Se Ainda Não Funcionar

Me envie os logs completos do backend quando tentar fazer login, especialmente:
- `[Auth] Status da busca de perfil: ???`
- `[Auth] Usuários encontrados: ???`
- Qualquer erro que aparecer

Vou ajudar a diagnosticar!
